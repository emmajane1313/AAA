use crate::{
    utils::{
        constants::{AAA_URI, AGENTS, LENS_CHAIN_ID},
        contracts::{initialize_api, initialize_contracts},
        ipfs::upload_ipfs,
        lens::{handle_tokens, make_publication},
        llama::call_llama,
        types::{AgentManager, Content, Publication, TripleAAgent},
    },
    AgentActivity, Collection, Image, LlamaResponse, MetadataAttribute,
};
use chrono::{Timelike, Utc};
use ethers::{
    contract::{self, FunctionCall},
    middleware::{Middleware, SignerMiddleware},
    providers::{Http, Provider},
    signers::LocalWallet,
    types::{Address, Eip1559TransactionRequest, NameOrAddress, H160, H256, U256},
};
use reqwest::{get, Client};
use serde_json::{from_str, from_value, json, to_string, Value};
use std::{error::Error, io, str::FromStr, sync::Arc};
use tokio::time;
use uuid::Uuid;

impl AgentManager {
    pub fn new(agent: &TripleAAgent) -> Self {
        let agents_contract = initialize_contracts(&agent.name.to_string());
        initialize_api();

        return AgentManager {
            agent: agent.clone(),
            current_queue: Vec::new(),
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
                        Some(value) => from_value(value.clone())
                            .unwrap_or_else(|_| panic!("Error deserializing llm_message")),
                        None => panic!("llm_message key not found in ipfs_json"),
                    };

                    let collection: Collection = match ipfs_json.get("collection") {
                        Some(value) => from_value(value.clone())
                            .unwrap_or_else(|_| panic!("Error deserializing collection")),
                        None => panic!("collection key not found in ipfs_json"),
                    };

                    let tokens = handle_tokens(
                        &self.agent.name,
                        &self.agent.account_address,
                        self.tokens.clone(),
                    )
                    .await;

                    match tokens {
                        Ok(new_tokens) => {
                            self.tokens = Some(new_tokens);
                            match self.format_publication(&llm_message, &collection).await {
                                Ok(_) => {
                                    self.current_queue.retain(|item| {
                                        item.collection_id != collection.collection_id
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

    async fn test_llama_response(
        &mut self,
        json_data: &String,
    ) -> Result<(), Box<dyn Error + Send + Sync>> {
        let ipfs = json_data.strip_prefix("ipfs://").unwrap_or("");

        if ipfs.is_empty() {
            eprintln!("Error: Not valid IPFS JSON.");
            return Err(Box::new(io::Error::new(
                io::ErrorKind::Other,
                "Error: Not valid IPFS JSON.",
            )));
        }

        let ipfs_url = format!("https://thedial.infura-ipfs.io/ipfs/{}", ipfs);
        let response = get(ipfs_url).await;

        let response = match response {
            Ok(resp) => resp,
            Err(err) => {
                eprintln!("Error in IPFS response: {}", err);
                return Err(Box::new(io::Error::new(
                    io::ErrorKind::Other,
                    "Error in IPFS response",
                )));
            }
        };

        if !response.status().is_success() {
            eprintln!("Error with IPFS status {}", response.status());
            return Err(Box::new(io::Error::new(
                io::ErrorKind::Other,
                "Error with IPFS status.",
            )));
        }

        let content = match response.text().await {
            Ok(text) => text,
            Err(err) => {
                eprintln!("Error al leer el cuerpo de la respuesta IPFS: {}", err);
                return Err(Box::new(io::Error::new(
                    io::ErrorKind::Other,
                    "Error al leer el cuerpo de la respuesta IPFS.",
                )));
            }
        };

        match from_str::<Value>(&content) {
            Ok(ipfs_json) => {
                let llm_message: LlamaResponse = match ipfs_json.get("llm_message") {
                    Some(value) => from_value(value.clone())
                        .unwrap_or_else(|_| panic!("Error deserializing llm_message")),
                    None => panic!("llm_message key not found in ipfs_json"),
                };

                let mut collection: Value = match ipfs_json.get("collection") {
                    Some(value) => value.clone(),
                    None => panic!("collection key not found in ipfs_json"),
                };

                if let Some(num) = collection.get_mut("collection_id").and_then(|v| v.as_u64()) {
                    *collection.get_mut("collection_id").unwrap() =
                        Value::String(format!("{:#x}", num));
                }

                if let Some(prices) = collection.get_mut("prices").and_then(|v| v.as_array_mut()) {
                    for price in prices {
                        if let Some(f) = price.as_f64() {
                            *price = Value::String(format!("{:.0}", f));
                        }
                    }
                }

                let collection: Collection = from_value(collection).unwrap_or_else(|err| {
                    panic!("Error deserializing collection: {:?}", err);
                });

                let collection = Collection {
                    image: collection.image,
                    title: collection.title,
                    description: collection.description,
                    artist: collection.artist,
                    collection_id: U256::from(collection.collection_id),
                    prices: collection
                        .prices
                        .iter()
                        .map(|p| U256::from_dec_str(&p.to_string()).unwrap())
                        .collect(),
                    tokens: collection.tokens,
                };

                let tokens = handle_tokens(
                    &self.agent.name,
                    &self.agent.account_address,
                    self.tokens.clone(),
                )
                .await;

                match tokens {
                    Ok(new_tokens) => {
                        self.tokens = Some(new_tokens);
                        match self.format_publication(&llm_message, &collection).await {
                            Ok(_) => {
                                self.current_queue
                                    .retain(|item| item.collection_id != collection.collection_id);
                                Ok(())
                            }
                            Err(err) => {
                                eprintln!("Error in making lens post: {:?}", err);
                                return Err(Box::new(io::Error::new(
                                    io::ErrorKind::Other,
                                    "Error in making lens post",
                                )));
                            }
                        }
                    }

                    Err(err) => {
                        eprintln!("Error renewing Lens tokens: {:?}", err);
                        return Err(Box::new(io::Error::new(
                            io::ErrorKind::Other,
                            "Error renewing Lens tokens",
                        )));
                    }
                }
            }
            Err(err) => {
                eprintln!("Error in getting llama content: {:?}", err);
                return Err(Box::new(io::Error::new(
                    io::ErrorKind::Other,
                    "Error in getting llama content",
                )));
            }
        }
    }

    pub async fn resolve_activity(&mut self) -> Result<(), Box<dyn Error + Send + Sync>> {
        self.agent.last_active_time = Utc::now().num_seconds_from_midnight();
        if self.current_queue.len() > 0 {
            return Ok(());
        }

        let collections_info = self.get_collections_info().await;

        match collections_info {
            Ok(info) => {
                println!("Info {:?}\n", info);
                self.current_queue = info;

                // match self.pay_rent().await {
                //     Ok(_) => {
                self.queue_lens_activity().await;
                //     }
                //     Err(err) => {
                //         eprintln!("Error paying rent: {:?}", err);
                //     }
                // }
            }
            Err(err) => {
                eprintln!("Error obtaining collection information: {:?}", err);
            }
        }

        Ok(())
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
                        H160::from_str(token).unwrap(),
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
                                println!("Balance: {}\n", balance);
                                if balance >= U256::from(10u128.pow(17)) {
                                    rent_tokens.push(H160::from_str(token).unwrap());
                                    rent_amounts.push(U256::from(10u128.pow(17)));
                                    rent_collection_ids.push(collection.collection_id);
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

        println!(
            "Rent: {:?} {} {:?} {:?}\n",
            rent_amounts,
            rent_amounts.len(),
            rent_collection_ids.clone(),
            rent_tokens
        );

        if rent_amounts.len() > 0 {
            println!(
                "Method data {:?} {:?} {:?} {:?}",
                rent_tokens,
                rent_collection_ids.clone(),
                rent_amounts,
                self.agent.id
            );
            let method = self
                .agents_contract
                .method::<(Vec<Address>, Vec<U256>, Vec<U256>, U256), H256>(
                    "payRent",
                    (
                        rent_tokens.clone(),
                        rent_collection_ids.clone(),
                        rent_amounts.clone(),
                        U256::from(self.agent.id as u64),
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

                        println!("Transaction sent with hash: {:?}", tx_hash);

                        for collection in &rent_collection_ids {
                            self.current_queue
                                .retain(|item| &item.collection_id == collection);
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
        println!("Agent Id {}\n", self.agent.id);
        let query = json!({
            "query": r#"
            query ($AAAAgents_id: Int!) {
                agentCreateds(where: { AAAAgents_id: $AAAAgents_id }, first: 1) {
                    balances {
                        collection {
                            artist
                            collectionId
                            metadata {
                                description
                                image
                                title
                            }
                            prices
                            tokens
                        }
                        collectionId
                        token
                        totalBalance
                        activeBalance
                    }
                }
            }
            "#,
            "variables": {
                "AAAAgents_id": self.agent.id
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
                Ok(result) => {
                    println!("Result: {:?}\n", result);
                    let empty_vec = vec![];
                    let agent_createds = result["data"]["agentCreateds"]
                        .as_array()
                        .unwrap_or(&empty_vec);

                    let activities: Vec<AgentActivity> = agent_createds
                        .iter()
                        .flat_map(|agent_created| {
                            agent_created["balances"]
                                .as_array()
                                .unwrap_or(&vec![])
                                .iter()
                                .map(|balance| AgentActivity {
                                    collection: Collection {
                                        collection_id: U256::from_dec_str(
                                            balance["collection"]["collectionId"]
                                                .as_str()
                                                .unwrap_or("0"),
                                        )
                                        .unwrap_or_default(),
                                        artist: balance["collection"]["artist"]
                                            .as_str()
                                            .unwrap_or_default()
                                            .to_string(),
                                        image: balance["collection"]["metadata"]["image"]
                                            .as_str()
                                            .unwrap_or_default()
                                            .to_string(),
                                        title: balance["collection"]["metadata"]["title"]
                                            .as_str()
                                            .unwrap_or_default()
                                            .to_string(),
                                        description: balance["collection"]["metadata"]
                                            ["description"]
                                            .as_str()
                                            .unwrap_or_default()
                                            .to_string(),
                                        prices: balance["collection"]["prices"]
                                            .as_array()
                                            .unwrap_or(&vec![])
                                            .iter()
                                            .filter_map(|v| {
                                                v.as_str().and_then(|s| U256::from_dec_str(s).ok())
                                            })
                                            .collect(),
                                        tokens: balance["collection"]["tokens"]
                                            .as_array()
                                            .unwrap_or(&vec![])
                                            .iter()
                                            .filter_map(|v| v.as_str().map(|s| s.to_string()))
                                            .collect(),
                                    },
                                    token: balance["token"]
                                        .as_str()
                                        .unwrap_or_default()
                                        .to_string(),
                                    active_balance: U256::from_dec_str(
                                        balance["activeBalance"].as_str().unwrap_or("0"),
                                    )
                                    .unwrap(),
                                    total_balance: U256::from_dec_str(
                                        balance["totalBalance"].as_str().unwrap_or("0"),
                                    )
                                    .unwrap(),
                                    collection_id: U256::from_dec_str(
                                        balance["collectionId"].as_str().unwrap_or("0"),
                                    )
                                    .unwrap(),
                                })
                                .collect::<Vec<AgentActivity>>()
                        })
                        .collect();

                    println!("Activities {:?}\n", activities);

                    Ok(activities)
                }
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

        let queue = self.current_queue.clone();
        let queue_size = queue.len() as i64;
        let interval = if queue_size > 0 {
            adjusted_remaining_time / queue_size
        } else {
            0
        };
        println!("Agent Queue: {:?}\n", queue);

        for collection in queue {
            println!("Processing collection ID: {:?}\n", collection.collection_id);

            let json_data = String::from("ipfs://Qme3c7DuUu99sjUXrJebbe5AfbkCGntW39PnDVqPWceozn");

            let result = tokio::task::spawn_blocking({
                let json_data = json_data.clone();
                let mut self_cloned = self.clone();
                move || {
                    let rt = tokio::runtime::Handle::current();
                    rt.block_on(async move { self_cloned.test_llama_response(&json_data).await })
                }
            })
            .await;

            match result {
                Ok(Ok(_)) => {
                    eprintln!("Success post: \n");
                }
                Ok(Err(err)) => {
                    eprintln!("Error with test post: {:?}", err);
                }
                Err(err) => {
                    eprintln!("Failed to execute task: {:?}", err);
                }
            }

            if interval > 0 {
                time::sleep(std::time::Duration::from_secs(interval as u64)).await;
            }
        }

        println!("All lens activity processed for agent: {}\n", self.agent.id);
    }

    async fn format_publication(
        &self,
        llm_message: &LlamaResponse,
        collection: &Collection,
    ) -> Result<(), Box<dyn Error + Send + Sync>> {
        let focus = String::from("IMAGE");
        let schema = "https://json-schemas.lens.dev/posts/image/3.0.0.json".to_string();
        let tags = vec!["tripleA".to_string(), collection.collection_id.to_string()];

        let publication = Publication {
            schema,
            lens: Content {
                mainContentFocus: focus,
                title: llm_message.response.chars().take(20).collect(),
                content: llm_message.response.to_string(),
                id: Uuid::new_v4().to_string(),
                locale: "en".to_string(),
                tags,
                image: Image {
                    tipo: "image/png".to_string(),
                    item: collection.image.clone(),
                },
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

        let res = make_publication(
            &(String::from("lens://") + &content),
            &self.agent.name,
            &self.tokens.as_ref().unwrap().tokens.access_token,
        )
        .await
        .map_err(|e| Box::new(e.to_string()));

        match res {
            Ok(success) => {
                eprintln!("Post success: {:?}", success);
                Ok(())
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
