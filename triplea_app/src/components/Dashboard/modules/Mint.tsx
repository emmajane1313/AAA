import { FunctionComponent, JSX } from "react";
import { MintProps } from "../types/dashboard.types";
import { AiOutlineLoading } from "react-icons/ai";
import Image from "next/legacy/image";
import { TOKENS } from "@/lib/constants";

const Mint: FunctionComponent<MintProps> = ({
  handleMint,
  mintLoading,
  mintData,
  setMintData,
  agents,
  allDrops,
}): JSX.Element => {
  return (
    <div className="relative w-full h-full flex flex-col gap-6 items-center justify-between">
      <div className="relative w-full h-full flex flex-row items-center justify-center gap-4">
        <div className="relative w-80 h-full flex items-center justify-center">
          {mintData.image && (
            <Image
              src={URL.createObjectURL(mintData.image)}
              objectFit="contain"
              layout="fill"
              draggable={false}
            />
          )}
        </div>
        <div className="relative w-fit h-full flex flex-col gap-4 items-start justify-start">
          <div className="relative flex w-fit h-10 text-center text-black bg-gray-200 text-3xl">
            {mintData.title}
          </div>
          <div className="relative w-fit h-fit flex items-center justify-center">
            Drop —{" "}
            {allDrops?.find((drop) => mintData.dropId == Number(drop.id))
              ?.title || mintData?.dropTitle}
          </div>
          <div className="relative w-fit h-fit flex items-center justify-between flex-row gap-4 text-gray-600 text-xl">
            <div className="relative w-fit h-fit flex text-left">
              {mintData.amount} x {mintData.prices?.[0]}{" "}
              {
                TOKENS.find((tok) => tok.contract == mintData.tokens?.[0])
                  ?.symbol
              }
            </div>
          </div>
          <div className="relative flex w-fit h-fit max-h-60 overflow-y-scroll text-center text-black bg-gray-200 text-base">
            {mintData.description}
          </div>
          <div className="relative flex w-fit h-fit flex flex-wrap gap-4">
            {mintData?.agentIds?.map((agent, index) => {
              return (
                <div
                  key={index}
                  className="relative text-sm text-black w-fit h-fit px-2 py-1 border border-morado rounded-full"
                >
                  {agents?.find((ag) => Number(ag?.id) == Number(agent))?.title}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="relative w-full h-fit flex items-center justify-center">
        <div
          className={`relative w-1/2 h-14 bg-black text-white rounded-md flex items-center justify-center ${
            !mintLoading ? "cursor-pointer" : "opacity-70"
          }`}
          onClick={() => !mintLoading && handleMint()}
        >
          {mintLoading ? (
            <AiOutlineLoading
              color={"white"}
              className="animate-spin h-8 w-8"
            />
          ) : (
            "Mint"
          )}
        </div>
      </div>
    </div>
  );
};

export default Mint;
