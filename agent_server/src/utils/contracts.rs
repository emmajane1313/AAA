use std::sync::{Arc, Once};

use crate::utils::constants::{
    AGENTS, DEV_TREASURY, LENS_CHAIN_ID, LENS_HUB_PROXY, LENS_RPC_URL, MARKET,
};
use dotenv::{dotenv, var};
use ethers::{
    abi::{Abi, Address},
    contract::Contract,
    middleware::SignerMiddleware,
    providers::{Http, Provider, ProviderExt},
    signers::{LocalWallet, Signer},
};
use reqwest::Client;
use serde_json::from_str;

static INIT_PROVIDER: Once = Once::new();
static INIT_LENS: Once = Once::new();
static mut LENS_HUB_PROXY_CONTRACT: Option<
    Arc<Contract<SignerMiddleware<Arc<Provider<Http>>, LocalWallet>>>,
> = None;
static mut MARKET_CONTRACT: Option<
    Arc<Contract<SignerMiddleware<Arc<Provider<Http>>, LocalWallet>>>,
> = None;
static mut DEV_TREASURY_CONTRACT: Option<
    Arc<Contract<SignerMiddleware<Arc<Provider<Http>>, LocalWallet>>>,
> = None;
static mut AGENTS_CONTRACT: Option<
    Arc<Contract<SignerMiddleware<Arc<Provider<Http>>, LocalWallet>>>,
> = None;
static mut PROVIDER: Option<Arc<Provider<Http>>> = None;
static mut LENS_CLIENT: Option<Arc<Client>> = None;
static mut WALLET: Option<LocalWallet> = None;

pub fn initialize_provider() -> Arc<Provider<Http>> {
    unsafe {
        INIT_PROVIDER.call_once(|| {
            dotenv().ok();
            let chain_id = *LENS_CHAIN_ID;
            let mut provider =
                Provider::<Http>::try_from(LENS_RPC_URL).expect("Error in creating the provider");
            PROVIDER = Some(Arc::new(provider.set_chain(chain_id).clone()));
        });
        PROVIDER.clone().expect("Provider not inicialized")
    }
}

pub fn initialize_api() -> Arc<Client> {
    unsafe {
        INIT_LENS.call_once(|| {
            LENS_CLIENT = Some(Arc::new(Client::new()));
        });
        LENS_CLIENT.clone().expect("Client not inicialized")
    }
}

pub fn initialize_wallet(private_key: &str) -> LocalWallet {
    unsafe {
        let wallet = match var(private_key) {
            Ok(key) => match key.parse::<LocalWallet>() {
                Ok(mut wallet) => {
                    let chain_id = *LENS_CHAIN_ID;
                    wallet = wallet.with_chain_id(chain_id);
                    wallet
                }
                Err(e) => panic!("Error in parsing private key: {:?}", e),
            },
            Err(e) => panic!("PRIVATE_KEY not found: {:?}", e),
        };
        WALLET = Some(wallet);
        WALLET.clone().expect("Wallet not inicialized").clone()
    }
}

pub fn initialize_contracts(
    private_key: &str,
) -> (
    Arc<Contract<SignerMiddleware<Arc<Provider<Http>>, LocalWallet>>>,
    Arc<Contract<SignerMiddleware<Arc<Provider<Http>>, LocalWallet>>>,
    Arc<Contract<SignerMiddleware<Arc<Provider<Http>>, LocalWallet>>>,
    Arc<Contract<SignerMiddleware<Arc<Provider<Http>>, LocalWallet>>>,
) {
    unsafe {
        let provider = initialize_provider();
        dotenv().ok();

        let address = match LENS_HUB_PROXY.parse::<Address>() {
            Ok(addr) => addr,
            Err(e) => {
                panic!("Error in parsing LENS_HUB_PROXY: {:?}", e);
            }
        };

        let abi: Abi = match from_str(include_str!("./../../abis/LensHubProxy.json")) {
            Ok(a) => a,
            Err(e) => {
                panic!("Error in loading LensHubProxy ABI: {:?}", e);
            }
        };

        let wallet = initialize_wallet(&private_key);
        let client = SignerMiddleware::new(provider.clone(), wallet);

        let contract = Contract::new(address, abi, Arc::new(client.clone()));
        LENS_HUB_PROXY_CONTRACT = Some(Arc::new(contract));

        let address = match AGENTS.parse::<Address>() {
            Ok(addr) => addr,
            Err(e) => {
                panic!("Error in parsing AGENTS: {:?}", e);
            }
        };

        let abi: Abi = match from_str(include_str!("./../../abis/Agents.json")) {
            Ok(a) => a,
            Err(e) => {
                panic!("Error in loading Agents ABI: {:?}", e);
            }
        };

        let contract = Contract::new(address, abi, Arc::new(client.clone()));
        AGENTS_CONTRACT = Some(Arc::new(contract));

        let address = match MARKET.parse::<Address>() {
            Ok(addr) => addr,
            Err(e) => {
                panic!("Error in parsing MARKET: {:?}", e);
            }
        };

        let abi: Abi = match from_str(include_str!("./../../abis/Market.json")) {
            Ok(a) => a,
            Err(e) => {
                panic!("Error in loading Market ABI: {:?}", e);
            }
        };

        let contract = Contract::new(address, abi, Arc::new(client.clone()));

        MARKET_CONTRACT = Some(Arc::new(contract));

        let address = match DEV_TREASURY.parse::<Address>() {
            Ok(addr) => addr,
            Err(e) => {
                panic!("Error in parsing DEV_TREASURY: {:?}", e);
            }
        };

        let abi: Abi = match from_str(include_str!("./../../abis/DevTreasury.json")) {
            Ok(a) => a,
            Err(e) => {
                panic!("Error in loading DevTreasury ABI: {:?}", e);
            }
        };

        let contrato = Contract::new(address, abi, Arc::new(client.clone()));

        DEV_TREASURY_CONTRACT = Some(Arc::new(contrato));

        let lens_hub_contract = LENS_HUB_PROXY_CONTRACT
            .clone()
            .expect("LENS_HUB_PROXY_CONTRATO not initialized");
        let agents_contract = AGENTS_CONTRACT
            .clone()
            .expect("AGENTS_CONTRACT not initialized");
        let market_contract = MARKET_CONTRACT
            .clone()
            .expect("MARKET_CONTRACT not initialized");
        let dev_treasury_contract = DEV_TREASURY_CONTRACT
            .clone()
            .expect("DEV_TREASURY_CONTRACT not initialized");

        (
            lens_hub_contract,
            agents_contract,
            market_contract,
            dev_treasury_contract,
        )
    }
}
