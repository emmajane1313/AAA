use crate::utils::{
    contracts::{initialize_api, initialize_contracts},
    types::{AgentManager, TripleAAgent},
};
use chrono::{Timelike, Utc};

impl AgentManager {
    pub fn new(agent: &TripleAAgent) -> Self {
        let (lens_hub_contract, agents_contract, market_contract, dev_treasury_contract) =
            initialize_contracts(&agent.name.to_string());
        initialize_api();

        return AgentManager {
            agent: agent.clone(),
            lens_hub_contract,
            agents_contract,
            dev_treasury_contract,
            market_contract,
        };
    }

    pub async fn resolve_activity(&mut self) {
        self.agent.last_active_time = Utc::now().num_seconds_from_midnight();
    }

    pub async fn pay_rent(&self) {}
}
