use std::sync::LazyLock;

use crate::utils::types::TripleAAgent;
use ethers::addressbook::Chain;
use once_cell::sync::Lazy;

pub static LENS_HUB_PROXY: &'static str = "";
pub static MARKET: &'static str = "";
pub static AGENTS: &'static str = "";
pub static DEV_TREASURY: &'static str = "";
pub static LENS_RPC_URL: &'static str = "https://rpc.testnet.lens.dev";
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
    }]
});
