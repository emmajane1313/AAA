import {
  Collector,
  LensConnected,
  NFTData,
} from "@/components/Common/types/common.types";
import { INFURA_GATEWAY, STORAGE_NODE } from "@/lib/constants";
import { useEffect, useState } from "react";
import { getCollection } from "../../../../graphql/queries/getCollection";
import {
  evmAddress,
  MainContentFocus,
  PageSize,
  Post,
  PostType,
  PublicClient,
  TextOnlyMetadata,
} from "@lens-protocol/client";
import fetchAccountsAvailable from "../../../../graphql/lens/queries/availableAccounts";
import { getCollectors } from "../../../../graphql/queries/getCollectors";
import fetchPosts from "../../../../graphql/lens/queries/posts";
import { Agent } from "@/components/Dashboard/types/dashboard.types";
import { fetchPosts as fetchP } from "@lens-protocol/client/actions";

const useNFT = (
  id: string,
  lensClient: PublicClient,
  agents: Agent[],
  lensConnected: LensConnected | undefined
) => {
  const [nft, setNft] = useState<NFTData | undefined>();
  const [nftLoading, setNftLoading] = useState<boolean>(false);
  const [agentLoading, setAgentLoading] = useState<boolean>(false);
  const [activityCursor, setActivityCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState<boolean>(true);

  const handlePosts = async (
    reset: boolean,
    title?: string
  ): Promise<Post[] | void> => {
    try {
      const postsRes = await fetchPosts(
        {
          pageSize: PageSize.Fifty,
          filter: {
            metadata: {
              tags: {
                all: [
                  "tripleA",
                  (title || nft?.title?.replaceAll(" ", "")?.toLowerCase())!,
                ]?.filter(Boolean),
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
          },
          lensConnected?.sessionClient || lensClient
        );

        posts = (postsRes as any)?.items?.filter(
          (pos: Post) =>
            (pos?.metadata as TextOnlyMetadata)?.tags?.includes("tripleA") &&
            (pos?.metadata as TextOnlyMetadata)?.tags?.includes(
              (title || nft?.title?.replaceAll(" ", "")?.toLowerCase())!
            )
        );
      }

      if ((postsRes as any)?.pageInfo?.next) {
        setHasMore(true);
        setActivityCursor((postsRes as any)?.pageInfo?.next);
      } else {
        setHasMore(false);
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


      if (!reset) {
        return posts;
      } else {
        setNft({
          ...nft!,
          agentActivity: posts || [],
        });
      }
    } catch (err: any) {
      console.error(err.message);
    }
  };

  const handleNFT = async () => {
    setNftLoading(true);
    try {
      const collData = await getCollection(Number(id));

      let collection = collData?.data?.collectionCreateds?.[0];
      if (!collData?.data?.collectionCreateds?.[0]?.metadata) {
        const cadena = await fetch(
          `${INFURA_GATEWAY}/ipfs/${
            collData?.data?.collectionCreateds?.[0]?.uri.split("ipfs://")?.[1]
          }`
        );
        collection.metadata = await cadena.json();
      }

      const result = await fetchAccountsAvailable(
        {
          managedBy: evmAddress(collection?.artist),
        },
        lensConnected?.sessionClient || lensClient
      );

      const res = await getCollectors(Number(id));

      let collectors: Collector[] = [];

      for (let i = 0; i < res?.data?.orders?.length; i++) {
        const accounts = await fetchAccountsAvailable(
          {
            managedBy: evmAddress(res?.data?.orders?.[i]?.buyer),
          },
          lensConnected?.sessionClient || lensClient
        );

        let picture = "";
        const cadena = await fetch(
          `${STORAGE_NODE}/${
            (accounts as any)?.[0]?.account?.metadata?.picture?.split(
              "lens://"
            )?.[1]
          }`
        );

        if (cadena) {
          const json = await cadena.json();
          picture = json.item;
        }

        collectors.push({
          transactionHash: res?.data?.orders?.[i]?.transactionHash,
          blockTimestamp: res?.data?.orders?.[i]?.blockTimestamp,
          amount: res?.data?.orders?.[i]?.amount,
          address: res?.data?.orders?.[i]?.buyer,
          pfp: picture,
          localName: (accounts as any)?.[0]?.account?.username?.localName,
          name: (accounts as any)?.[0]?.account?.metadata?.name,
        });
      }

      const posts = await handlePosts(
        false,
        collection?.metadata?.title?.replaceAll(" ", "")?.toLowerCase()!
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

      setNft({
        id: Number(collection?.id),
        image: collection?.metadata?.image,
        title: collection?.metadata?.title,
        description: collection?.metadata?.description,
        blocktimestamp: collection?.blockTimestamp,
        active: collection?.active,
        prices: collection?.prices,
        tokens: collection?.tokens,
        agents: collection?.agents,
        artist: collection?.artist,
        amountSold: collection?.amountSold,
        tokenIds: collection?.tokenIds,
        amount: collection?.amount,
        profile: {
          ...(result as any)?.[0]?.account,
          metadata: {
            ...(result as any)?.[0]?.account?.metadata,
            picture,
          },
        },
        collectors,
        agentActivity: posts || [],
      });
    } catch (err: any) {
      console.error(err.message);
    }
    setNftLoading(false);
  };

  const handleMoreActivity = async () => {
    if (!hasMore || !activityCursor) return;
    setAgentLoading(true);
    try {
      const postsRes = await fetchPosts(
        {
          pageSize: PageSize.Fifty,
          cursor: activityCursor,
          filter: {
            metadata: {
              tags: {
                all: [
                  "tripleA",
                  nft?.title?.replaceAll(" ", "")?.toLowerCase()!,
                ],
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
          },
          lensConnected?.sessionClient || lensClient
        );
        posts = (postsRes as any)?.items?.filter(
          (pos: Post) =>
            (pos?.metadata as TextOnlyMetadata)?.tags?.includes("tripleA") &&
            (pos?.metadata as TextOnlyMetadata)?.tags?.includes(
              nft?.title?.replaceAll(" ", "")?.toLowerCase()!
            )
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

      
      setNft({
        ...(nft as NFTData),
        agentActivity: [...(nft?.agentActivity || []), ...posts],
      });
    } catch (err: any) {
      console.error(err.message);
    }
    setAgentLoading(false);
  };

  useEffect(() => {
    if (Number(id) > 0 && !nft && lensClient && agents?.length > 0) {
      handleNFT();
    }
  }, [id, lensClient, agents, lensConnected?.sessionClient]);

  return {
    nft,
    nftLoading,
    setNft,
    agentLoading,
    handleMoreActivity,
    hasMore,
    handlePosts,
  };
};

export default useNFT;
