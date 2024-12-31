use chrono::Utc;
use dotenv::dotenv;
use ethers::utils::hex;
use futures_util::StreamExt;
use rand::rngs::StdRng;
use rand::{Rng, SeedableRng};
use serde_json::{from_str, Value};
use std::{
    collections::HashMap, env, error::Error, fs::OpenOptions, io::Write, net::SocketAddr,
    sync::Arc, time::Duration,
};
use tokio::{
    net::{TcpListener, TcpStream},
    spawn,
    sync::RwLock,
    time::{self},
};
use tokio_tungstenite::{
    accept_hdr_async,
    tungstenite::{
        handshake::server::{ErrorResponse, Request, Response},
        Message,
    },
};
use tungstenite::http::method;
mod classes;
mod utils;
use aes_gcm::aead::{Aead, KeyInit, OsRng};
use aes_gcm::{Aes256Gcm, Nonce};
use utils::{constants::AGENT_INTERFACE_URL, types::*};

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error + Send + Sync>> {
    dotenv().ok();

    let render_key = std::env::var("RENDER_KEY").expect("No Render Key");
    let port: String = env::var("PORT").unwrap_or_else(|_| "10000".to_string());
    let port: u16 = port.parse::<u16>().expect("Invalid Port");
    let addr = format!("0.0.0.0:{}", port);
    let addr: SocketAddr = addr.parse().expect("Invalid Address");
    let listener = TcpListener::bind(&addr)
        .await
        .expect("Couldn't connect address");

    let agent_map = HashMap::new();
    let agent_map = Arc::new(RwLock::new(agent_map));
    let agent_map_clone = agent_map.clone();
    spawn(activity_loop(agent_map_clone));

    while let Ok((stream, _)) = listener.accept().await {
        let render_clone = render_key.clone();
        let agent_map_clone = agent_map.clone();
        spawn(async move {
            if let Err(err) = handle_connection(stream, render_clone, agent_map_clone).await {
                if !err.to_string().contains("Handshake not finished")
                    && !err.to_string().contains("Unsupported HTTP method used")
                {
                    eprintln!("Error managing the connection: {}", err);
                } else {
                    eprintln!("Debug: {}", err);
                }
            }
        });
    }

    Ok(())
}

async fn handle_connection(
    stream: TcpStream,
    render_key: String,
    agents: Arc<RwLock<HashMap<u32, AgentManager>>>,
) -> Result<(), Box<dyn Error + Send + Sync>> {
    let ws_stream = accept_hdr_async(stream, |req: &Request, respuesta: Response| {
        if req.method() != method::Method::GET && req.method() != method::Method::HEAD {
            return Err(ErrorResponse::new(Some(
                "HTTP method not supported".to_string(),
            )));
        }

        if req.method() == method::Method::GET {
            let uri = req.uri();
            let query: Option<&str> = uri.query();
            let origen: Option<&hyper::header::HeaderValue> = req.headers().get("origin");

            if let Some(query) = query {
                let key_from_client = query.split('=').nth(1);
                if let Some(key) = key_from_client {
                    if key.trim_end_matches("&EIO") == render_key.trim() {
                        if let Some(origen) = origen {
                            match origen.to_str() {
                                Ok(origen_str) => {
                                    // if origen_str ==
                                    //          AGENT_INTERFACE_URL

                                    // {
                                    return Ok(respuesta);
                                    // } else {
                                    //     return Err(ErrorResponse::new(Some(
                                    //         "Forbidden".to_string(),
                                    //     )));
                                    // }
                                }
                                Err(e) => {
                                    eprintln!("Error processing origin: {:?}", e);
                                    Err(ErrorResponse::new(Some(
                                        "Invalid origin header".to_string(),
                                    )))
                                }
                            }
                        } else {
                            return Err(ErrorResponse::new(Some("Forbidden".to_string())));
                        }
                    } else {
                        return Err(ErrorResponse::new(Some("Forbidden".to_string())));
                    }
                } else {
                    return Err(ErrorResponse::new(Some("Bad Request".to_string())));
                }
            } else {
                return Err(ErrorResponse::new(Some("Bad Request".to_string())));
            }
        } else {
            return Ok(respuesta);
        }
    })
    .await?;

    let (_, mut read) = ws_stream.split();

    while let Some(Ok(msg)) = read.next().await {
        match msg {
            Message::Text(text) => {
                if let Ok(parsed) = from_str::<Value>(&text) {
                    if let (
                        Some(public_address),
                        Some(encrypted_private_key),
                        Some(id),
                        Some(title),
                        Some(description),
                        Some(cover),
                        Some(custom_instructions),
                        Some(account_address),
                    ) = (
                        parsed["publicAddress"].as_str(),
                        parsed["encryptedPrivateKey"].as_str(),
                        parsed["id"].as_str(),
                        parsed["title"].as_str(),
                        parsed["description"].as_str(),
                        parsed["cover"].as_str(),
                        parsed["customInstructions"].as_str(),
                        parsed["accountAddress"].as_str(),
                    ) {
                        let encryption_key = std::env::var("ENCRYPTION_KEY")
                            .expect("ENCRYPTION_KEY isn't configured.");
                        let key = encryption_key.as_bytes();
                        let cipher = Aes256Gcm::new_from_slice(key).expect("Invalid Key");

                        let encrypted_data = hex::decode(encrypted_private_key)
                            .expect("Error in decoding private key");
                        let nonce_bytes = &encrypted_data[..12];
                        let ciphertext = &encrypted_data[12..];

                        let nonce = Nonce::from_slice(nonce_bytes);
                        let decrypted_key = cipher
                            .decrypt(nonce, ciphertext.as_ref())
                            .expect("Error in decoding private key");

                        let private_key =
                            String::from_utf8(decrypted_key).expect("Private key isn't utf8");

                        let mut rng = StdRng::from_entropy();

                        let agents_snapshot = agents.read().await;

                        let mut clock;
                        loop {
                            let random_hour = rng.gen_range(0..24);
                            let random_minute = rng.gen_range(0..60);
                            let random_second = rng.gen_range(0..60);
                            clock = random_hour * 3600 + random_minute * 60 + random_second;

                            if !agents_snapshot.values().any(|agent| {
                                let agent_clock = agent.agent.clock;
                                (clock as i32 - agent_clock as i32).abs() < 1800
                            }) {
                                break;
                            }
                        }

                        let mut agents_write = agents.write().await;
                        let new_id = id.parse().expect("Error converting id to u32");
                        agents_write.insert(
                            new_id,
                            AgentManager::new(&TripleAAgent {
                                id: new_id,
                                name: title.to_string(),
                                description: description.to_string(),
                                cover: cover.to_string(),
                                custom_instructions: custom_instructions.to_string(),
                                wallet: public_address.to_string(),
                                clock,
                                last_active_time: Utc::now().timestamp() as u32,
                                account_address: account_address.to_string(),
                            }),
                        );

                        let mut env_file = OpenOptions::new()
                            .append(true)
                            .open(".env")
                            .expect("Can't open .env");
                        writeln!(env_file, "{}={}", title, private_key)
                            .expect("Error writing to the .env");

                        println!("Agente added at address: {}", public_address);
                    }
                }
            }
            _ => {
                eprintln!("Message type not supported: {:?}", msg);
            }
        }
    }
    Ok(())
}

async fn activity_loop(agents: Arc<RwLock<HashMap<u32, AgentManager>>>) {
    loop {
        let agent_ids: Vec<u32>;
        {
            let agents_guard = agents.read().await;

            agent_ids = agents_guard
                .values()
                .filter(|agent_manager| should_trigger(&agent_manager.agent))
                .map(|agent_manager| agent_manager.agent.id)
                .collect();
        }

        for id in agent_ids {
            let agents_clone = agents.clone();
            spawn(async move {
                if let Some(mut agent_manager) = {
                    let mut agents_guard = agents_clone.write().await;
                    agents_guard.get_mut(&id).cloned()
                } {
                    spawn(async move {
                        {
                            agent_manager
                                .resolve_activity()
                                .await
                                .unwrap_or_else(|err| {
                                    eprintln!("Error resolving activity: {:?}", err);
                                });
                        }

                        let agents_clone = agents_clone.clone();
                        spawn(async move {
                            let mut agents_guard = agents_clone.write().await;
                            if let Some(manager) = agents_guard.get_mut(&id) {
                                *manager = agent_manager;
                            }
                        });
                    });
                }
            });
        }

        time::sleep(Duration::from_secs(60)).await;
    }
}

fn should_trigger(agent: &TripleAAgent) -> bool {
    let now_seconds = Utc::now().timestamp() as u32;
    let day_seconds = now_seconds % 86400;
    let diff = (agent.clock as i32 - day_seconds as i32).abs();

    diff <= 60
}
