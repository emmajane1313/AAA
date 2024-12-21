import { useState } from "react";
import { Switcher, MintSwitcher } from "../types/dashboard.types";

const useDashboard = () => {
  const [switcher, setSwitcher] = useState<Switcher>(Switcher.Home);
  const [mintSwitcher, setMintSwitcher] = useState<MintSwitcher>(
    MintSwitcher.Collection
  );
  return {
    switcher,
    setSwitcher,
    mintSwitcher,
    setMintSwitcher,
  };
};

export default useDashboard;
