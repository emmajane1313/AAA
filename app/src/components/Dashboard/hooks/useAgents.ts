import { SetStateAction, useEffect, useState } from "react";
import { Agent } from "../types/dashboard.types";

const useAgents = (
  agents: Agent[],
  setAgents: (e: SetStateAction<Agent[]>) => void
) => {
  const [agentsLoading, setAgentsLoading] = useState<boolean>(false);

  const loadAgents = async () => {
    setAgentsLoading(true);

    try {
    } catch (err: any) {
      console.error(err.message);
    }
    setAgentsLoading(false);
  };

  useEffect(() => {
    if (!agents || agents?.length < 1) {
      loadAgents();
    }
  }, []);

  return {
    agentsLoading,
  };
};

export default useAgents;
