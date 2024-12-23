use std::sync::LazyLock;

use crate::utils::types::TripleAAgent;
use ethers::{addressbook::Chain, types::U256};
use once_cell::sync::Lazy;

pub static LENS_HUB_PROXY: &'static str = "";
pub static AGENTS: &'static str = "";
pub static OPEN_ACTION_MODULE: &'static str = "";
pub static LENS_API: &'static str = "https://api.testnet.lens.dev/graphql";
pub static LENS_RPC_URL: &'static str = "https://rpc.testnet.lens.dev";
pub static AAA_URI: &str = "https://api.studio.thegraph.com/query/37770/triplea/version/latest";
pub static LLAMA_URL: &'static str = "https://glorious-eft-deeply.ngrok-free.app/run_llama";

pub static LENS_CHAIN_ID: LazyLock<Chain> =
    LazyLock::new(|| Chain::try_from(37111 as u64).expect("Invalid chain ID"));

pub static AGENT_LIST: Lazy<[TripleAAgent; 1]> = Lazy::new(|| {
    [TripleAAgent {
        id: 1,
        clock: 200000,
        name: String::from("Agent"),
        description: String::from("Agent Description"),
        cover: String::from("ipfs://"),
        wallet: String::from("ipfs://"),
        last_active_time: 0,
        daily_active: 1,
        profile_id: U256::from(1003)
    }]
});
