import { LensConnected } from "@/components/Common/types/common.types";
import {
  Agent,
  AgentCollection,
} from "@/components/Dashboard/types/dashboard.types";
import {
  Account,
  AccountStats,
  evmAddress,
  PageSize,
  Post,
  PublicClient,
  TextOnlyMetadata,
} from "@lens-protocol/client";
import { SetStateAction, useEffect, useState } from "react";
import fetchPosts from "../../../../graphql/lens/queries/posts";
import { getAgent } from "../../../../graphql/queries/getAgent";
import { INFURA_GATEWAY, STORAGE_NODE } from "@/lib/constants";
import fetchAccountsAvailable from "../../../../graphql/lens/queries/availableAccounts";
import fetchStats from "../../../../graphql/lens/queries/accountStats";
import unfollow from "../../../../graphql/lens/mutations/unfollow";
import follow from "../../../../graphql/lens/mutations/follow";
import { getAgentRent } from "../../../../graphql/queries/getAgentRent";
import { getCollectionArtist } from "../../../../graphql/queries/getCollectionArtist";

const useAgent = (
  id: string | undefined,
  lensClient: PublicClient,
  lensConnected: LensConnected | undefined,
  setNotification: (e: SetStateAction<string | undefined>) => void,
  setSignless: (e: SetStateAction<boolean>) => void
) => {
  const [screen, setScreen] = useState<number>(0);
  const [agent, setAgent] = useState<Agent | undefined>();
  const [agentLoading, setAgentLoading] = useState<boolean>(false);
  const [activityCursor, setActivityCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [stats, setStats] = useState<AccountStats>();
  const [followLoading, setFollowLoading] = useState<boolean>(false);
  const [agentRent, setAgentRent] = useState<
    {
      amounts: string[];
      collectionIds: string[];
      tokens: string;
      blockTimestamp: string;
      transactionHash: string;
    }[]
  >([]);

  const handleFollow = async () => {
    if (!lensConnected?.sessionClient) return;
    setFollowLoading(true);
    try {
      if (agent?.profile?.operations?.isFollowedByMe) {
        const res = await unfollow(
          {
            account: evmAddress(agent?.profile?.address),
          },
          lensConnected?.sessionClient
        );

        if (
          (res as any)?.reason?.includes(
            "Signless experience is unavailable for this operation. You can continue by signing the sponsored request."
          )
        ) {
          setSignless?.(true);
        } else if ((res as any)?.hash) {
          setNotification("Unfollowed!");
          setStats({
            ...stats!,
            graphFollowStats: {
              ...stats?.graphFollowStats!,
              followers:
                Number(stats?.graphFollowStats?.followers) > 0
                  ? Number(stats?.graphFollowStats?.followers) - 1
                  : 0,
            },
          });
          setAgent({
            ...agent!,
            profile: {
              ...agent?.profile!,
              operations: {
                ...agent?.profile?.operations!,
                isFollowedByMe: false,
              },
            },
          });
        }
      } else {
        const res = await follow(
          {
            account: evmAddress(agent?.profile?.address),
          },
          lensConnected?.sessionClient
        );

        if (
          (res as any)?.reason?.includes(
            "Signless experience is unavailable for this operation. You can continue by signing the sponsored request."
          )
        ) {
          setSignless?.(true);
        } else if ((res as any)?.hash) {
          setNotification("Followed!");
          setStats({
            ...stats!,
            graphFollowStats: {
              ...stats?.graphFollowStats!,
              followers: Number(stats?.graphFollowStats?.followers) + 1,
            },
          });
          setAgent({
            ...agent!,
            profile: {
              ...agent?.profile!,
              operations: {
                ...agent?.profile?.operations!,
                isFollowedByMe: true,
              },
            },
          });
        }
      }
    } catch (err: any) {
      console.error(err.message);
    }
    setFollowLoading(false);
  };

  const handleActivity = async (
    reset: boolean,
    agentInput?: string
  ): Promise<Post[] | void> => {
    try {
      const postsRes = await fetchPosts(
        {
          pageSize: PageSize.Fifty,
          filter: {
            authors: [agentInput ? agentInput : agent?.profile?.address],
            metadata: {
              tags: {
                oneOf: ["tripleA"],
              },
            },
          },
        },
        lensConnected?.sessionClient || lensClient
      );

      let posts: Post[] = [];

      if ((postsRes as any)?.items?.length > 0) {
        posts = (postsRes as any)?.items;
      } else {
        const postsRes = await fetchPosts(
          {
            pageSize: PageSize.Fifty,
            filter: {
              authors: [agentInput ? agentInput : agent?.profile?.address],
            },
          },
          lensConnected?.sessionClient || lensClient
        );
        posts = (postsRes as any)?.items?.filter((pos: Post) =>
          (pos?.metadata as TextOnlyMetadata)?.tags?.includes("tripleA")
        );
      }

      posts = await Promise.all(
        posts?.map(async (post) => {
          let picture = post?.author?.metadata?.picture;

          if (post?.author?.metadata?.picture) {
            const cadena = await fetch(
              `${STORAGE_NODE}/${
                post?.author?.metadata?.picture?.split("lens://")?.[1]
              }`
            );

            if (cadena) {
              const json = await cadena.json();
              picture = json.item;
            }
          }

          return {
            ...post,
            author: {
              ...post?.author,
              metadata: {
                ...post?.author?.metadata,
                picture,
              },
            },
          } as Post;
        })
      );

      if ((postsRes as any)?.pageInfo?.next) {
        setHasMore(true);
        setActivityCursor((postsRes as any)?.pageInfo?.next);
      } else {
        setHasMore(false);
        setActivityCursor(undefined);
      }

      if (!reset) {
        return posts;
      } else {
        setAgent({
          ...agent!,
          activity: posts || [],
        });
      }
    } catch (err: any) {
      console.error(err.message);
    }
  };

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
        lensConnected?.sessionClient || lensClient
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
        lensConnected?.sessionClient || lensClient
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

      const posts = await handleActivity(
        false,
        (result as any)?.[0]?.account?.address
      );

      let activeCollectionIds: AgentCollection[] = [];
      let collectionIdsHistory: AgentCollection[] = [];
      let details: any[] = [];

      await Promise.all(
        res?.data?.agentCreateds?.[0]?.activeCollectionIds?.map(
          async (id: any) => {
            const result = await fetchAccountsAvailable(
              {
                managedBy: evmAddress(id?.artist),
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
                managedBy: evmAddress(id?.artist),
              },
              lensConnected?.sessionClient || lensClient
            );

            collectionIdsHistory.push({
              profile: (result as any)?.[0]?.account as Account,
              collectionId: id?.collectionId,
              metadata: id?.metadata,
            });
          }
        )
      );

      await Promise.all(
        res?.data?.agentCreateds?.[0]?.details?.map(async (id: any) => {
          const col = await getCollectionArtist(Number(id?.collectionId));

          const result = await fetchAccountsAvailable(
            {
              managedBy: evmAddress(col?.data?.collectionCreateds?.[0]?.artist),
            },
            lensConnected?.sessionClient || lensClient
          );

          details.push({
            profile: (result as any)?.[0]?.account as Account,
            collectionId: id?.collectionId,
            instructions: id?.instructions,
            dailyFrequency: id?.dailyFrequency,
            tokens: col?.data?.collectionCreateds?.[0]?.tokens,
            metadata: {
              image: col?.data?.collectionCreateds?.[0]?.metadata?.image,
              title: col?.data?.collectionCreateds?.[0]?.metadata?.title,
            },
          });
        })
      );

      const stats = await fetchStats(
        {
          account: (result as any)?.[0]?.account?.owner,
        },
        lensConnected?.sessionClient || lensClient
      );

      setStats(stats as AccountStats);

      const rent = await getAgentRent(
        Number(res?.data?.agentCreateds?.[0]?.AAAAgents_id)
      );

      setAgentRent(rent?.data?.rentPaids);

      setAgent({
        id: res?.data?.agentCreateds?.[0]?.AAAAgents_id,
        cover: metadata?.cover,
        title: metadata?.title,
        customInstructions: metadata?.customInstructions,
        description: metadata?.description,
        wallet: res?.data?.agentCreateds?.[0]?.wallets?.[0],
        balance: res?.data?.agentCreateds?.[0]?.balances,
        owner: res?.data?.agentCreateds?.[0]?.owner,
        details,
        profile,
        activity: posts || [],
        activeCollectionIds,
        collectionIdsHistory,
        accountConnected: (result as any)?.[0]?.account?.address,
        ownerProfile,
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
          pageSize: PageSize.Fifty,
          cursor: activityCursor,
          filter: {
            authors: [agent?.profile?.address],
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
      } else {
        const postsRes = await fetchPosts(
          {
            pageSize: PageSize.Fifty,
            filter: {
              authors: [agent?.profile?.address],
            },
          },
          lensConnected?.sessionClient || lensClient
        );
        posts = (postsRes as any)?.items?.filter((pos: Post) =>
          (pos?.metadata as TextOnlyMetadata)?.tags?.includes("tripleA")
        );
      }

      if ((postsRes as any)?.pageInfo?.next) {
        setHasMore(true);
        setActivityCursor((postsRes as any)?.pageInfo?.next);
      } else {
        setHasMore(false);
        setActivityCursor(undefined);
      }

      posts = await Promise.all(
        posts?.map(async (post) => {
          let picture = post?.author?.metadata?.picture;

          if (post?.author?.metadata?.picture) {
            const cadena = await fetch(
              `${STORAGE_NODE}/${
                post?.author?.metadata?.picture?.split("lens://")?.[1]
              }`
            );

            if (cadena) {
              const json = await cadena.json();
              picture = json.item;
            }
          }

          return {
            ...post,
            author: {
              ...post?.author,
              metadata: {
                ...post?.author?.metadata,
                picture,
              },
            },
          } as Post;
        })
      );

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
    handleActivity,
    stats,
    followLoading,
    handleFollow,
    agentRent,
  };
};

export default useAgent;
