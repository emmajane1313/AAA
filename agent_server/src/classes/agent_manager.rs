use crate::{
    utils::{
        constants::{AAA_URI, ACCESS_CONTROLS, AGENTS, LENS_CHAIN_ID},
        contracts::{initialize_api, initialize_contracts},
        ipfs::upload_lens_storage,
        lens::{handle_lens_account, handle_tokens, make_publication},
        open_ai::call_chat_completion,
        types::{AgentManager, Content, Publication, TripleAAgent},
    },
    AgentActivity, Collection, Image,
};
use chrono::{Timelike, Utc};
use ethers::{
    contract::{self, FunctionCall},
    middleware::{Middleware, SignerMiddleware},
    providers::{Http, Provider},
    signers::LocalWallet,
    types::{Address, Eip1559TransactionRequest, NameOrAddress, H160, H256, U256},
};
use reqwest::Client;
use serde_json::{json, to_string, Value};
use std::{error::Error, io, str::FromStr, sync::Arc};
use tokio::{runtime::Runtime, time};
use uuid::Uuid;

impl AgentManager {
    pub fn new(agent: &TripleAAgent) -> Self {
        let (access_controls_contract, agents_contract) = initialize_contracts(agent.id);
        initialize_api();

        return AgentManager {
            agent: agent.clone(),
            current_queue: Vec::new(),
            agents_contract,
            access_controls_contract,
            tokens: None,
        };
    }

    pub async fn resolve_activity(&mut self) -> Result<(), Box<dyn Error + Send + Sync>> {
        self.agent.last_active_time = Utc::now().num_seconds_from_midnight();
        if self.current_queue.len() > 0 {
            return Ok(());
        }

        let collections_info = self.get_collections_info().await;

        match collections_info {
            Ok(info) => {
                self.current_queue = info.clone();

                if info.len() < 1 {
                    println!("No collections for agent this round.");
                    return Ok(());
                }

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

        Ok(())
    }

    async fn get_faucet_grass(&mut self) -> Result<(), Box<dyn Error + Send + Sync>> {
        let method = self
            .access_controls_contract
            .method::<_, U256>("getNativeGrassBalance", self.agent.wallet.clone());

        match method {
            Ok(call) => {
                let result: Result<
                    U256,
                    contract::ContractError<SignerMiddleware<Arc<Provider<Http>>, LocalWallet>>,
                > = call.call().await;

                match result {
                    Ok(balance) => {
                        println!("Agent Grass Balance: {}\n", balance);
                        if balance <= U256::from(1u128.pow(18)) {
                            let method = self
                                .access_controls_contract
                                .method::<_, H256>("faucet", self.agent.wallet.clone());

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
                                            from: Some(
                                                self.agent.wallet.parse::<Address>().unwrap(),
                                            ),
                                            to: Some(NameOrAddress::Address(
                                                ACCESS_CONTROLS.parse::<Address>().unwrap(),
                                            )),
                                            gas: Some(gas_limit),
                                            value: tx_request.value,
                                            data: tx_request.data.clone(),
                                            max_priority_fee_per_gas: Some(max_priority_fee),
                                            max_fee_per_gas: Some(gas_price + max_priority_fee),
                                            chain_id: Some(chain_id.into()),
                                            ..Default::default()
                                        };

                                        let pending_tx = match client
                                            .send_transaction(req, None)
                                            .await
                                        {
                                            Ok(tx) => tx,
                                            Err(e) => {
                                                eprintln!("Error sending the transaction to claim GRASS: {:?}", e);
                                                Err(Box::new(e))?
                                            }
                                        };

                                        let tx_hash = match pending_tx.confirmations(1).await {
                                            Ok(hash) => hash,
                                            Err(e) => {
                                                eprintln!(
                                                    "Error with transaction confirmation from Faucet: {:?}",
                                                    e
                                                );
                                                Err(Box::new(e))?
                                            }
                                        };

                                        println!(
                                            "Faucet GRASS Claimed {} TX Hash: {:?}",
                                            self.agent.id, tx_hash
                                        );

                                        return Ok(());
                                    } else {
                                        self.current_queue = Vec::new();
                                        eprintln!("Error in sending Faucet Transaction");
                                        return Err(Box::new(io::Error::new(
                                            io::ErrorKind::Other,
                                            "Error in sending Faucet Transaction",
                                        )));
                                    }
                                }

                                Err(err) => {
                                    self.current_queue = Vec::new();
                                    eprintln!("Error in method for Faucet claim: {:?}", err);
                                    return Err(Box::new(err));
                                }
                            }
                        } else {
                            return Ok(());
                        }
                    }
                    Err(err) => {
                        eprintln!("Error getting agent GRASS balance: {}", err);
                        return Err(Box::new(err));
                    }
                }
            }
            Err(err) => {
                eprintln!("Error claiming from faucet: {}", err);
                return Err(Box::new(err));
            }
        }
    }

    async fn pay_rent(&mut self) -> Result<(), Box<dyn Error + Send + Sync>> {
        let mut rent_tokens: Vec<H160> = vec![];
        let mut rent_collection_ids: Vec<U256> = vec![];

        let _ = self.get_faucet_grass().await;

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

                                let rent_method = self.access_controls_contract.method::<_, U256>(
                                    "getTokenDailyRent",
                                    (
                                        H160::from_str(token).unwrap(),
                                        self.agent.id,
                                        collection.collection.collection_id,
                                    ),
                                );

                                match rent_method {
                                    Ok(rent_call) => {
                                        let token_result: Result<
                                            U256,
                                            contract::ContractError<
                                                SignerMiddleware<Arc<Provider<Http>>, LocalWallet>,
                                            >,
                                        > = rent_call.call().await;

                                        match token_result {
                                            Ok(rent_threshold) => {
                                                if balance
                                                    >= (rent_threshold * collection.daily_frequency)
                                                {
                                                    rent_tokens
                                                        .push(H160::from_str(token).unwrap());
                                                    rent_collection_ids
                                                        .push(collection.collection_id);
                                                    break;
                                                }
                                            }
                                            Err(err) => {
                                                eprintln!("Error calling rent threshold: {}", err);
                                            }
                                        }
                                    }
                                    Err(err) => {
                                        eprintln!("Error in rent method: {}", err);
                                    }
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
            "Rent: {:?} {:?}\n",
            rent_collection_ids.clone(),
            rent_tokens
        );

        if rent_collection_ids.len() > 0 {
            println!(
                "Method data {:?} {:?} {}",
                rent_tokens,
                rent_collection_ids.clone(),
                self.agent.id
            );
            let method = self
                .agents_contract
                .method::<(Vec<Address>, Vec<U256>, U256), H256>(
                    "payRent",
                    (
                        rent_tokens.clone(),
                        rent_collection_ids.clone(),
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

                        println!("Agent {} TX Hash: {:?}", self.agent.id, tx_hash);
                        for collection in &rent_collection_ids {
                            self.current_queue
                                .retain(|item| &item.collection_id == collection);

                            let relevant_items: Vec<_> =
                                self.current_queue.iter().cloned().collect();

                            let mut expanded_list: Vec<_> = relevant_items
                                .iter()
                                .flat_map(|item| {
                                    vec![item.clone(); item.daily_frequency.low_u64() as usize]
                                })
                                .collect();

                            expanded_list.sort_by(|a, b| a.collection_id.cmp(&b.collection_id));

                            let mut reordered_list = Vec::new();
                            let mut i = 0;

                            while !expanded_list.is_empty() {
                                if let Some(item) = expanded_list.get(i % expanded_list.len()) {
                                    reordered_list.push(item.clone());
                                    expanded_list.remove(i % expanded_list.len());
                                }
                                i = (i + 1) % expanded_list.len().max(1);
                            }

                            self.current_queue.clear();
                            self.current_queue.extend(reordered_list);
                        }

                        println!("Final queue: {:?}", self.current_queue);

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
            println!("No collection Ids with sufficient tokens");
            Ok(())
        }
    }

    async fn get_collections_info(
        &self,
    ) -> Result<Vec<AgentActivity>, Box<dyn Error + Send + Sync>> {
        let client = Client::new();
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
                        instructions
                        dailyFrequency
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

        println!("{:?}\n", response);

        match response {
            Ok(result) => match result {
                Ok(result) => {
                    let empty_vec = vec![];
                    let agent_createds = result["data"]["agentCreateds"]
                        .as_array()
                        .unwrap_or(&empty_vec);
                    let rt = Runtime::new().unwrap();
                    let activities: Vec<AgentActivity> = agent_createds
                        .iter()
                        .flat_map(|agent_created| {
                            agent_created["balances"]
                                .as_array()
                                .unwrap_or(&vec![])
                                .iter()
                                .map(|balance| {
                                    let artist = balance["collection"]["artist"]
                                        .as_str()
                                        .unwrap_or_default()
                                        .to_string();
                                    let username = rt
                                        .block_on(handle_lens_account(&artist))
                                        .unwrap_or("lens_username".to_string());

                                    AgentActivity {
                                        collection: Collection {
                                            collection_id: U256::from_dec_str(
                                                balance["collection"]["collectionId"]
                                                    .as_str()
                                                    .unwrap_or("0"),
                                            )
                                            .unwrap_or_default(),
                                            artist,
                                            username,

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
                                                    v.as_str()
                                                        .and_then(|s| U256::from_dec_str(s).ok())
                                                })
                                                .collect(),
                                            tokens: balance["collection"]["tokens"]
                                                .as_array()
                                                .unwrap_or(&vec![])
                                                .iter()
                                                .filter_map(|v| v.as_str().map(|s| s.to_string()))
                                                .collect(),
                                        },
                                        daily_frequency: U256::from_dec_str(
                                            balance["dailyFrequency"].as_str().unwrap_or("0"),
                                        )
                                        .unwrap(),
                                        custom_instructions: balance["instructions"]
                                            .as_str()
                                            .unwrap_or_default()
                                            .to_string(),
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
                                    }
                                })
                                .collect::<Vec<AgentActivity>>()
                        })
                        .collect();

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

    async fn chat_and_post(&mut self, collection: &Collection, collection_instructions: &str) {
        match call_chat_completion(
            collection,
            &self.agent.custom_instructions,
            collection_instructions,
        )
        .await
        {
            Ok(llm_message) => {
                let tokens = handle_tokens(
                    self.agent.id,
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
                eprintln!("Error with OpenAI completion: {:?}", err);
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

        for collection in queue {
            let result = tokio::task::spawn_blocking({
                let mut self_cloned = self.clone();
                move || {
                    let rt = tokio::runtime::Handle::current();
                    rt.block_on(async move {
                        self_cloned
                            .chat_and_post(&collection.collection, &collection.custom_instructions)
                            .await
                    })
                }
            })
            .await;

            match result {
                Ok(_) => {
                    eprintln!("Success post\n");
                }
                Err(err) => {
                    eprintln!("Failed to execute task: {:?}", err);
                }
            }

            if interval > 0 {
                time::sleep(std::time::Duration::from_secs(interval as u64)).await;
            }
        }
    }

    async fn format_publication(
        &self,
        llm_message: &str,
        collection: &Collection,
    ) -> Result<(), Box<dyn Error + Send + Sync>> {
        let focus = String::from("IMAGE");
        let schema = "https://json-schemas.lens.dev/posts/image/3.0.0.json".to_string();
        let tags = vec![
            "tripleA".to_string(),
            collection.title.to_string().replace(" ", "").to_lowercase(),
        ];

        let publication = Publication {
            schema,
            lens: Content {
                mainContentFocus: focus,
                title: llm_message.chars().take(20).collect(),
                content: format!(
                    "{}\n\n Collect on TripleA here: https://triplea.agentmeme.xyz/nft/{}/{}/",
                    llm_message.to_string(),
                    collection.username,
                    collection.collection_id
                ),
                id: Uuid::new_v4().to_string(),
                locale: "en".to_string(),
                tags,
                image: Image {
                    tipo: "image/png".to_string(),
                    item: collection.image.clone(),
                },
            },
        };

        let publication_json = to_string(&publication)?;

        let content = match upload_lens_storage(publication_json).await {
            Ok(con) => con,
            Err(e) => {
                eprintln!("Error uploading content to Lens Storage: {}", e);
                return Err(Box::new(io::Error::new(
                    io::ErrorKind::Other,
                    format!("Error uploading content to Lens Storage: {}", e),
                )));
            }
        };

        let res = make_publication(
            &content,
            self.agent.id,
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
