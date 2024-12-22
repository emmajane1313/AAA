use crate::{
    utils::{
        constants::{AAA_URI, AGENTS, LENS_CHAIN_ID},
        contracts::{initialize_api, initialize_contracts},
        types::{AgentManager, TripleAAgent},
    },
    AgentActivity,
};
use chrono::{Timelike, Utc};
use ethers::{
    contract::FunctionCall,
    middleware::Middleware,
    types::{Address, Eip1559TransactionRequest, NameOrAddress, H256, U256},
};
use reqwest::Client;
use serde_json::{from_value, json, Value};
use std::{error::Error, io};
use tokio::time;

impl AgentManager {
    pub fn new(agent: &TripleAAgent) -> Self {
        let (lens_hub_contract, agents_contract) = initialize_contracts(&agent.name.to_string());
        initialize_api();

        return AgentManager {
            agent: agent.clone(),
            current_queue: Vec::new(),
            lens_hub_contract,
            agents_contract,
        };
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

                self.pay_rent().await;

                self.queue_lens_activity();
            }
            Err(err) => {
                eprintln!("Error obtaining collection information: {:?}", err);
            }
        }
    }

    async fn pay_rent(&self) -> Result<(), Box<dyn Error + Send + Sync>> {
        let rent_amounts = vec![];

        let method = self.agents_contract.method::<_, H256>(
            "payRent",
            (
                self.current_queue
                    .iter()
                    .map(|item| item.collection.collection_id),
                vec![],
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

                    Ok(())
                } else {
                    eprintln!("Error in sending Transaction");
                    Err(Box::new("Error in sending Transaction".into()))
                }
            }

            Err(err) => {
                eprintln!("Error in create method for payRent: {:?}", err);
                Err(Box::new(err))
            }
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
                    err.to_string(),
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

        for collection in &self.current_queue {
            println!(
                "Processing collection ID: {:?}",
                collection.collection.collection_id
            );

            if interval > 0 {
                time::sleep(std::time::Duration::from_secs(interval as u64)).await;
            }
        }

        println!("All lens activity process for agent: {}", self.agent.id);
    }
}
