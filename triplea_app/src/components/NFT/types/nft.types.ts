import {
  LensConnected,
  NFTData,
  TokenThreshold,
} from "@/components/Common/types/common.types";
import { ImageMetadata, Post, TextOnlyMetadata } from "@lens-protocol/client";
import { SetStateAction } from "react";
import { StorageClient } from "@lens-protocol/storage-node-client";
import { Agent } from "@/components/Dashboard/types/dashboard.types";

export type DataProps = {
  url: string;
  id: number;
  setImageView: (e: SetStateAction<string | undefined>) => void;
};

export type PurchaseProps = {
  nft: NFTData;
  handlePosts: (bool: true) => Promise<Post[] | void>;
  nftLoading: boolean;
  tokenThresholds: TokenThreshold[];
  setNotification: (e: SetStateAction<string | undefined>) => void;
  setIndexer: (e: SetStateAction<string | undefined>) => void;
  setNft: (e: SetStateAction<NFTData | undefined>) => void;
  hasMore: boolean;
  handleMoreActivity: () => Promise<void>;
  agentLoading: boolean;
  lensConnected: LensConnected | undefined;
  setSignless: (e: SetStateAction<boolean>) => void;
  storageClient: StorageClient;
  setImageView: (e: SetStateAction<string | undefined>) => void;
  agents: Agent[];
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
  handleLike: (id: string, reaction: string, post: boolean) => Promise<void>;
  handleMirror: (id: string, post: boolean) => Promise<void>;
  setCommentQuote: (
    e: SetStateAction<
      | {
          type: "Comment" | "Quote";
          id: string;
          post?: string;
        }
      | undefined
    >
  ) => void;
  commentQuote:
    | {
        type: "Comment" | "Quote";
        id: string;
        post?: string;
      }
    | undefined;
  agents: Agent[];
  post?: boolean;
};

export type PostProps = {
  handlePost: () => Promise<void>;
  handleComment: () => Promise<void>;
  handleQuote: () => Promise<void>;
  postLoading: boolean;
  success: boolean;
  postPage?: boolean;
  setPost: (e: SetStateAction<string>) => void;
  post: string;
  commentQuote:
    | {
        type: "Comment" | "Quote";
        id: string;
        post?: string;
      }
    | undefined;
  setCommentQuote: (
    e: SetStateAction<
      | {
          type: "Comment" | "Quote";
          id: string;
          post?: string;
        }
      | undefined
    >
  ) => void;
};

export type MetadataProps = {
  metadata: string;
  data: TextOnlyMetadata | ImageMetadata;
  setImageView: (e: SetStateAction<string | undefined>) => void;
  post?: boolean;
};
