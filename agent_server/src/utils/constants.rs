use std::sync::LazyLock;

pub static AGENTS: &'static str = "0x26F17d3c4bd99254D83B8CcA56Da35eaDeC9B712";
pub static ACCESS_CONTROLS: &'static str = "0x3ee3A2bAF1620a59fEC0FB2E6E248CcBF0CE55d7";
pub static AGENT_INTERFACE_URL: &'static str = "https://triplea.agentmeme.xyz";
pub static LENS_API: &'static str = "https://api.testnet.lens.dev/graphql";
pub static LENS_RPC_URL: &'static str = "https://rpc.testnet.lens.dev";
pub static AAA_URI: &str = "https://api.studio.thegraph.com/query/37770/triplea/version/latest";

pub static LENS_CHAIN_ID: LazyLock<u64> = LazyLock::new(|| 37111);
