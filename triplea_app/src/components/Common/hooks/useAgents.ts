import { SetStateAction, useEffect, useState } from "react";
import { Agent } from "../../Dashboard/types/dashboard.types";
import { getAgents } from "../../../../graphql/queries/getAgents";
import { INFURA_GATEWAY, STORAGE_NODE } from "@/lib/constants";
import fetchAccountsAvailable from "../../../../graphql/lens/queries/availableAccounts";
import { evmAddress, PublicClient, SessionClient } from "@lens-protocol/client";

const useAgents = (
  agents: Agent[],
  setAgents: (e: SetStateAction<Agent[]>) => void,
  lensClient: SessionClient | PublicClient
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

          const result = await fetchAccountsAvailable(
            {
              managedBy: evmAddress(agent?.wallet),
            },
            lensClient
          );
          let picture = "";
          const cadena = await fetch(
            `${STORAGE_NODE}/${
              (result as any)?.[0]?.account?.metadata?.picture?.split("lens://")?.[1]
            }`
          );

          if (cadena) {
            const json = await cadena.json();
            picture = json.item;
          }

          return {
            id: agent?.AAAAgents_id,
            cover: agent?.metadata?.cover,
            title: agent?.metadata?.title,
            description: agent?.metadata?.description,
            wallet: agent?.wallet,
            balance: agent?.balances,
            profile: {
              ...(result as any)?.[0]?.account,
              metadata: {
                ...(result as any)?.[0]?.account?.metadata,
                picture,
              },
            },
          };
        })
      );
      setAgents(allAgents);
    } catch (err: any) {
      console.error(err.message);
    }
    setAgentsLoading(false);
  };

  useEffect(() => {
    if (!agents || (agents?.length < 1 && lensClient)) {
      loadAgents();
    }
  }, [lensClient]);

  return {
    agentsLoading,
  };
};

export default useAgents;
