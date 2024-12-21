import { NFTData } from "@/components/Common/types/common.types";
import { useState } from "react";

const usePurchase = (nft: NFTData) => {
  const [purchaseLoading, setPurchaseLoading] = useState<boolean>(false);
  const [approved, setApproved] = useState<boolean>(false);

  const handleApprove = async () => {
    setPurchaseLoading(true);
    try {
    } catch (err: any) {
      console.error(err.message);
    }
    setPurchaseLoading(false);
  };

  const handlePurchase = async () => {
    setPurchaseLoading(true);
    try {
    } catch (err: any) {
      console.error(err.message);
    }
    setPurchaseLoading(false);
  };

  return {
    purchaseLoading,
    handlePurchase,
    handleApprove,
    approved
  };
};

export default usePurchase;
