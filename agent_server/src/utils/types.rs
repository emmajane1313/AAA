use ethers::{
    contract::ContractInstance,
    core::k256::ecdsa::SigningKey,
    middleware::SignerMiddleware,
    providers::{Http, Provider},
    signers::Wallet,
};
use std::sync::Arc;

#[derive(Debug, Clone)]
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
    pub dev_treasury_contract: Arc<
        ContractInstance<
            Arc<SignerMiddleware<Arc<Provider<Http>>, Wallet<SigningKey>>>,
            SignerMiddleware<Arc<Provider<Http>>, Wallet<SigningKey>>,
        >,
    >,
    pub market_contract: Arc<
        ContractInstance<
            Arc<SignerMiddleware<Arc<Provider<Http>>, Wallet<SigningKey>>>,
            SignerMiddleware<Arc<Provider<Http>>, Wallet<SigningKey>>,
        >,
    >,
}
