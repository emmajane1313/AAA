import { NFTData } from "@/components/Common/types/common.types";
import { TOKENS } from "@/lib/constants";
import { useEffect, useState } from "react";

const useNFT = (id: string) => {
  const [nft, setNft] = useState<NFTData | undefined>();
  const [nftLoading, setNftLoading] = useState<boolean>(false);

  const handleNFT = async () => {
    setNftLoading(true);
    try {
      setNft({
        id: Number(id),
        url: "",
        title: "NFT " + id,
        description: "Some description here",
        blocktimestamp: "",
        prices: ["200000000000000000000"],
        tokens: [TOKENS[0]?.contract],
        agents: [],
        artist: "0xsadfadfdsfdasasdflasdf1232",
        amount: 10,
        amountSold: 2,
        tokenIds: ["1", "2"],
      });
    } catch (err: any) {
      console.error(err.message);
    }
    setNftLoading(false);
  };

  useEffect(() => {
    if (id && !nft) {
      handleNFT();
    }
  }, [id]);

  return {
    nft,
    nftLoading,
  };
};

export default useNFT;
