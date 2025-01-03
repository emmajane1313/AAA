import { LensConnected } from "@/components/Common/types/common.types";
import {
  Agent,
  AgentCollection,
} from "@/components/Dashboard/types/dashboard.types";
import { Account, evmAddress, Post, PublicClient } from "@lens-protocol/client";
import { useEffect, useState } from "react";
import fetchPosts from "../../../../graphql/lens/queries/posts";
import { getAgent } from "../../../../graphql/queries/getAgent";
import { INFURA_GATEWAY, STORAGE_NODE } from "@/lib/constants";
import fetchAccountsAvailable from "../../../../graphql/lens/queries/availableAccounts";

const useAgent = (
  id: string | undefined,
  lensClient: PublicClient,
  lensConnected: LensConnected | undefined
) => {
  const [screen, setScreen] = useState<number>(0);
  const [agent, setAgent] = useState<Agent | undefined>();
  const [agentLoading, setAgentLoading] = useState<boolean>(false);
  const [activityCursor, setActivityCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState<boolean>(true);

  const handleAgent = async () => {
    if (!id) return;

    setAgentLoading(true);
    try {
      const res = await getAgent(Number(id));
      let metadata: any = res?.data?.agentCreateds?.[0]?.metadata;

      if (!res?.data?.agentCreateds?.[0]?.metadata) {
        const cadena = await fetch(
          `${INFURA_GATEWAY}/ipfs/${
            res?.data?.agentCreateds?.[0]?.uri?.includes("ipfs://")
              ? res?.data?.agentCreateds?.[0]?.uri?.split("ipfs://")?.[1]
              : res?.data?.agentCreateds?.[0]?.uri
          }`
        );
        metadata = await cadena.json();
      }

      const result = await fetchAccountsAvailable(
        {
          managedBy: evmAddress(res?.data?.agentCreateds?.[0]?.wallets?.[0]),
        },
        lensClient
      );
      let picture = "";
      let profile: any;

      if (result) {
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

        profile = {
          ...(result as any)?.[0]?.account,
          metadata: {
            ...(result as any)?.[0]?.account?.metadata,
            picture,
          },
        };
      }

      const resultOwner = await fetchAccountsAvailable(
        {
          managedBy: evmAddress(res?.data?.agentCreateds?.[0]?.owner),
        },
        lensClient
      );
      let ownerPicture = "";
      let ownerProfile: any;

      if (resultOwner) {
        const cadena = await fetch(
          `${STORAGE_NODE}/${
            (resultOwner as any)?.[0]?.account?.metadata?.picture?.split(
              "lens://"
            )?.[1]
          }`
        );

        if (cadena) {
          const json = await cadena.json();
          ownerPicture = json.item;
        }

        ownerProfile = {
          ...(resultOwner as any)?.[0]?.account,
          metadata: {
            ...(resultOwner as any)?.[0]?.account?.metadata,
            picture: ownerPicture,
          },
        };
      }

      const postsRes = await fetchPosts(
        {
          pageSize: "TEN",
          filter: {
            metadata: {
              tags: {
                oneOf: ["tripleA"],
              },
            },
            // authors: [(result as any)?.[0]?.account?.address],
          },
        },
        lensConnected?.sessionClient || lensClient
      );

      let posts: Post[] = [];

      if ((postsRes as any)?.items?.length > 0) {
        posts = (postsRes as any)?.items;
      }

      if ((postsRes as any)?.pageInfo?.next) {
        setHasMore(true);
        setActivityCursor((postsRes as any)?.pageInfo?.next);
      } else {
        setHasMore(false);
        setActivityCursor(undefined);
      }

      let activeCollectionIds: AgentCollection[] = [];
      let collectionIdsHistory: AgentCollection[] = [];

      await Promise.all(
        res?.data?.agentCreateds?.[0]?.activeCollectionIds?.map(
          async (id: any) => {
            const result = await fetchAccountsAvailable(
              {
                managedBy: evmAddress(id?.owner),
              },
              lensClient
            );

            activeCollectionIds.push({
              profile: (result as any)?.[0]?.account as Account,
              collectionId: id?.collectionId,
              metadata: id?.metadata,
            });
          }
        )
      );

      await Promise.all(
        res?.data?.agentCreateds?.[0]?.collectionIdsHistory?.map(
          async (id: any) => {
            const result = await fetchAccountsAvailable(
              {
                managedBy: evmAddress(id?.owner),
              },
              lensClient
            );

            collectionIdsHistory.push({
              profile: (result as any)?.[0]?.account as Account,
              collectionId: id?.collectionId,
              metadata: id?.metadata,
            });
          }
        )
      );



      setAgent({
        id: res?.data?.agentCreateds?.[0]?.AAAAgents_id,
        cover: metadata?.cover,
        title: metadata?.title,
        customInstructions: metadata?.customInstructions,
        description: metadata?.description,
        wallet: res?.data?.agentCreateds?.[0]?.wallets?.[0],
        balance: res?.data?.agentCreateds?.[0]?.balances,
        owner: res?.data?.agentCreateds?.[0]?.owner,
        profile,
        activity: posts,
        activeCollectionIds,
        collectionIdsHistory,
        accountConnected: (result as any)?.[0]?.account?.address,
        ownerProfile,
        rentPaid: res?.data?.agentCreateds?.[0]?.rentPaid || [],
      });
    } catch (err: any) {
      console.error(err.message);
    }
    setAgentLoading(false);
  };

  const handleMoreActivity = async () => {
    if (!hasMore || !activityCursor || !id) return;
    setAgentLoading(true);
    try {
      const postsRes = await fetchPosts(
        {
          pageSize: "TEN",
          filter: {
            metadata: {
              tags: {
                oneOf: ["tripleA"],
              },
            },
            // authors: [agent?.accountConnected],
          },
        },
        lensConnected?.sessionClient || lensClient
      );

      let posts: Post[] = [];

      if ((postsRes as any)?.items?.length > 0) {
        posts = (postsRes as any)?.items;
      }

      if ((postsRes as any)?.pageInfo?.next) {
        setHasMore(true);
        setActivityCursor((postsRes as any)?.pageInfo?.next);
      } else {
        setHasMore(false);
        setActivityCursor(undefined);
      }

      setAgent({
        ...(agent as Agent),
        activity: [...(agent?.activity || []), ...posts],
      });
    } catch (err: any) {
      console.error(err.message);
    }
    setAgentLoading(false);
  };

  useEffect(() => {
    if (id && !agent && lensClient) {
      handleAgent();
    }
  }, [id, lensClient]);

  return {
    agent,
    agentLoading,
    hasMore,
    handleMoreActivity,
    screen,
    setScreen,
    setAgent,
  };
};

export default useAgent;
