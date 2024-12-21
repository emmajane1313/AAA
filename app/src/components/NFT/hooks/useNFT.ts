import { NFTData } from "@/components/Common/types/common.types";
import { useState } from "react";

const useNFT = (id: string) => {
  const [nft, setNft] = useState<NFTData | undefined>();

  return {
    nft,
  };
};

export default useNFT;
