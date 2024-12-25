import { Collector, NFTData } from "@/components/Common/types/common.types";
import { INFURA_GATEWAY } from "@/lib/constants";
import { useEffect, useState } from "react";
import { getCollection } from "../../../../graphql/queries/getCollection";
import { evmAddress, PublicClient } from "@lens-protocol/client";
import fetchAccountsAvailable from "../../../../graphql/lens/queries/availableAccounts";
import { getCollectors } from "../../../../graphql/queries/getCollectors";

const useNFT = (id: string, lensClient: PublicClient) => {
  const [nft, setNft] = useState<NFTData | undefined>();
  const [nftLoading, setNftLoading] = useState<boolean>(false);

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
        lensClient
      );

      const res = await getCollectors(Number(id));

      console.log({res})

      let collectors: Collector[] = [];

      for (let i = 0; i < res?.data?.orders?.length; i++) {
        const accounts = await fetchAccountsAvailable(
          {
            managedBy: evmAddress(res?.data?.orders?.[i]?.buyer),
          },
          lensClient
        );

        collectors.push({
          transactionHash: res?.data?.orders?.[i]?.transactionHash,
          blockTimestamp: res?.data?.orders?.[i]?.blockTimestamp,
          amount: res?.data?.orders?.[i]?.amount,
          address: res?.data?.orders?.[i]?.buyer,
          pfp: (accounts as any)?.[0]?.account?.username?.namespace?.metadata
            ?.picture,
          name: (accounts as any)?.[0]?.account?.username?.localName,
        });
      }

      setNft({
        id: collection?.id,
        image: collection?.metadata?.image,
        title: collection?.metadata?.title,
        description: collection?.metadata?.description,
        blocktimestamp: collection?.blockTimestamp,
        prices: collection?.prices,
        tokens: collection?.tokens,
        agents: collection?.agents,
        artist: collection?.artist,
        amountSold: collection?.amountSold,
        tokenIds: collection?.tokenIds,
        amount: collection?.amount,
        profile: (result as any)?.[0]?.account,
        collectors,
      });
    } catch (err: any) {
      console.error(err.message);
    }
    setNftLoading(false);
  };

  useEffect(() => {
    if (id && !nft) {
      handleNFT();
    }
  }, [id]);

  return {
    nft,
    nftLoading,
    setNft
  };
};

export default useNFT;
