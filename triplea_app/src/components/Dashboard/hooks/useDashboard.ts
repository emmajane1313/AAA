import { useEffect, useState } from "react";
import {
  Switcher,
  MintSwitcher,
  DropInterface,
} from "../types/dashboard.types";

const useDashboard = () => {
  const [switcher, setSwitcher] = useState<Switcher>(Switcher.Home);
  const [mintSwitcher, setMintSwitcher] = useState<MintSwitcher>(
    MintSwitcher.Collection
  );
  const [allDrops, setAllDrops] = useState<DropInterface[]>([]);
  const [allDropsLoading, setAllDropsLoading] = useState<boolean>(false);

  const handleAllDrops = async () => {
    setAllDropsLoading(true);
    try {
    } catch (err: any) {
      console.error(err.message);
    }
    setAllDropsLoading(false);
  };

  useEffect(() => {
    if (allDrops?.length < 1) {
      handleAllDrops();
    }
  }, []);

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
