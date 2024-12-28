import { useEffect, useState } from "react";
import { Order } from "../types/dashboard.types";
import { getOrders } from "../../../../graphql/queries/getOrders";
import { evmAddress, PublicClient } from "@lens-protocol/client";
import fetchAccountsAvailable from "../../../../graphql/lens/queries/availableAccounts";
import { STORAGE_NODE } from "@/lib/constants";

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
        data?.data?.orders?.map(async (collect: any) => {
          const result = await fetchAccountsAvailable(
            {
              managedBy: evmAddress(collect?.collection?.artist),
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
            id: collect?.id,
            totalPrice: collect?.totalPrice,
            token: collect?.token,
            amount: collect?.amount,
            collectionId: collect?.collectionId,
            mintedTokenIds: collect?.mintedTokenIds,
            blockTimestamp: collect?.blockTimestamp,
            transactionHash: collect?.transactionHash,
            collection: {
              id: collect?.collection?.id,
              image: collect?.collection?.metadata?.image,
              title: collect?.collection?.metadata?.title,
              description: collect?.collection?.metadata?.description,
              blocktimestamp: collect?.collection?.blockTimestamp,
              prices: collect?.collection?.prices,
              tokens: collect?.collection?.tokens,
              agents: collect?.collection?.agents,
              artist: collect?.collection?.artist,
              amountSold: collect?.collection?.amountSold,
              tokenIds: collect?.collection?.tokenIds,
              amount: collect?.collection?.amount,
            },
            buyer: collect?.buyer,
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

      setAllCollects(collects);
    } catch (err: any) {
      console.error(err.message);
    }
    setCollectsLoading(false);
  };

  useEffect(() => {
    if (allCollects?.length < 1 && lensClient) {
      handleCollects();
    }
  }, [lensClient]);

  return {
    allCollects,
    collectsLoading,
  };
};

export default useCollects;
