use ethers::{
    abi::{Token, Tokenizable, Tokenize},
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
    pub description: String,
    pub cover: String,
    pub wallet: String,
    pub clock: u32,
    pub last_active_time: u32,
    pub daily_active: u32,
    pub profile_id: U256,
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
    pub amount: U256,
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
    pub identity_token: String,
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
    pub appId: String,
    pub id: String,
    pub hideFromFeed: bool,
    pub locale: String,
    pub tags: Vec<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub image: Option<Image>,
    pub attributes: Option<Vec<MetadataAttribute>>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct MakePub {
    pub profileId: U256,
    pub contentURI: String,
    pub actionModules: Vec<Address>,
    pub actionModulesInitDatas: Vec<Bytes>,
    pub referenceModule: Address,
    pub referenceModuleInitData: Bytes,
}

impl Tokenize for MakePub {
    fn into_tokens(self) -> Vec<Token> {
        vec![
            Token::Uint(self.profileId),
            Token::String(self.contentURI),
            Token::Array(
                self.actionModules
                    .into_iter()
                    .map(|addr| addr.into_token())
                    .collect(),
            ),
            Token::Array(
                self.actionModulesInitDatas
                    .into_iter()
                    .map(|data| Token::Bytes(data.to_vec()))
                    .collect(),
            ),
            self.referenceModule.into_token(),
            Token::Bytes(self.referenceModuleInitData.to_vec()),
        ]
    }
}

#[derive(Debug, Clone)]
pub struct SavedTokens {
    pub tokens: LensTokens,
    pub expiry: i64,
}
