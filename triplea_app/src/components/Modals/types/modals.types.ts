import { LensConnected } from "@/components/Common/types/common.types";
import { SetStateAction } from "react";
import { StorageClient } from "@lens-protocol/storage-node-client";

export type ImageViewerProps = {
  imageView: string;
  setImageView: (e: SetStateAction<string | undefined>) => void;
};

export type CreateAccountProps = {
  address: `0x${string}` | undefined;
  lensConnected: LensConnected | undefined;
  setLensConnected:
    | ((e: SetStateAction<LensConnected | undefined>) => void)
    | undefined;
  setCreateAccount: (e: SetStateAction<boolean>) => void;
  setIndexer: (e: SetStateAction<string | undefined>) => void;
  setNotification: (e: SetStateAction<string | undefined>) => void;
  storageClient: StorageClient;
};

export type IndexerProps = {
  indexer: string | undefined;
  setIndexer: (e: SetStateAction<string | undefined>) => void;
};

export type NotificationProps = {
  notification: string | undefined;
  setNotification: (e: SetStateAction<string | undefined>) => void;
};

export type SignlessProps = {
  lensConnected: LensConnected | undefined;
  setSignless: (e: SetStateAction<boolean>) => void;
};
