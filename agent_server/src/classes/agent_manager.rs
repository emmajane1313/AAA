use crate::{
    utils::{
        constants::{AAA_URI, AGENTS, LENS_CHAIN_ID, LENS_HUB_PROXY, OPEN_ACTION_MODULE},
        contracts::{initialize_api, initialize_contracts},
        ipfs::upload_ipfs,
        lens::{handle_tokens, make_publication},
        llama::call_llama,
        types::{AgentManager, Content, MakePub, Publication, TripleAAgent},
    },
    AgentActivity, Collection, LlamaResponse, MetadataAttribute,
};
use chrono::{Timelike, Utc};
use ethers::{
    abi::{Token, Tokenize},
    contract::{self, FunctionCall},
    middleware::{Middleware, SignerMiddleware},
    providers::{Http, Provider},
    signers::LocalWallet,
    types::{Address, Bytes, Eip1559TransactionRequest, NameOrAddress, H160, H256, U256},
};
use reqwest::{get, Client};
use serde_json::{from_str, from_value, json, to_string, Value};
use std::{error::Error, io, str::FromStr, sync::Arc};
use tokio::time;
use uuid::Uuid;

impl AgentManager {
    pub fn new(agent: &TripleAAgent) -> Self {
        let (lens_hub_contract, agents_contract) = initialize_contracts(&agent.name.to_string());
        initialize_api();

        return AgentManager {
            agent: agent.clone(),
            current_queue: Vec::new(),
            lens_hub_contract,
            agents_contract,
            tokens: None,
        };
    }

    pub async fn llama_response(&mut self, json_data: &String) {
        if let Ok(parsed) = from_str::<Value>(&json_data) {
            let ipfs = parsed
                .get("json")
                .and_then(Value::as_str)
                .unwrap_or("")
                .strip_prefix("ipfs://")
                .unwrap_or("");

            if ipfs.is_empty() {
                eprintln!("Error: Not valid IPFS JSON.");
                return;
            }

            let ipfs_url = format!("https://thedial.infura-ipfs.io/ipfs/{}", ipfs);
            let response = get(ipfs_url).await;

            let response = match response {
                Ok(resp) => resp,
                Err(err) => {
                    eprintln!("Error in IPFS response: {}", err);
                    return;
                }
            };

            if !response.status().is_success() {
                eprintln!("Error with IPFS status {}", response.status());
                return;
            }

            let content = match response.text().await {
                Ok(text) => text,
                Err(err) => {
                    eprintln!("Error al leer el cuerpo de la respuesta IPFS: {}", err);
                    return;
                }
            };

            match from_str::<Value>(&content) {
                Ok(ipfs_json) => {
                    let llm_message: LlamaResponse = match ipfs_json.get("llm_message") {
                        Some(value) => serde_json::from_value(value.clone())
                            .unwrap_or_else(|_| panic!("Error deserializing llm_message")),
                        None => panic!("llm_message key not found in ipfs_json"),
                    };

                    let collection: Collection = match ipfs_json.get("collection") {
                        Some(value) => serde_json::from_value(value.clone())
                            .unwrap_or_else(|_| panic!("Error deserializing collection")),
                        None => panic!("collection key not found in ipfs_json"),
                    };

                    let tokens =
                        handle_tokens(&self.agent.name, self.agent.profile_id, self.tokens.clone())
                            .await;

                    match tokens {
                        Ok(new_tokens) => {
                            self.tokens = Some(new_tokens);
                            match self.format_publication(&llm_message, &collection).await {
                                Ok(_) => {
                                    self.current_queue.retain(|item| {
                                        item.collection.collection_id != collection.collection_id
                                    });
                                }
                                Err(err) => {
                                    eprintln!("Error in making lens post: {:?}", err);
                                }
                            }
                        }

                        Err(err) => {
                            eprintln!("Error renewing Lens tokens: {:?}", err);
                        }
                    }
                }
                Err(err) => {
                    eprintln!("Error in getting llama content: {:?}", err);
                }
            }
        }
    }

    pub async fn resolve_activity(&mut self) {
        self.agent.last_active_time = Utc::now().num_seconds_from_midnight();
        if self.current_queue.len() > 0 {
            return;
        }

        let collections_info = self.get_collections_info().await;

        match collections_info {
            Ok(info) => {
                self.current_queue = info;

                match self.pay_rent().await {
                    Ok(_) => {
                        self.queue_lens_activity().await;
                    }
                    Err(err) => {
                        eprintln!("Error paying rent: {:?}", err);
                    }
                }
            }
            Err(err) => {
                eprintln!("Error obtaining collection information: {:?}", err);
            }
        }
    }

    async fn pay_rent(&mut self) -> Result<(), Box<dyn Error + Send + Sync>> {
        let mut rent_amounts: Vec<U256> = Vec::new();
        let mut rent_tokens: Vec<H160> = vec![];
        let mut rent_collection_ids: Vec<U256> = vec![];

        for collection in &self.current_queue {
            for token in &collection.collection.tokens {
                let method = self.agents_contract.method::<_, U256>(
                    "getAgentActiveBalance",
                    (
                        token.to_string(),
                        self.agent.id,
                        collection.collection.collection_id,
                    ),
                );

                match method {
                    Ok(call) => {
                        let result: Result<
                            U256,
                            contract::ContractError<
                                SignerMiddleware<Arc<Provider<Http>>, LocalWallet>,
                            >,
                        > = call.call().await;

                        match result {
                            Ok(balance) => {
                                if balance >= U256::from(10 * 10u128.pow(18)) {
                                    rent_tokens.push(H160::from_str(token).unwrap());
                                    rent_amounts.push(U256::from(10 * 10u128.pow(18)));
                                    rent_collection_ids.push(collection.collection.collection_id);
                                }
                            }
                            Err(err) => {
                                eprintln!("Error calling token balance: {}", err);
                            }
                        }
                    }
                    Err(err) => {
                        eprintln!("Error getting active token balance: {}", err);
                    }
                }
            }
        }

        if rent_amounts.len() > 0 {
            let method = self
                .agents_contract
                .method::<(Vec<Address>, Vec<U256>, Vec<U256>, u32), H256>(
                    "payRent",
                    (
                        rent_tokens,
                        rent_collection_ids.clone(),
                        rent_amounts,
                        self.agent.id,
                    ),
                );

            match method {
                Ok(call) => {
                    let FunctionCall { tx, .. } = call;

                    if let Some(tx_request) = tx.as_eip1559_ref() {
                        let gas_price = U256::from(500_000_000_000u64);
                        let max_priority_fee = U256::from(25_000_000_000u64);
                        let gas_limit = U256::from(300_000);

                        let client = self.agents_contract.client().clone();
                        let chain_id = *LENS_CHAIN_ID;
                        let req = Eip1559TransactionRequest {
                            from: Some(self.agent.wallet.parse::<Address>().unwrap()),
                            to: Some(NameOrAddress::Address(AGENTS.parse::<Address>().unwrap())),
                            gas: Some(gas_limit),
                            value: tx_request.value,
                            data: tx_request.data.clone(),
                            max_priority_fee_per_gas: Some(max_priority_fee),
                            max_fee_per_gas: Some(gas_price + max_priority_fee),
                            chain_id: Some(chain_id.into()),
                            ..Default::default()
                        };

                        let pending_tx = match client.send_transaction(req, None).await {
                            Ok(tx) => tx,
                            Err(e) => {
                                eprintln!("Error sending the transaction for payRent: {:?}", e);
                                Err(Box::new(e))?
                            }
                        };

                        let tx_hash = match pending_tx.confirmations(1).await {
                            Ok(hash) => hash,
                            Err(e) => {
                                eprintln!("Error with transaction confirmation: {:?}", e);
                                Err(Box::new(e))?
                            }
                        };

                        println!("Transaction sent with has: {:?}", tx_hash);

                        for collection in &rent_collection_ids {
                            self.current_queue
                                .retain(|item| &item.collection.collection_id == collection);
                        }

                        Ok(())
                    } else {
                        self.current_queue = Vec::new();
                        eprintln!("Error in sending Transaction");
                        Err(Box::new(io::Error::new(
                            io::ErrorKind::Other,
                            "Error in sending Transaction",
                        )))
                    }
                }

                Err(err) => {
                    self.current_queue = Vec::new();
                    eprintln!("Error in create method for payRent: {:?}", err);
                    Err(Box::new(err))
                }
            }
        } else {
            self.current_queue = Vec::new();

            Ok(())
        }
    }

    async fn get_collections_info(
        &self,
    ) -> Result<Vec<AgentActivity>, Box<dyn Error + Send + Sync>> {
        let client = Client::new();
        let query = json!({
            "query": r#"
            query ($agentId: Int!) {
                agentActiveCollections(where: { agentId: $agentId }) {
                    id
                    agentId
                    collections {
                    collectionId
                    artist
                    amount
                    amountSold
                    prices
                    tokens
                    metadata {
                        image
                        title
                        description
                        }
                    }
                }
            }
        "#,
            "variables": {
                "agentId": self.agent.id
            }
        });

        let timeout_duration = std::time::Duration::from_secs(60);

        let response = time::timeout(timeout_duration, async {
            let res = client.post(AAA_URI).json(&query).send().await?;

            res.json::<Value>().await
        })
        .await;

        match response {
            Ok(result) => match result {
                Ok(result) => Ok(result["data"]["agentActiveCollections"]
                    .as_array()
                    .unwrap_or(&vec![])
                    .iter()
                    .map(|item| from_value::<AgentActivity>(item.clone()).unwrap())
                    .collect()),
                Err(err) => {
                    eprintln!("Error in response: {:?}", err);
                    Err(Box::new(err))
                }
            },
            Err(err) => {
                eprintln!("Time out: {:?}", err);
                Err(Box::new(io::Error::new(
                    io::ErrorKind::TimedOut,
                    format!("Timeout: {:?}", err),
                )))
            }
        }
    }

    async fn queue_lens_activity(&mut self) {
        let current_time = Utc::now().num_seconds_from_midnight() as i64;
        let remaining_time = self.agent.clock as i64 - current_time;

        let adjusted_remaining_time = if remaining_time > 0 {
            remaining_time
        } else {
            7200
        };

        let queue_size = self.current_queue.len() as i64;
        let interval = if queue_size > 0 {
            adjusted_remaining_time / queue_size
        } else {
            0
        };

        let mut i = 0;

        for collection in &self.current_queue {
            println!(
                "Processing collection ID: {:?}",
                collection.collection.collection_id
            );

            match call_llama(self.agent.profile_id, &collection.collection).await {
                Ok(_) => {}
                Err(err) => {
                    eprintln!("Error in call_llama: {:?}", err);
                }
            }

            i += 1;

            if interval > 0 {
                time::sleep(std::time::Duration::from_secs(interval as u64)).await;
            }
        }

        println!("All lens activity process for agent: {}", self.agent.id);
    }

    async fn format_publication(
        &self,
        llm_message: &LlamaResponse,
        collection: &Collection,
    ) -> Result<(), Box<dyn Error + Send + Sync>> {
        let focus = String::from("IMAGE");
        let schema = "https://json-schemas.lens.dev/publications/image/3.0.0.json".to_string();
        let tags = vec!["tripleA".to_string()];
        let app_id = "tripleA".to_string();

        let publication = Publication {
            schema,
            lens: Content {
                mainContentFocus: focus,
                title: llm_message.response.chars().take(20).collect(),
                content: llm_message.response.to_string(),
                appId: app_id,
                id: Uuid::new_v4().to_string(),
                hideFromFeed: false,
                locale: "en".to_string(),
                tags,
                image: Some(crate::Image {
                    tipo: "img/png".to_string(),
                    item: collection.image.clone(),
                }),
                attributes: vec![MetadataAttribute {
                    key: "llm_info".to_string(),
                    tipo: "String".to_string(),
                    value: llm_message.json.clone(),
                }]
                .into(),
            },
        };

        let publication_json = to_string(&publication)?;

        let content = match upload_ipfs(publication_json).await {
            Ok(con) => con.Hash,
            Err(e) => {
                eprintln!("Error uploading content to IPFS: {}", e);
                return Err(Box::new(io::Error::new(
                    io::ErrorKind::Other,
                    format!("Error uploading content to IPFS: {}", e),
                )));
            }
        };

        let message = MakePub {
        profileId:
        self.agent.profile_id,
        contentURI: String::from("ipfs://") + &content,
        actionModules: vec![OPEN_ACTION_MODULE.parse::<Address>()
        .unwrap()],
        actionModulesInitDatas: vec![
Bytes::from_str("0x000000000000000000000000185b529b421ff60b0f2388483b757b39103cfcb1000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000")?,
        ],
        referenceModule: "0x0000000000000000000000000000000000000000"
            .parse::<Address>()
            .unwrap(),
        referenceModuleInitData: Bytes::from(vec![0u8; 1]),
    };

        let method = self
            .lens_hub_contract
            .method::<_, U256>("post", (Token::Tuple(message.into_tokens()),))?;

        let res = make_publication(
            &self.agent.name,
            String::from("ipfs://") + &content,
            &self.tokens.as_ref().unwrap().tokens.access_token,
        )
        .await
        .map_err(|e| Box::new(e.to_string()));

        match res {
            Ok(result) if result != "RelaySuccess" => {
                let FunctionCall { tx, .. } = method;

                if let Some(tx_request) = tx.as_eip1559_ref() {
                    let client = self.lens_hub_contract.client().clone();
                    let gas_price = U256::from(500_000_000_000u64);
                    let max_priority_fee = U256::from(25_000_000_000u64);
                    let gas_limit = U256::from(300_000);
                    let tx_cost = gas_limit * gas_price + max_priority_fee;

                    let balance = client
                        .clone()
                        .get_balance(self.agent.wallet.parse::<Address>().unwrap(), None)
                        .await?;

                    if balance < tx_cost {
                        return Err(Box::new(io::Error::new(
                            io::ErrorKind::Other,
                            "Insufficient funds for gas",
                        )));
                    }

                    let chain = *LENS_CHAIN_ID;

                    let req = Eip1559TransactionRequest {
                        from: Some(self.agent.wallet.parse::<Address>().unwrap()),
                        to: Some(NameOrAddress::Address(
                            LENS_HUB_PROXY.parse::<Address>().unwrap(),
                        )),
                        gas: Some(gas_limit),
                        value: tx_request.value,
                        data: tx_request.data.clone(),
                        max_priority_fee_per_gas: Some(max_priority_fee),
                        max_fee_per_gas: Some(gas_price + max_priority_fee),
                        chain_id: Some(chain.into()),
                        ..Default::default()
                    };

                    let pending_tx = client.send_transaction(req, None).await.map_err(|e| {
                        eprintln!("Error sending transaction: {:?}", e);
                        Box::new(io::Error::new(
                            io::ErrorKind::Other,
                            format!("Error sending transaction: {:?}", e),
                        ))
                    })?;

                    let tx_hash = pending_tx.confirmations(1).await.map_err(|e| {
                        eprintln!("Error sending transaction: {:?}", e);
                        Box::new(io::Error::new(
                            io::ErrorKind::Other,
                            format!("Error sending transaction: {:?}", e),
                        ))
                    })?;

                    println!("Transaction sent with hash: {:?}", tx_hash);

                    Ok(())
                } else {
                    Err(Box::new(io::Error::new(
                        io::ErrorKind::Other,
                        "Error sending transaction",
                    )))
                }
            }
            Ok(other) => {
                eprintln!("Error sending message: {:?}", other);
                Err(Box::new(io::Error::new(
                    io::ErrorKind::Other,
                    "Error sending message",
                )))
            }
            Err(e) => {
                eprintln!("Error processing message: {:?}", e);
                Err(Box::new(io::Error::new(
                    io::ErrorKind::Other,
                    "Error sending message",
                )))
            }
        }
    }
}
