import {
  Agent,
  AgentProps,
} from "@/components/Dashboard/types/dashboard.types";
import { INFURA_GATEWAY, STORAGE_NODE } from "@/lib/constants";
import { evmAddress, PublicClient } from "@lens-protocol/client";
import { SetStateAction, useEffect, useState } from "react";
import fetchAccountsAvailable from "../../../../graphql/lens/queries/availableAccounts";
import { getAgentsPaginated } from "../../../../graphql/queries/getAgentsPaginated";

const useAgentGallery = (
  agents: Agent[] | undefined,
  setAgents: (e: SetStateAction<Agent[]>) => void,
  lensClient: PublicClient | undefined
) => {
  const [agentGalleryLoading, setAgentGalleryLoading] =
    useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [agentPaginated, setAgentPaginated] = useState<number>(20);

  const handleMoreAgents = async () => {
    if (!lensClient || !hasMore) return;
    if (Number(agents?.length) < 20) {
      setHasMore(false);
      setAgentPaginated(20);
      return;
    }
    setAgentGalleryLoading(true);
    try {
      const res = await getAgentsPaginated(agentPaginated);

      let newAgents: Agent[] = [];

      await Promise.all(
        res?.data?.agentCreateds?.map(async (agent: any) => {
          if (!agent.metadata) {
            const cadena = await fetch(
              `${INFURA_GATEWAY}/ipfs/${agent.uri.split("ipfs://")?.[1]}`
            );
            agent.metadata = await cadena.json();
          }

          const result = await fetchAccountsAvailable(
            {
              managedBy: evmAddress(agent?.wallets?.[0]),
            },
            lensClient
          );
          let picture = "";
          const cadena = await fetch(
            `${STORAGE_NODE}/${
              (result as any)?.[0]?.account?.metadata?.picture?.split(
                "lens://"
              )?.[1]
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
            wallet: agent?.wallets?.[0],
            balance: agent?.balances,
            details: agent?.details,
            activeCollectionIds: agent?.activeCollectionIds,
            collectionIdHistory: agent?.collectionIdHistory,
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

      if (newAgents?.length < 20) {
        setHasMore(false);
      } else {
        setHasMore(true);
        setAgentPaginated(agentPaginated + 20);
      }

      setAgents?.([
        ...(agents || []),
        ...newAgents?.sort(() => Math.random() - 0.5),
      ]);
    } catch (err: any) {
      console.error(err.message);
    }
    setAgentGalleryLoading(false);
  };

  useEffect(() => {
    if (!agents || agents?.length < 1) {
      setAgentGalleryLoading(true);
    } else {
      setAgentGalleryLoading(false);
    }
  }, [agents]);

  return {
    agentGalleryLoading,
    handleMoreAgents,
    hasMore,
  };
};

export default useAgentGallery;
