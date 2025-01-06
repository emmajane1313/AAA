import { FunctionComponent, JSX, useContext } from "react";
import { SalesProps, Switcher } from "../types/dashboard.types";
import useSales from "../hooks/useSales";
import { useRouter } from "next/navigation";
import Image from "next/legacy/image";
import { INFURA_GATEWAY } from "@/lib/constants";
import { useAccount } from "wagmi";
import moment from "moment";
import { AnimationContext } from "@/app/providers";

const Sales: FunctionComponent<SalesProps> = ({
  setSwitcher,
  lensClient,
}): JSX.Element => {
  const { address } = useAccount();
  const animationContext = useContext(AnimationContext);
  const { salesLoading, allSales } = useSales(address, lensClient);
  const router = useRouter();
  return (
    <div className="relative  w-full h-full flex flex-col gap-4 items-start px-4 sm:px-20 py-10 justify-start">
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
              !salesLoading && allSales?.length < 1 ? "w-full" : "w-fit"
            }`}
          >
            {salesLoading ? (
              Array.from({ length: 10 }).map((_, key) => {
                return (
                  <div
                    key={key}
                    className="relative w-60 h-full bg-morado pixel-border-4 animate-pulse rounded-xl"
                  ></div>
                );
              })
            ) : allSales?.length < 1 ? (
              <div className="relative w-full h-full flex items-center justify-center text-sm text-gray-600 font-jack">
                No Sales Yet.
              </div>
            ) : (
              allSales?.map((sale, key) => {
                return (
                  <div
                    key={key}
                    className={`relative w-60 h-96 md:h-full bg-morado rounded-xl pixel-border-4 flex flex-col items-center justify-between p-2`}
                  >
                    <div
                      className="relative w-full h-full rounded-2xl flex cursor-pixel pixel-border-2"
                      onClick={() => {
                        animationContext?.setPageChange?.(true);
                        router.push(
                          `/nft/${
                            (sale as any)?.profile?.username?.value?.split(
                              "lens/"
                            )?.[1]
                          }/${sale?.collection?.id}`
                        );
                      }}
                    >
                      <Image
                        objectFit="cover"
                        layout="fill"
                        draggable={false}
                        alt={sale?.collection?.title}
                        src={`${INFURA_GATEWAY}/ipfs/${
                          sale?.collection?.image?.split("ipfs://")?.[1]
                        }`}
                        className="rounded-2xl"
                      />
                    </div>
                    <div className="relative w-full h-fit flex flex-col items-start justify-start gap-3 pt-4">
                      <div className="relative w-fit h-fit flex text-xs font-start">
                        {sale?.collection?.title}
                      </div>
                      <div
                        className="relative w-full h-fit flex cursor-pixel justify-between items-center flex-row gap-2 font-jack text-sm"
                        onClick={() =>
                          window.open(
                            `https://block-explorer.testnet.lens.dev/tx/${sale?.transactionHash}`
                          )
                        }
                      >
                        <div className="relative w-fit h-fit flex items-center justify-center text-black">
                          X {sale?.amount}
                        </div>
                        <div className="relative w-fit h-fit flex items-center justify-center text-black">
                          {moment.unix(Number(sale?.blockTimestamp)).fromNow()}
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

export default Sales;
