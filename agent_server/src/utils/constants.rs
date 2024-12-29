use std::sync::LazyLock;

use crate::utils::types::TripleAAgent;
use once_cell::sync::Lazy;

pub static AGENTS: &'static str = "0xE03E9461d4AE7Ff79c7FfEf677593E4D5a86F9E2";
pub static LENS_GLOBAL_FEED: &'static str = "0x83C8D9e96Da13aaD12E068F48C639C7671D2a5C7";
pub static LENS_API: &'static str = "https://api.testnet.lens.dev/graphql";
pub static NGROK_URL: &'static str = "https://glorious-eft-deeply.ngrok-free.app";
pub static LENS_RPC_URL: &'static str = "https://rpc.testnet.lens.dev";
pub static AAA_URI: &str = "https://api.studio.thegraph.com/query/37770/triplea/version/latest";
pub static LLAMA_URL: &'static str = "https://glorious-eft-deeply.ngrok-free.app/run_llama";

pub static LENS_CHAIN_ID: LazyLock<u64> = LazyLock::new(|| 37111);

pub static AGENT_LIST: Lazy<[TripleAAgent; 4]> = Lazy::new(|| {
    [
        TripleAAgent {
            id: 1,
            clock: 1000,
            name: String::from("Ethan"),
            prompt: String::from(""),
            cover: String::from("ipfs://QmVuVcxsr6r1jgeVmMMd2BsHoXq3hWuYdAFiZoMkqLU6ub"),
            wallet: String::from("0x8241Ee5A9f23611Ef6535B6c7E71ae24913306EC"),
            last_active_time: 0,
            daily_active: 1,
            account_address: String::from("0x1b90805B50d89Ec452999a93b620b3f60aBE801c"),
        },
        TripleAAgent {
            id: 2,
            clock: 1000,
            name: String::from("Gabriel"),
            prompt: String::from(""),
            cover: String::from("ipfs://QmNoCNBqYs6cVcQbvY3tmrDAnshQ89eYN4y9hoee4oPv83"),
            wallet: String::from("0x87dD364f74f67f1e13126D6Fd9a31b7d78C2cC12"),
            last_active_time: 0,
            daily_active: 1,
            account_address: String::from("0xB667CF9EE5fB0BE3A4E5e8c6Fc3d1934BD588b32"),
        },
        TripleAAgent {
            id: 3,
            clock: 1000,
            name: String::from("Anaya"),
            prompt: String::from(""),
            cover: String::from("ipfs://QmefwGCFyrrVJPwfxvhVcY9Hd9pUxVYqUB4p874NPteCv9"),
            wallet: String::from("0x9bBca90ea8F188403fAB15Cd5bad4F9a46f56257"),
            last_active_time: 0,
            daily_active: 1,
            account_address: String::from("0xdd27e3e5BEF4dA722b1d4cfeAF3DD5EAc998035e"),
        },
        TripleAAgent {
            id: 4,
            clock: 1000,
            name: String::from("Carlos"),
            prompt: String::from(""),
            cover: String::from("ipfs://QmQoms1aCZ3LuYobhMpHCXFi4JvdufxsDuBPSKwTUrjQ62"),
            wallet: String::from("0xa8ac1e95a53c79Eae348491f678A1Cf0c2F2519e"),
            last_active_time: 0,
            daily_active: 1,
            account_address: String::from("0x8955Cb977f461352e19529c75be8f5aE2604735d"),
        },
    ]
});
