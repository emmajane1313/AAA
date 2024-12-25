import { FunctionComponent, JSX } from "react";

import { CollectsProps, Switcher } from "../types/dashboard.types";
import useCollects from "../hooks/useCollects";
import Image from "next/legacy/image";
import { INFURA_GATEWAY } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import moment from "moment";

const Collects: FunctionComponent<CollectsProps> = ({
  setSwitcher,
  lensClient,
}): JSX.Element => {
  const { address } = useAccount();
  const { collectsLoading, allCollects } = useCollects(address, lensClient);
  const router = useRouter();
  return (
    <div className="relative w-full h-full flex flex-col gap-4 items-start px-20 pb-20 py-10 justify-start">
      <div className="relative w-full h-full bg-gray-200 p-3 shadow-lg rounded-md flex flex-col items-center justify-between gap-6">
        <div className="relative w-full h-fit flex items-start justify-start">
          <div
            className="relative flex w-fit h-fit cursor-pointer hover:opacity-70"
            onClick={() => setSwitcher(Switcher.Home)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m11.25 9-3 3m0 0 3 3m-3-3h7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          </div>
        </div>
        <div className="flex relative w-full h-full items-center justify-start overflow-x-scroll">
          <div
            className={`relative h-full flex flex-row gap-6 ${
              !collectsLoading && allCollects?.length < 1 ? "w-full" : "w-fit"
            }`}
          >
            {collectsLoading ? (
              Array.from({ length: 10 }).map((_, key) => {
                return (
                  <div
                    key={key}
                    className="relative w-60 h-full bg-morado rounded-md animate-pulse"
                  ></div>
                );
              })
            ) : allCollects?.length < 1 ? (
              <div className="relative w-full h-full flex items-center justify-center text-sm text-gray-600">
                No Collects Yet.
              </div>
            ) : (
              allCollects?.map((collect, key) => {
                return (
                  <div
                    key={key}
                    className={`relative w-60 h-full bg-morado rounded-md flex flex-col items-center justify-between p-2`}
                  >
                    <div
                      className="relative w-full h-full rounded-md flex cursor-pointer"
                      onClick={() =>
                        router.push(
                          `/nft/${
                            collect?.collection?.profile?.username?.value?.split(
                              "lens/"
                            )?.[1]
                          }/${collect?.collection?.id}`
                        )
                      }
                    >
                      <Image
                        objectFit="cover"
                        layout="fill"
                        draggable={false}
                        alt={collect?.collection?.title}
                        src={`${INFURA_GATEWAY}/ipfs/${
                          collect?.collection?.image?.split("ipfs://")?.[1]
                        }`}
                        className="rounded-md"
                      />
                    </div>
                    <div className="relative w-full h-fit flex flex-col items-start justify-start gap-3">
                      <div className="relative w-fit h-fit flex text-lg">
                        {collect?.collection?.title}
                      </div>
                      <div
                        className="relative w-full h-fit flex cursor-pointer justify-between items-center flex-row gap-2"
                        onClick={() =>
                          window.open(
                            `https://block-explorer.testnet.lens.dev/tx/${collect?.transactionHash}`
                          )
                        }
                      >
                        <div className="relative w-fit h-fit flex items-center justify-center text-black">
                          X {collect?.amount}
                        </div>
                        <div className="relative w-fit h-fit flex items-center justify-center text-black">
                          {moment
                            .unix(Number(collect?.blockTimestamp))
                            .fromNow()}
                        </div>
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

export default Collects;
