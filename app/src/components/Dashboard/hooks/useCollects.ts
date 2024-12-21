import { SetStateAction, useEffect, useState } from "react";
import { Agent, Order } from "../types/dashboard.types";

const useCollects = () => {
  const [collectsLoading, setCollectsLoading] = useState<boolean>(false);
  const [allCollects, setAllCollects] = useState<Order[]>([]);

  const handleCollects = async () => {
    setCollectsLoading(true);

    try {
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
