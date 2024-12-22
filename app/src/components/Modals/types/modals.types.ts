import { SetStateAction } from "react";

export type ImageViewerProps = {
  imageView: string;
  setImageView: (e: SetStateAction<string | undefined>) => void;
};
