import { useEffect, useState } from "react";
import { NFTData } from "@/components/Common/types/common.types";
import { DropInterface } from "../types/dashboard.types";

const useDrops = (drop: DropInterface | undefined) => {
  const [collectionsLoading, setCollectionsLoading] = useState<boolean>(false);
  const [allCollections, setAllCollections] = useState<NFTData[]>([]);

  const handleCollections = async () => {
    setCollectionsLoading(true);

    try {
    } catch (err: any) {
      console.error(err.message);
    }
    setCollectionsLoading(false);
  };

  useEffect(() => {
    if (allCollections?.length < 1 && drop) {
      handleCollections();
    }
  }, []);

  return {
    allCollections,
    collectionsLoading,
  };
};

export default useDrops;
