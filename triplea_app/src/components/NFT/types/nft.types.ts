import { NFTData } from "@/components/Common/types/common.types";
import { SetStateAction } from "react";

export type DataProps = {
  url: string;
  id: number;
  setImageView: (e: SetStateAction<string | undefined>) => void;
};

export type PurchaseProps = {
  nft: NFTData;
  nftLoading: boolean
  setNotification: (e: SetStateAction<string | undefined>) => void
  setNft: (e: SetStateAction<NFTData | undefined>) => void
};

export interface CollectData {
  amount: number;
  token: string;
}
