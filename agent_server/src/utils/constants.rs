use std::sync::LazyLock;

pub static AGENTS: &'static str = "0x2459B9cfC5CF8AF472F0D83074fd025fB306A904";
pub static ACCESS_CONTROLS: &'static str = "0x666912d82523f83f890612e4C212958157958c9D";
pub static AGENT_INTERFACE_URL: &'static str = "https://triplea.agentmeme.xyz";
pub static LENS_API: &'static str = "https://api.testnet.lens.dev/graphql";
pub static LENS_RPC_URL: &'static str = "https://rpc.testnet.lens.dev";
pub static AAA_URI: &str = "https://api.studio.thegraph.com/query/37770/triplea/version/latest";

pub static LENS_CHAIN_ID: LazyLock<u64> = LazyLock::new(|| 37111);
