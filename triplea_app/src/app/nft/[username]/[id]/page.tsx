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
  const { nft, nftLoading, setNft, hasMore, handleMoreActivity, agentLoading } =
    useNFT(id?.id as string, context?.lensClient!, context?.agents!);

  return (
    <div className="relative w-full h-full flex flex-row items-start justify-between gap-4 pb-10">
      <Data
        id={nft?.id!}
        url={nft?.image!}
        setImageView={context?.setImageView!}
      />
      <Purchase
        nft={nft!}
        setIndexer={context?.setIndexer!}
        nftLoading={nftLoading}
        setNotification={context?.setNotification!}
        setNft={setNft}
        hasMore={hasMore}
        handleMoreActivity={handleMoreActivity}
        agentLoading={agentLoading}
        lensConnected={context?.lensConnected}
        setSignless={context?.setSignless!}
        storageClient={context?.storageClient!}
        setImageView={context?.setImageView!}
      />
    </div>
  );
}
