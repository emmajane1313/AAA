import { LensConnected, NFTData } from "@/components/Common/types/common.types";
import { ImageMetadata, Post, TextOnlyMetadata } from "@lens-protocol/client";
import { SetStateAction } from "react";
import { StorageClient } from "@lens-protocol/storage-node-client";
import { ImageMetadataV3, TextOnlyMetadataV3 } from "../../../../generated";

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
  setImageView: (e: SetStateAction<string | undefined>) => void;
};

export interface CollectData {
  amount: number;
  token: string;
}

export type CommentsProps = {
  comments: Post[];
  setImageView: (e: SetStateAction<string | undefined>) => void;
  postLoading: boolean;
  interactionsLoading: {
    mirror: boolean;
    like: boolean;
    id: string;
  }[];
  handleLike: (id: string, reaction: string) => Promise<void>;
  handleMirror: (id: string) => Promise<void>;
  setCommentQuote: (
    e: SetStateAction<
      | {
          type: "Comment" | "Quote";
          id: string;
        }
      | undefined
    >
  ) => void;
  commentQuote:
    | {
        type: "Comment" | "Quote";
        id: string;
      }
    | undefined;
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

export type MetadataProps = {
  metadata: string;
  data: TextOnlyMetadata | ImageMetadata;
  setImageView: (e: SetStateAction<string | undefined>) => void;
};
