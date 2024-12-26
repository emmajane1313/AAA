use chrono::Utc;
use dotenv::dotenv;
use futures_util::StreamExt;
use serde_json::{from_str, to_string, Value};
use std::{collections::HashMap, env, error::Error, net::SocketAddr, sync::Arc, time::Duration};
use tokio::{
    net::{TcpListener, TcpStream},
    runtime, spawn,
    sync::RwLock,
    task,
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
use utils::{
    constants::{AGENT_LIST, NGROK_URL},
    types::*,
};

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

    let mut agent_map = HashMap::new();
    let agents = AGENT_LIST.iter().map(|ag| AgentManager::new(ag));

    for agent in agents {
        agent_map.insert(agent.agent.id.clone(), agent);
    }
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
                                    //          NGROK_URL

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
                    if let Some(data_type) = parsed.get("data_type").and_then(Value::as_str) {
                        if data_type == "llamaContent" {
                            if let Some(agent_key) = parsed.get("agent_key").and_then(Value::as_str)
                            {
                                let agent_key = agent_key.parse::<u32>().unwrap_or_default();

                                if let Some(json) = parsed.get("json") {
                                    if let Ok(json_string) = to_string(json) {
                                        let agents_clone = agents.clone();
                                        task::spawn_blocking(move || {
                                            let rt = runtime::Handle::current();
                                            rt.block_on(async move {
                                                let mut agents_guard = agents_clone.write().await;

                                                if let Some(agent) =
                                                    agents_guard.get_mut(&agent_key)
                                                {
                                                    agent.llama_response(&json_string).await;
                                                } else {
                                                    eprintln!(
                                                        "Agent not found for key: {}",
                                                        agent_key
                                                    );
                                                }
                                            });
                                        });
                                    } else {
                                        eprintln!("Error converting JSON to string");
                                    }
                                }
                            }
                        } else {
                            eprintln!("Type not recognised: {}", data_type);
                        }
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

        time::sleep(Duration::from_secs(43200)).await;
    }
}

fn should_trigger(agent: &TripleAAgent) -> bool {
    // let now_seconds = Utc::now().num_seconds_from_midnight();
    // now_seconds >= agent.clock && (now_seconds - agent.last_active_time >= 60)

    let now_seconds = Utc::now().timestamp();
    now_seconds >= (agent.last_active_time as i64) + 43_200
}
