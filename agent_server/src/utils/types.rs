use ethers::{
    abi::Token,
    contract::ContractInstance,
    core::k256::ecdsa::SigningKey,
    middleware::SignerMiddleware,
    providers::{Http, Provider},
    signers::Wallet,
    types::{Address, Bytes, U256},
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TripleAAgent {
    pub id: u32,
    pub name: String,
    pub prompt: String,
    pub cover: String,
    pub wallet: String,
    pub clock: u32,
    pub last_active_time: u32,
    pub daily_active: u32,
    pub account_address: String,
}

#[derive(Debug, Clone)]
pub struct AgentManager {
    pub agent: TripleAAgent,
    pub current_queue: Vec<AgentActivity>,
    pub agents_contract: Arc<
        ContractInstance<
            Arc<SignerMiddleware<Arc<Provider<Http>>, Wallet<SigningKey>>>,
            SignerMiddleware<Arc<Provider<Http>>, Wallet<SigningKey>>,
        >,
    >,
    pub lens_global_contract: Arc<
        ContractInstance<
            Arc<SignerMiddleware<Arc<Provider<Http>>, Wallet<SigningKey>>>,
            SignerMiddleware<Arc<Provider<Http>>, Wallet<SigningKey>>,
        >,
    >,
    pub tokens: Option<SavedTokens>,
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
    pub active_balance: U256,
    pub total_balance: U256,
    pub collection_id: U256,
}

#[derive(Debug, Clone, Serialize)]
pub struct LlamaOptions {
    pub num_keep: i32,
    pub seed: i32,
    pub num_predict: i32,
    pub top_k: i32,
    pub top_p: f32,
    pub min_p: f32,
    pub ctx: i32,
    pub tfs_z: f32,
    pub typical_p: f32,
    pub repeat_last_n: i32,
    pub temperature: f32,
    pub repeat_penalty: f32,
    pub presence_penalty: f32,
    pub frequency_penalty: f32,
    pub mirostat: i32,
    pub mirostat_tau: f32,
    pub mirostat_eta: f32,
    pub penalize_newline: bool,
    pub numa: bool,
    pub num_tokens: i32,
    pub num_batch: i32,
    pub num_gpu: i32,
    pub main_gpu: i32,
    pub low_vram: bool,
    pub f16_kv: bool,
    pub vocab_only: bool,
    pub use_mmap: bool,
    pub use_mlock: bool,
    pub num_thread: i32,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct IPFSResponse {
    Name: String,
    pub Hash: String,
    Size: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct LensTokens {
    pub access_token: String,
    pub refresh_token: String,
    pub id_token: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LlamaResponse {
    pub response: String,
    pub json: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Publication {
    #[serde(rename = "$schema")]
    pub schema: String,
    pub lens: Content,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetadataAttribute {
    pub key: String,
    #[serde(rename = "type")]
    pub tipo: String,
    pub value: String,
}

#[derive(Serialize, Deserialize, Debug, PartialEq)]
pub struct Image {
    #[serde(rename = "type")]
    pub tipo: String,
    pub item: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Content {
    pub mainContentFocus: String,
    pub title: String,
    pub content: String,
    pub id: String,
    pub locale: String,
    pub tags: Vec<String>,
    pub image: Image,
    pub attributes: Option<Vec<MetadataAttribute>>,
}

#[derive(Debug, Clone)]
pub struct SavedTokens {
    pub tokens: LensTokens,
    pub expiry: i64,
}

#[derive(Clone, Debug)]
pub struct CreatePostParams {
    pub author: Address,
    pub content_uri: String,
    pub reposted_post_id: U256,
    pub quoted_post_id: U256,
    pub replied_post_id: U256,
    pub rules: Vec<Token>,
    pub feed_rules_data: Token,
    pub reposted_post_rules_data: Token,
    pub quoted_post_rules_data: Token,
    pub replied_post_rules_data: Token,
    pub extra_data: Vec<Token>,
}

#[derive(Clone, Debug)]
pub struct SourceStamp {
    pub source: Address,
    pub nonce: U256,
    pub deadline: U256,
    pub signature: Bytes,
}
