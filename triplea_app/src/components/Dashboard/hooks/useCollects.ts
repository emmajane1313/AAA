import { useEffect, useState } from "react";
import { Order } from "../types/dashboard.types";
import { getOrders } from "../../../../graphql/queries/getOrders";
import { getCollection } from "../../../../graphql/queries/getCollection";
import { INFURA_GATEWAY } from "@/lib/constants";
import { evmAddress, PublicClient } from "@lens-protocol/client";
import fetchAccount from "../../../../graphql/lens/queries/account";

const useCollects = (
  address: `0x${string}` | undefined,
  lensClient: PublicClient
) => {
  const [collectsLoading, setCollectsLoading] = useState<boolean>(false);
  const [allCollects, setAllCollects] = useState<Order[]>([]);

  const handleCollects = async () => {
    if (!address) return;
    setCollectsLoading(true);
    try {
      const data = await getOrders(address);

      const collects: Order[] = await Promise.all(
        data?.data?.collectionCreateds.map(async (sale: any) => {
          const collData = await getCollection(sale?.collectionId);

          let collection = collData?.data?.collectionCreateds?.[0];
          if (!collData?.data?.collectionCreateds?.[0]?.metadata) {
            const cadena = await fetch(
              `${INFURA_GATEWAY}/ipfs/${
                collData?.data?.collectionCreateds?.[0]?.uri.split(
                  "ipfs://"
                )?.[1]
              }`
            );
            collection.metadata = await cadena.json();
          }

          const result = await fetchAccount(
            {
              address: evmAddress(collection?.artist),
            },
            lensClient
          );

          return {
            id: sale?.id,
            totalPrice: sale?.totalPrice,
            token: sale?.token,
            amount: sale?.amount,
            collectionId: sale?.collectionId,
            mintedTokenIds: sale?.mintedTokenIds,
            blockTimestamp: sale?.blockTimestamp,
            collection: {
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
            },
            buyer: sale?.buyer,
            profile: result,
          };
        })
      );

      setAllCollects(collects);
    } catch (err: any) {
      console.error(err.message);
    }
    setCollectsLoading(false);
  };

  useEffect(() => {
    if (allCollects?.length < 1) {
      handleCollects();
    }
  }, []);

  return {
    allCollects,
    collectsLoading,
  };
};

export default useCollects;
