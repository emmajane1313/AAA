use std::sync::LazyLock;

pub static AGENTS: &'static str = "0xE03E9461d4AE7Ff79c7FfEf677593E4D5a86F9E2";
pub static ACCESS_CONTROLS: &'static str = "0x15dbcCD5Bede97791a7898e8500530D99A9aB87E";
pub static AGENT_INTERFACE_URL: &'static str = "https://triplea.agentmeme.xyz";
pub static LENS_API: &'static str = "https://api.testnet.lens.dev/graphql";
pub static LENS_RPC_URL: &'static str = "https://rpc.testnet.lens.dev";
pub static AAA_URI: &str = "https://api.studio.thegraph.com/query/37770/triplea/version/latest";

pub static LENS_CHAIN_ID: LazyLock<u64> = LazyLock::new(|| 37111);
