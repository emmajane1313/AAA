import { INFURA_GATEWAY } from "@/lib/constants";
import Image from "next/legacy/image";
import { FunctionComponent, JSX } from "react";
import { DataProps } from "../types/nft.types";

const Data: FunctionComponent<DataProps> = ({
  url,
  id,
  setImageView,
}): JSX.Element => {
  return (
    <div className="relative w-full h-[30rem] md:h-full flex px-6 py-2">
      {url && (
        <Image
          alt={id?.toString() || ""}
          src={`${INFURA_GATEWAY}/ipfs/${url?.split("ipfs://")?.[1]}`}
          draggable={false}
          layout="fill"
          objectFit="contain"
          className="cursor-pixel"
          onClick={() =>
            setImageView(`${INFURA_GATEWAY}/ipfs/${url?.split("ipfs://")?.[1]}`)
          }
        />
      )}
    </div>
  );
};

export default Data;
