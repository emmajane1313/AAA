import { SetStateAction, useEffect, useState } from "react";
import { Agent } from "../types/dashboard.types";
import { getAgents } from "../../../../graphql/queries/getAgents";
import { INFURA_GATEWAY } from "@/lib/constants";

const useAgents = (
  agents: Agent[],
  setAgents: (e: SetStateAction<Agent[]>) => void
) => {
  const [agentsLoading, setAgentsLoading] = useState<boolean>(false);

  const loadAgents = async () => {
    setAgentsLoading(true);

    try {
      const data = await getAgents();

      const allAgents: Agent[] = await Promise.all(
        data?.data?.agentCreateds.map(async (agent: any) => {
          if (!agent.metadata) {
            const cadena = await fetch(
              `${INFURA_GATEWAY}/ipfs/${agent.uri.split("ipfs://")?.[1]}`
            );
            agent.metadata = await cadena.json();
          }

          return {
            id: agent?.AAAAgents_id,
            cover: agent?.metadata?.image,
            name: agent?.metadata?.name,
            description: agent?.metadata?.description,
            wallet: agent?.wallet,
            balance: agent?.balances,
          };
        })
      );

      setAgents(allAgents)
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
