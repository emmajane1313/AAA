import { FunctionComponent, JSX } from "react";
import { DropsProps, DropSwitcher, Switcher } from "../types/dashboard.types";
import Image from "next/legacy/image";
import { INFURA_GATEWAY } from "@/lib/constants";

const Drops: FunctionComponent<DropsProps> = ({
  setSwitcher,
  allDrops,
  allDropsLoading,
  setDropSwitcher,
  setDrop,
}): JSX.Element => {
  return (
    <div className="relative w-full  h-full flex flex-col gap-4 items-start px-4 sm:px-20 py-10 justify-start">
     <div className="relative w-full h-full  pixel-border-2 p-3 flex flex-col items-center justify-between gap-6">
        <div className="relative w-full h-fit flex items-start justify-start">
          <div
            className="relative flex w-fit h-fit cursor-pixel hover:opacity-70"
            onClick={() => setSwitcher(Switcher.Home)}
          >
             <svg
                  className="size-6"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  {" "}
                  <path
                    d="M20 11v2H8v2H6v-2H4v-2h2V9h2v2h12zM10 7H8v2h2V7zm0 0h2V5h-2v2zm0 10H8v-2h2v2zm0 0h2v2h-2v-2z"
                    fill="currentColor"
                  />{" "}
                </svg>
          </div>
        </div>
        <div className="flex relative w-full h-full items-center justify-start overflow-x-scroll">
          <div
            className={`relative h-full flex flex-row gap-6 ${
              !allDropsLoading && allDrops?.length < 1 ? "w-full" : "w-fit"
            }`}
          >
            {allDropsLoading ? (
              Array.from({ length: 10 }).map((_, key) => {
                return (
                  <div
                  key={key}
                  className="relative w-60 h-full bg-morado pixel-border-4 animate-pulse rounded-xl"
                ></div>
                );
              })
            ) : allDrops?.length < 1 ? (
              <div className="relative w-full h-full flex items-center justify-center text-sm text-gray-600 font-jack">
                No Drops Yet.
              </div>
            ) : (
              allDrops?.map((drop, key) => {
                return (
                  <div
                    key={key}
                    className={`relative w-60 h-96 md:h-full bg-morado pixel-border-4 rounded-lg flex flex-col items-center justify-between cursor-pixel p-2`}
                    onClick={() => {
                      setDrop(drop);
                      setDropSwitcher(DropSwitcher.Collection);
                    }}
                  >
                    <div className="relative w-full h-full rounded-md flex pixel-border-4">
                      <Image
                        objectFit="cover"
                        layout="fill"
                        draggable={false}
                        alt={drop?.title}
                        src={`${INFURA_GATEWAY}/ipfs/${
                          drop?.cover?.split("ipfs://")?.[1]
                        }`}
                        className="rounded-md"
                      />
                    </div>
                    <div className="relative w-full h-fit flex flex-col items-center justify-center gap-3">
                      <div className="relative w-fit h-fit flex text-sm uppercase text-black py-4 font-start">
                        {drop.title}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Drops;
