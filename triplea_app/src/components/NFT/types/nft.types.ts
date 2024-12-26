import { LensConnected, NFTData } from "@/components/Common/types/common.types";
import { Post } from "@lens-protocol/client";
import { SetStateAction } from "react";
import { StorageClient } from "@lens-protocol/storage-node-client";

export type DataProps = {
  url: string;
  id: number;
  setImageView: (e: SetStateAction<string | undefined>) => void;
};

export type PurchaseProps = {
  nft: NFTData;
  nftLoading: boolean;
  setNotification: (e: SetStateAction<string | undefined>) => void;
  setNft: (e: SetStateAction<NFTData | undefined>) => void;
  hasMore: boolean;
  handleMoreActivity: () => Promise<void>;
  agentLoading: boolean;
  lensConnected: LensConnected | undefined;
  setSignless: (e: SetStateAction<boolean>) => void;
  storageClient: StorageClient;
};

export interface CollectData {
  amount: number;
  token: string;
}

export type CommentsProps = {
  comments: Post[];
};

export type PostProps = {
  handlePost: () => Promise<void>;
  postLoading: boolean;
  setPost: (e: SetStateAction<string>) => void;
  post: string;
  commentQuote:
    | {
        type: "Comment" | "Quote";
        id: string;
      }
    | undefined;
  setCommentQuote: (
    e: SetStateAction<
      | {
          type: "Comment" | "Quote";
          id: string;
        }
      | undefined
    >
  ) => void;
};
