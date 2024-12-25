use std::sync::LazyLock;

use crate::utils::types::TripleAAgent;
use once_cell::sync::Lazy;

pub static AGENTS: &'static str = "0x4eD74d03D9d4F6f4DC2E50DC2f0C701326DF156a";
pub static LENS_API: &'static str = "https://api.testnet.lens.dev/graphql";
pub static NGROK_URL: &'static str = "https://glorious-eft-deeply.ngrok-free.app";
pub static LENS_RPC_URL: &'static str = "https://rpc.testnet.lens.dev";
pub static AAA_URI: &str = "https://api.studio.thegraph.com/query/37770/triplea/version/latest";
pub static LLAMA_URL: &'static str = "https://glorious-eft-deeply.ngrok-free.app/run_llama";

pub static LENS_CHAIN_ID: LazyLock<u64> = LazyLock::new(|| 37111);

pub static AGENT_LIST: Lazy<[TripleAAgent; 1]> = Lazy::new(|| {
    [TripleAAgent {
        id: 1,
        clock: 1000,
        name: String::from("Gabriel"),
        prompt: String::from(""),
        cover: String::from("ipfs://QmNoCNBqYs6cVcQbvY3tmrDAnshQ89eYN4y9hoee4oPv83"),
        wallet: String::from("0x87dD364f74f67f1e13126D6Fd9a31b7d78C2cC12"),
        last_active_time: 0,
        daily_active: 1,
        account_address: String::from("0xB667CF9EE5fB0BE3A4E5e8c6Fc3d1934BD588b32"),
    }]
});
