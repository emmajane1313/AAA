use std::sync::{Arc, Mutex, Once};

use crate::utils::constants::{ACCESS_CONTROLS, AGENTS, LENS_CHAIN_ID, LENS_RPC_URL};
use dotenv::{dotenv, from_filename, var};
use ethers::{
    abi::{Abi, Address},
    contract::Contract,
    middleware::SignerMiddleware,
    providers::{Http, Provider, ProviderExt},
    signers::{LocalWallet, Signer},
    types::Chain,
};
use reqwest::Client;
use serde_json::from_str;

static INIT_PROVIDER: Once = Once::new();
static INIT_LENS: Once = Once::new();
static ACCESS_CONTROLS_CONTRACT: Mutex<
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
        let chain: Chain = unsafe { std::mem::transmute(chain_id as u64) };
        let mut provider =
            Provider::<Http>::try_from(LENS_RPC_URL).expect("Error in creating the provider");
        let provider = provider.set_chain(chain).clone();
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

pub fn initialize_wallet(private_key: u32) -> LocalWallet {
    from_filename(".env").ok();
    let wallet = match var(format!("ID_{}", private_key.to_string())) {
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
    private_key: u32,
) -> (
    Arc<Contract<SignerMiddleware<Arc<Provider<Http>>, LocalWallet>>>,
    Arc<Contract<SignerMiddleware<Arc<Provider<Http>>, LocalWallet>>>,
) {
    let provider = initialize_provider();
    dotenv().ok();

    let wallet = initialize_wallet(private_key);
    let client = Arc::new(SignerMiddleware::new(provider.clone(), wallet));

    let access_controls_address = ACCESS_CONTROLS
        .parse::<Address>()
        .expect("Error in parsing ACCESS_CONTROLS");
    let access_controls_abi: Abi = from_str(include_str!("./../../abis/AccessControls.json"))
        .expect("Error in loading AccessControls ABI");
    let access_controls_contract =
        Contract::new(access_controls_address, access_controls_abi, client.clone());
    *ACCESS_CONTROLS_CONTRACT.lock().unwrap() = Some(Arc::new(access_controls_contract));

    let agents_address = AGENTS.parse::<Address>().expect("Error in parsing AGENTS");
    let agents_abi: Abi =
        from_str(include_str!("./../../abis/Agents.json")).expect("Error in loading Agents ABI");
    let agents_contract = Contract::new(agents_address, agents_abi, client.clone());
    *AGENTS_CONTRACT.lock().unwrap() = Some(Arc::new(agents_contract));

    (
        ACCESS_CONTROLS_CONTRACT
            .lock()
            .unwrap()
            .clone()
            .expect("ACCESS_CONTROLS_CONTRACT not initialized"),
        AGENTS_CONTRACT
            .lock()
            .unwrap()
            .clone()
            .expect("AGENTS_CONTRACT not initialized"),
    )
}
