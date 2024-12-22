import { useEffect, useState } from "react";
import { NFTData } from "../types/common.types";
import { getCollections } from "../../../../graphql/queries/getGallery";
import { INFURA_GATEWAY } from "@/lib/constants";

const useGallery = () => {
  const [nfts, setNfts] = useState<NFTData[]>([]);
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [galleryLoading, setGalleryLoading] = useState<boolean>(false);

  const handleGallery = async (): Promise<void> => {
    setGalleryLoading(true);
    try {
      const data = await getCollections(page);

      const gallery: NFTData[] = await Promise.all(
        data?.data?.collectionCreateds.map(async (collection: any) => {
          if (!collection.metadata) {
            const cadena = await fetch(
              `${INFURA_GATEWAY}/ipfs/${collection.uri.split("ipfs://")?.[1]}`
            );
            collection.metadata = await cadena.json();
          }

          return {
            id: collection?.collectionId,
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
          };
        })
      );

      setPage(gallery?.length == 20 ? 20 : 0);
      setHasMore(gallery?.length == 20 ? true : false);
      setNfts(gallery);
    } catch (err: any) {
      console.error(err.message);
    }
    setGalleryLoading(false);
  };

  const getRandomSize = () => {
    const sizes = [
      "row-[span_20_/_span_20] w-full",
      "row-[span_30_/_span_30] w-full",
      "row-[span_35_/span_35_] w-full",
    ];
    return sizes[Math.floor(Math.random() * sizes.length)];
  };

  useEffect(() => {
    if (nfts?.length < 1) {
      handleGallery();
    }
  }, []);

  const handleMoreGallery = async () => {
    setGalleryLoading(true);
    try {
      const data = await getCollections(page);

      const gallery: NFTData[] = await Promise.all(
        data?.data?.collectionCreateds.map(async (collection: any) => {
          if (!collection.metadata) {
            const cadena = await fetch(
              `${INFURA_GATEWAY}/ipfs/${collection.uri.split("ipfs://")?.[1]}`
            );
            collection.metadata = await cadena.json();
          }

          return {
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
          };
        })
      );

      setPage(gallery?.length == 20 ? page + 20 : page);
      setHasMore(gallery?.length == 20 ? true : false);
      setNfts([...nfts, ...gallery]);
    } catch (err: any) {
      console.error(err.message);
    }
    setGalleryLoading(false);
  };

  return {
    handleMoreGallery,
    nfts,
    getRandomSize,
    hasMore,
    galleryLoading,
  };
};

export default useGallery;
