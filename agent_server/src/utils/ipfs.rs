use base64::{engine::general_purpose::STANDARD, Engine as _};
use dotenv::dotenv;
use reqwest::{
    multipart::{Form, Part},
    Client,
};
use serde_json::from_str;
use std::{
    env,
    error::Error,
    sync::{Arc, Once},
};

use crate::IPFSResponse;

static INIT: Once = Once::new();
static mut CLIENTE: Option<Arc<Client>> = None;

pub fn cliente() -> Arc<Client> {
    unsafe {
        INIT.call_once(|| {
            dotenv().ok();
            let client = Client::new();
            CLIENTE = Some(Arc::new(client));
        });
        CLIENTE.clone().expect("Cliente no es inicializado")
    }
}

pub fn authentication() -> String {
    dotenv().ok();
    let id = env::var("INFURA_PROJECT_ID").expect("INFURA_PROJECT_ID isn't configured");
    let key = env::var("INFURA_PROJECT_SECRET").expect("INFURA_PROJECT_SECRET isn't configured");
    let aut = format!("{}:{}", id, key);
    STANDARD.encode(aut)
}

pub async fn upload_ipfs(data: String) -> Result<IPFSResponse, Box<dyn Error>> {
    let client = cliente();
    let aut_encoded = authentication();

    let form: Form = Form::new().part("file", Part::text(data.clone()).file_name("data.json"));

    let respuesta = client
        .post("https://ipfs.infura.io:5001/api/v0/add")
        .header("Authorization", format!("Basic {}", aut_encoded))
        .multipart(form)
        .send()
        .await?;

    let text_response = respuesta.text().await?;
    let ipfs_response: IPFSResponse = from_str(&text_response)?;

    Ok(ipfs_response)
}
