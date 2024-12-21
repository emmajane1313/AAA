import { FunctionComponent, JSX } from "react";

import { CollectsProps, Switcher } from "../types/dashboard.types";
import useCollects from "../hooks/useCollects";
import Image from "next/legacy/image";
import { INFURA_GATEWAY } from "@/lib/constants";
import { useRouter } from "next/navigation";

const Collects: FunctionComponent<CollectsProps> = ({
  setSwitcher,
}): JSX.Element => {
  const { collectsLoading, allCollects } = useCollects();
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
              allCollects?.map((sale, key) => {
                return (
                  <div
                    key={key}
                    className={`relative w-60 h-full bg-morado rounded-md flex flex-col items-center justify-between p-2`}
                    onClick={() => router.push(`/nft/${sale?.collection?.id}`)}
                  >
                    <div className="relative w-full h-full rounded-md flex">
                      <Image
                        objectFit="cover"
                        layout="fill"
                        draggable={false}
                        alt={sale?.collection?.title}
                        src={`${INFURA_GATEWAY}/ipfs/${sale?.collection?.url}`}
                        className="rounded-md"
                      />
                    </div>
                    <div className="relative w-full h-fit flex flex-col items-start justify-start gap-3">
                      <div className="relative w-fit h-fit flex text-lg">
                        {sale?.collection?.title}
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
