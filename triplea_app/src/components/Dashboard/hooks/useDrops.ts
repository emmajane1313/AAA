import { useEffect, useState } from "react";
import { NFTData } from "@/components/Common/types/common.types";
import { DropInterface } from "../types/dashboard.types";
import { INFURA_GATEWAY, STORAGE_NODE } from "@/lib/constants";
import { getDrop } from "../../../../graphql/queries/getDrop";
import { evmAddress, PublicClient } from "@lens-protocol/client";
import fetchAccountsAvailable from "../../../../graphql/lens/queries/availableAccounts";

const useDrops = (
  drop: DropInterface | undefined,
  lensClient: PublicClient
) => {
  const [collectionsLoading, setCollectionsLoading] = useState<boolean>(false);
  const [allCollections, setAllCollections] = useState<NFTData[]>([]);

  const handleCollections = async () => {
    if (!drop?.id) return;
    setCollectionsLoading(true);

    try {
      const data = await getDrop(Number(drop?.id));

      const collections: NFTData[] = await Promise.all(
        data?.data?.collectionCreateds.map(async (collection: any) => {
          if (!collection.metadata) {
            const cadena = await fetch(
              `${INFURA_GATEWAY}/ipfs/${collection.uri.split("ipfs://")?.[1]}`
            );
            collection.metadata = await cadena.json();
          }

          const result = await fetchAccountsAvailable(
            {
              managedBy: evmAddress(collection?.artist),
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
            id: collection?.collectionId,
            image: collection?.metadata?.image,
            title: collection?.metadata?.title,
            description: collection?.metadata?.description,
            tokens: collection?.tokens,
            prices: collection?.prices,
            agents: collection?.agents,
            active: collection?.active,
            amountSold: collection?.amountSold,
            amount: collection?.amount,
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

      setAllCollections(collections);
    } catch (err: any) {
      console.error(err.message);
    }
    setCollectionsLoading(false);
  };

  useEffect(() => {
    if (allCollections?.length < 1 && drop && lensClient) {
      handleCollections();
    }
  }, [lensClient]);

  return {
    allCollections,
    collectionsLoading,
  };
};

export default useDrops;
