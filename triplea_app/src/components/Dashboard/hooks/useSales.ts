import { useEffect, useState } from "react";
import { Order } from "../types/dashboard.types";
import { getSales } from "../../../../graphql/queries/getSales";
import { getCollection } from "../../../../graphql/queries/getCollection";
import { INFURA_GATEWAY } from "@/lib/constants";
import fetchAccount from "../../../../graphql/lens/queries/account";
import { evmAddress, PublicClient } from "@lens-protocol/client";

const useSales = (
  address: `0x${string}` | undefined,
  lensClient: PublicClient
) => {
  const [salesLoading, setSalesLoading] = useState<boolean>(false);
  const [allSales, setAllSales] = useState<Order[]>([]);

  const handleSales = async () => {
    if (!address) return;
    setSalesLoading(true);
    try {
      const data = await getSales(address);

      const sales: Order[] = await Promise.all(
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

      setAllSales(sales);
    } catch (err: any) {
      console.error(err.message);
    }
    setSalesLoading(false);
  };

  useEffect(() => {
    if (allSales?.length < 1) {
      handleSales();
    }
  }, []);

  return {
    allSales,
    salesLoading,
  };
};

export default useSales;
