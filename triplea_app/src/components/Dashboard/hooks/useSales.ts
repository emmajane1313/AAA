import { useEffect, useState } from "react";
import { Order } from "../types/dashboard.types";
import { getSales } from "../../../../graphql/queries/getSales";
import { getCollection } from "../../../../graphql/queries/getCollection";
import { INFURA_GATEWAY } from "@/lib/constants";
import { evmAddress, PublicClient } from "@lens-protocol/client";
import fetchAccountsAvailable from "../../../../graphql/lens/queries/availableAccounts";

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
        data?.data?.orders?.map(async (sale: any) => {
          const result = await fetchAccountsAvailable(
            {
              managedBy: evmAddress(sale?.collection?.artist),
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
            transactionHash: sale?.transactionHash,
            collection: {
              id: sale?.collection?.id,
              image: sale?.collection?.metadata?.image,
              title: sale?.collection?.metadata?.title,
              description: sale?.collection?.metadata?.description,
              blocktimestamp: sale?.collection?.blockTimestamp,
              prices: sale?.collection?.prices,
              tokens: sale?.collection?.tokens,
              agents: sale?.collection?.agents,
              artist: sale?.collection?.artist,
              amountSold: sale?.collection?.amountSold,
              tokenIds: sale?.collection?.tokenIds,
              amount: sale?.collection?.amount,
            },
            buyer: sale?.buyer,
            profile: (result as any)?.[0]?.account,
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
