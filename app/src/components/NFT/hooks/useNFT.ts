import { NFTData } from "@/components/Common/types/common.types";
import { INFURA_GATEWAY } from "@/lib/constants";
import { useEffect, useState } from "react";
import { getCollection } from "../../../../graphql/queries/getCollection";

const useNFT = (id: string) => {
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
  };
};

export default useNFT;
