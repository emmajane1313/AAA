use ethers::{
    contract::ContractInstance,
    core::k256::ecdsa::SigningKey,
    middleware::SignerMiddleware,
    providers::{Http, Provider},
    signers::Wallet,
    types::U256,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TripleAAgent {
    pub id: u32,
    pub name: String,
    pub description: String,
    pub cover: String,
    pub wallet: String,
    pub clock: u32,
    pub last_active_time: u32,
    pub daily_active: u32,
}

#[derive(Debug, Clone)]
pub struct AgentManager {
    pub agent: TripleAAgent,
    pub current_queue: Vec<AgentActivity>,
    pub lens_hub_contract: Arc<
        ContractInstance<
            Arc<SignerMiddleware<Arc<Provider<Http>>, Wallet<SigningKey>>>,
            SignerMiddleware<Arc<Provider<Http>>, Wallet<SigningKey>>,
        >,
    >,
    pub agents_contract: Arc<
        ContractInstance<
            Arc<SignerMiddleware<Arc<Provider<Http>>, Wallet<SigningKey>>>,
            SignerMiddleware<Arc<Provider<Http>>, Wallet<SigningKey>>,
        >,
    >,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct Collection {
    pub image: String,
    pub title: String,
    pub description: String,
    pub artist: String,
    pub collection_id: U256,
    pub prices: Vec<U256>,
    pub tokens: Vec<String>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct AgentActivity {
    pub collection: Collection,
    pub token: String,
    pub amount: U256,
}
