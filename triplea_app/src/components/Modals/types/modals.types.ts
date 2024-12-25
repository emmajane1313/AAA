import { LensConnected } from "@/components/Common/types/common.types";
import { SetStateAction } from "react";

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
  setError: (e: SetStateAction<string | undefined>) => void;
};

export type ErrorsProps = {
  error: string | undefined;
  setError: (e: SetStateAction<string | undefined>) => void;
};

export type NotificationProps = {
  notification: string | undefined;
  setNotification: (e: SetStateAction<string | undefined>) => void;
};
