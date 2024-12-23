use std::sync::{Arc, Mutex, Once};

use crate::utils::constants::{AGENTS, LENS_CHAIN_ID, LENS_HUB_PROXY, LENS_RPC_URL};
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
static LENS_HUB_PROXY_CONTRACT: Mutex<
    Option<Arc<Contract<SignerMiddleware<Arc<Provider<Http>>, LocalWallet>>>>,
> = Mutex::new(None);
static AGENTS_CONTRACT: Mutex<
    Option<Arc<Contract<SignerMiddleware<Arc<Provider<Http>>, LocalWallet>>>>,
> = Mutex::new(None);
static PROVIDER: Mutex<Option<Arc<Provider<Http>>>> = Mutex::new(None);
static LENS_CLIENT: Mutex<Option<Arc<Client>>> = Mutex::new(None);
static WALLET: Mutex<Option<LocalWallet>> = Mutex::new(None);

pub fn initialize_provider() -> Arc<Provider<Http>> {
    INIT_PROVIDER.call_once(|| {
        dotenv().ok();
        let chain_id = *LENS_CHAIN_ID;
        let mut provider =
            Provider::<Http>::try_from(LENS_RPC_URL).expect("Error in creating the provider");
        let provider = provider.set_chain(chain_id).clone();
        *PROVIDER.lock().unwrap() = Some(Arc::new(provider));
    });

    PROVIDER
        .lock()
        .unwrap()
        .clone()
        .expect("Provider not initialized")
}

pub fn initialize_api() -> Arc<Client> {
    INIT_LENS.call_once(|| {
        *LENS_CLIENT.lock().unwrap() = Some(Arc::new(Client::new()));
    });

    LENS_CLIENT
        .lock()
        .unwrap()
        .clone()
        .expect("Client not initialized")
}

pub fn initialize_wallet(private_key: &str) -> LocalWallet {
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

    *WALLET.lock().unwrap() = Some(wallet.clone());
    wallet
}

pub fn initialize_contracts(
    private_key: &str,
) -> (
    Arc<Contract<SignerMiddleware<Arc<Provider<Http>>, LocalWallet>>>,
    Arc<Contract<SignerMiddleware<Arc<Provider<Http>>, LocalWallet>>>,
) {
    let provider = initialize_provider();
    dotenv().ok();

    let wallet = initialize_wallet(private_key);
    let client = Arc::new(SignerMiddleware::new(provider.clone(), wallet));

    let lens_hub_address = LENS_HUB_PROXY
        .parse::<Address>()
        .expect("Error in parsing LENS_HUB_PROXY");
    let lens_hub_abi: Abi = from_str(include_str!("./../../abis/LensHubProxy.json"))
        .expect("Error in loading LensHubProxy ABI");
    let lens_hub_contract = Contract::new(lens_hub_address, lens_hub_abi, client.clone());
    *LENS_HUB_PROXY_CONTRACT.lock().unwrap() = Some(Arc::new(lens_hub_contract));

    let agents_address = AGENTS.parse::<Address>().expect("Error in parsing AGENTS");
    let agents_abi: Abi =
        from_str(include_str!("./../../abis/Agents.json")).expect("Error in loading Agents ABI");
    let agents_contract = Contract::new(agents_address, agents_abi, client.clone());
    *AGENTS_CONTRACT.lock().unwrap() = Some(Arc::new(agents_contract));

    (
        LENS_HUB_PROXY_CONTRACT
            .lock()
            .unwrap()
            .clone()
            .expect("LENS_HUB_PROXY_CONTRACT not initialized"),
        AGENTS_CONTRACT
            .lock()
            .unwrap()
            .clone()
            .expect("AGENTS_CONTRACT not initialized"),
    )
}
