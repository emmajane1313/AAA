"use client";

import { ModalContext } from "@/app/providers";
import useNFT from "@/components/NFT/hooks/useNFT";
import Data from "@/components/NFT/modules/Data";
import Purchase from "@/components/NFT/modules/Purchase";
import { useParams } from "next/navigation";
import { useContext } from "react";

export default function NFT() {
  const id = useParams();
  const context = useContext(ModalContext);
  const { nft, nftLoading } = useNFT(id?.id as string);

  return (
    <div className="relative w-full h-full flex flex-row items-start justify-between gap-4 pb-10">
      <Data
        id={nft?.id!}
        url={nft?.image!}
        setImageView={context?.setImageView!}
      />
      <Purchase nft={nft!} nftLoading={nftLoading} />
    </div>
  );
}
