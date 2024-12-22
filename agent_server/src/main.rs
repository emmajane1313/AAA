use chrono::{Timelike, Utc};
use dotenv::dotenv;
use std::{collections::HashMap, sync::Arc, time::Duration};
use tokio::{
    spawn,
    sync::RwLock,
    time::{self},
};
mod classes;
mod utils;
use utils::{constants::AGENT_LIST, types::*};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    dotenv().ok();
    let mut agent_map = HashMap::new();
    let agents = AGENT_LIST.iter().map(|ag| AgentManager::new(ag));

    for agent in agents {
        agent_map.insert(agent.agent.id.clone(), agent);
    }
    let agent_map = Arc::new(RwLock::new(agent_map));

    spawn(activity_loop(agent_map.clone()));

    loop {
        time::sleep(Duration::from_secs(60)).await;
    }
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
                eprintln!("Error ejecutando actividad del agente: {}", e);
            }
        }

        time::sleep(Duration::from_secs(60)).await;
    }
}

fn should_trigger(agent: &TripleAAgent) -> bool {
    let now_seconds = Utc::now().num_seconds_from_midnight();

    now_seconds >= agent.clock && (now_seconds - agent.last_active_time >= 60)
}
