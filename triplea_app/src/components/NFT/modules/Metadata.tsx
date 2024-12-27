import { FunctionComponent, JSX } from "react";
import { MetadataProps } from "../types/nft.types";
import { ImageMetadata, TextOnlyMetadata } from "@lens-protocol/client";
import Image from "next/legacy/image";
import { INFURA_GATEWAY } from "@/lib/constants";

const Metadata: FunctionComponent<MetadataProps> = ({
  metadata,
  data,
  setImageView
}): JSX.Element => {
  switch (metadata) {
    case "ImageMetadata":
      return (
        <div className="relative w-full h-44 flex flex-row gap-2 items-start justify-start">
          <div className="relative w-full h-full max-h-44 overflow-y-scroll p-1.5 items-start justify-start font-jack text-xs pixel-border-4 bg-morado rounded-md">
            {(data as ImageMetadata)?.content as string}
          </div>
          <div className="relative w-full h-full flex items-start justify-start">
            <div
              className="relative w-full h-full flex items-start justify-start cursor-pixel pixel-border-3"
              onClick={() =>
                setImageView(
                  `${INFURA_GATEWAY}/ipfs/${
                    ((data as ImageMetadata)?.image?.item as string)?.split(
                      "ipfs://"
                    )?.[1]
                  }`
                )
              }
            >
              <Image
                layout="fill"
                className="rounded-md"
                src={`${INFURA_GATEWAY}/ipfs/${
                  ((data as ImageMetadata)?.image?.item as string)?.split(
                    "ipfs://"
                  )?.[1]
                }`}
                objectFit="cover"
                draggable={false}
              />
            </div>
          </div>
        </div>
      );

    case "TextOnlyMetadata":
      return (
        <div className="relative w-full h-fit max-h-32 overflow-y-scroll p-1.5 items-start justify-start font-jack text-xs pixel-border-4">
          {(data as TextOnlyMetadata)?.content as string}
        </div>
      );

    default:
      return <div></div>;
  }
};

export default Metadata;
