use chrono::{Timelike, Utc};
use dotenv::dotenv;
use futures_util::{future::try_join_all, lock::Mutex, SinkExt, StreamExt};
use serde_json::{from_str, Value};
use std::{collections::HashMap, env, error::Error, net::SocketAddr, sync::Arc, time::Duration};
use tokio::net::{TcpListener, TcpStream};
use tokio::{
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
use utils::{constants::AGENT_LIST, types::*};

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
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
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
                                    //          "https://glorious-eft-deeply.ngrok-free.app"

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

    let (mut write, mut read) = ws_stream.split();

    while let Some(Ok(msg)) = read.next().await {
        match msg {
            Message::Text(text) => {
                if let Ok(parsed) = from_str::<Value>(&text) {
                    if let Some(data_type) = parsed.get("data_type").and_then(Value::as_str) {
                        if data_type == "llamaContent" {
                            if let Some(agent_key) = parsed.get("agent_key").and_then(Value::as_str)
                            {
                                let mut agents_guard = agents.write().await;

                                if let Some(agent) = agents_guard.get_mut(
                                    &agent_key
                                        .parse::<u32>()
                                        .expect("Failed to parse string to u32"),
                                ) {
                                    if let Some(json) = parsed.get("json") {
                                        if let Ok(json_string) = serde_json::to_string(json) {
                                            agent.llama_response(&json_string);
                                        } else {
                                            eprintln!(
                                                "Error al convertir el contenido JSON a cadena"
                                            );
                                        }
                                    }
                                }
                            }
                        } else {
                            eprintln!("Event not recognised: {}", data_type);
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
        let tasks = {
            let agents_snapshot = agents.read().await.clone();

            agents_snapshot
                .values()
                .filter_map(|agent| {
                    if should_trigger(&agent.agent) {
                        let mut agent_clone = agent.clone();
                        Some(spawn(async move {
                            agent_clone.resolve_activity().await;
                        }))
                    } else {
                        None
                    }
                })
                .collect::<Vec<_>>()
        };

        for task in tasks {
            if let Err(e) = task.await {
                eprintln!("Error executing agent activity: {}", e);
            }
        }

        time::sleep(Duration::from_secs(60)).await;
    }
}

fn should_trigger(agent: &TripleAAgent) -> bool {
    let now_seconds = Utc::now().num_seconds_from_midnight();

    now_seconds >= agent.clock && (now_seconds - agent.last_active_time >= 60)
}
