"use client";

import useAgentPayouts from "@/components/AgentPayouts/hooks/useAgentPayouts";
import Slider from "@/components/Common/modules/Slider";
import { INFURA_GATEWAY, TOKENS } from "@/lib/constants";
import moment from "moment";
import { useContext } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { AnimationContext, ModalContext } from "../providers";
import Image from "next/legacy/image";
import { useRouter } from "next/navigation";

export default function AgentPayouts() {
  const context = useContext(ModalContext);
  const router = useRouter();
  const animationContext = useContext(AnimationContext);
  const {
    screen,
    setScreen,
    ordersLoading,
    ownersPaid,
    collectorsPaid,
    handleMorePaid,
    hasMore,
  } = useAgentPayouts(context?.lensClient!);
  return (
    <>
      <Slider />
      <div className="relative w-full h-full flex flex-col gap-4 items-start px-4 sm:px-20 py-10 justify-start">
        <div className="relative w-full h-full p-3 pixel-border-2 flex flex-col items-center justify-between gap-6">
          <div className="relative w-full h-fit flex flex-row justify-between items-center">
            <div
              className="relative w-fit h-fit flex items-center justiy-center cursor-pixel"
              onClick={() => setScreen(screen > 0 ? screen - 1 : 1)}
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
            <div className="text-black font-start text-sm relative flex w-fit h-fit text-center text-black">
              {screen < 1 ? "Agent Owners Paid" : "Collectors Paid"}
            </div>
            <div
              className="relative w-fit h-fit flex items-center justiy-center cursor-pixel"
              onClick={() => setScreen(screen < 2 ? screen + 1 : 0)}
            >
              <svg
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="size-6"
              >
                {" "}
                <path
                  d="M4 11v2h12v2h2v-2h2v-2h-2V9h-2v2H4zm10-4h2v2h-2V7zm0 0h-2V5h2v2zm0 10h2v-2h-2v2zm0 0h-2v2h2v-2z"
                  fill="currentColor"
                />{" "}
              </svg>
            </div>
          </div>
          <div className="relative w-full h-full flex flex-col gap-6 items-center justify-center font-jacey">
            <div
              className="relative w-full h-[50%] overflow-y-scroll"
              id="scrollableDiv"
            >
              <InfiniteScroll
                scrollableTarget="scrollableDiv"
                dataLength={
                  (screen < 1 ? ownersPaid : collectorsPaid)?.length || 1
                }
                next={handleMorePaid}
                hasMore={screen < 1 ? hasMore?.owners : hasMore?.collectors}
                loader={<div key={0} />}
                className="relative w-full gap-6 flex flex-col"
              >
                {ordersLoading
                  ? Array.from({ length: 20 }).map((_, key) => {
                      return (
                        <div
                          className="relative animate-pulse w-full h-px bg-black "
                          key={key}
                        ></div>
                      );
                    })
                  : (screen < 1 ? ownersPaid : collectorsPaid)?.map(
                      (item, key) => {
                        return (
                          <div
                            className="relative w-full h-fit flex flex-col gap-1.5"
                            key={key}
                          >
                            <div
                              className="relative w-full h-fit flex cursor-pixel justify-between items-center flex-row gap-2"
                              onClick={() =>
                                window.open(
                                  `https://block-explorer.testnet.lens.dev/tx/${item?.transactionHash}`
                                )
                              }
                            >
                              {item?.profile && (
                                <div
                                  className="relative w-fit h-fit flex items-center justify-start gap-2 flex-row"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    animationContext?.setPageChange?.(true);
                                    router.push(
                                      `/user/${item?.profile?.username?.localName}`
                                    );
                                  }}
                                >
                                  <div className="relative flex rounded-full w-8 h-8 bg-morado border border-morado">
                                    {item?.profile?.metadata?.picture && (
                                      <Image
                                        src={`${INFURA_GATEWAY}/ipfs/${
                                          item?.profile?.metadata?.picture?.split(
                                            "ipfs://"
                                          )?.[1]
                                        }`}
                                        draggable={false}
                                        className="rounded-full"
                                        layout="fill"
                                        objectFit="cover"
                                      />
                                    )}
                                  </div>
                                  <div className="relative flex w-fit h-fit text-xs text-black font-jackey2">
                                    {"@" +
                                      item?.profile?.username?.localName?.slice(
                                        0,
                                        10
                                      )}
                                  </div>
                                </div>
                              )}
                              <div className="relative w-fit h-fit flex font-start text-xs">
                                {(screen < 1
                                  ? (item as any)?.owner
                                  : (item as any)?.recipient
                                )?.slice(0, 10) + " ..."}
                              </div>
                              <div className="relative w-fit h-fit flex items-center justify-center text-black font-jackey2">
                                {Number(item?.amount) / 10 ** 18}{" "}
                                {
                                  TOKENS.find(
                                    (tok) =>
                                      tok.contract?.toLowerCase() ==
                                      item?.token?.toLowerCase()
                                  )?.symbol
                                }
                              </div>
                              <div className="relative w-fit h-fit flex items-center justify-center text-black font-jackey2 text-xs">
                                {moment
                                  .unix(Number(item?.blockTimestamp))
                                  .fromNow()}
                              </div>
                            </div>
                            <div className="relative w-full h-px bg-black/70 flex"></div>
                          </div>
                        );
                      }
                    )}
              </InfiniteScroll>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
