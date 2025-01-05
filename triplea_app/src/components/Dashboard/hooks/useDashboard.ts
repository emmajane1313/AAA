import { useEffect, useState } from "react";
import {
  Switcher,
  MintSwitcher,
  DropInterface,
} from "../types/dashboard.types";
import { getDrops } from "../../../../graphql/queries/getDrops";
import { INFURA_GATEWAY } from "@/lib/constants";
import { LensConnected } from "@/components/Common/types/common.types";

const useDashboard = (
  address: `0x${string}` | undefined,
  lensConnected: LensConnected | undefined
) => {
  const [switcher, setSwitcher] = useState<Switcher>(Switcher.Home);
  const [mintSwitcher, setMintSwitcher] = useState<MintSwitcher>(
    MintSwitcher.Collection
  );
  const [allDrops, setAllDrops] = useState<DropInterface[]>([]);
  const [allDropsLoading, setAllDropsLoading] = useState<boolean>(false);

  const handleAllDrops = async () => {
    if (!address) return;
    setAllDropsLoading(true);
    try {
      const data = await getDrops(address);
      const drops: DropInterface[] = await Promise.all(
        data?.data?.dropCreateds?.map(async (drop: any) => {
          if (!drop.metadata && drop?.uri) {
            const cadena = await fetch(
              `${INFURA_GATEWAY}/ipfs/${drop.uri.split("ipfs://")?.[1]}`
            );
            drop.metadata = await cadena.json();
          }

          return {
            id: drop?.dropId,
            title: drop?.metadata?.title,
            cover: drop?.metadata?.cover,
            collectionIds: drop?.collectionIds,
          };
        })
      );

      setAllDrops(drops);
    } catch (err: any) {
      console.error(err.message);
    }
    setAllDropsLoading(false);
  };

  useEffect(() => {
    handleAllDrops();
  }, [address, lensConnected?.profile]);

  return {
    switcher,
    setSwitcher,
    mintSwitcher,
    setMintSwitcher,
    allDrops,
    allDropsLoading,
  };
};

export default useDashboard;
