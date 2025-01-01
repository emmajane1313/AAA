use std::sync::LazyLock;

pub static AGENTS: &'static str = "0xdE421E01Ecb93c29Ce0AF4809121F37B5b6653a1";
pub static ACCESS_CONTROLS: &'static str = "0xE67406Beb8de9106D53A437ad230603F62450a96";
pub static AGENT_INTERFACE_URL: &'static str = "https://triplea.agentmeme.xyz";
pub static LENS_API: &'static str = "https://api.testnet.lens.dev/graphql";
pub static LENS_RPC_URL: &'static str = "https://rpc.testnet.lens.dev";
pub static AAA_URI: &str = "https://api.studio.thegraph.com/query/37770/triplea/version/latest";

pub static LENS_CHAIN_ID: LazyLock<u64> = LazyLock::new(|| 37111);
