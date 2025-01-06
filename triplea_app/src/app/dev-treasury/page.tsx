"use client";

import Slider from "@/components/Common/modules/Slider";
import useDevTreasury from "@/components/Dev/hooks/useDevTreasury";
import { TOKENS } from "@/lib/constants";

export default function DevTreasury() {
  const { treasuryLoading, treasury } = useDevTreasury();
  return (
    <>
      <Slider />
      <div className="relative w-full h-full flex flex-col gap-4 items-start px-4 sm:px-20 py-10 justify-start">
        <div className="relative w-full h-full p-3 pixel-border-2 flex flex-col items-center justify-between gap-6">
          <div className="text-black font-start text-sm relative flex w-fit h-fit text-center text-black">
            Dev Treasury
          </div>
          <div
            className={`"relative w-full h-full flex flex-col gap-6 items-center justify-center font-jacey ${
              treasuryLoading && "animate-pulse"
            }`}
          >
            <div className="relative w-fit h-fit font-start uppercase flex items-center justify-center text-center text-base sm:text-xl">
              {" "}
              {Number(treasury?.amount) / 10 ** 18}{" "}
              {
                TOKENS.find(
                  (tok) =>
                    tok.contract?.toLowerCase() ==
                    treasury?.token?.toLowerCase()
                )?.symbol
              }
            </div>
            <div className="relative w-full h-20 pixel-border-2 flex bg-gray-200">
              <div
                className="absolute top-0 left-0 h-full bg-[#5aacfa] rounded-md"
                style={{
                  width: `${Math.min(
                    (Number(treasury?.amount) / 10 ** 18) * 100,
                    100
                  )}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
