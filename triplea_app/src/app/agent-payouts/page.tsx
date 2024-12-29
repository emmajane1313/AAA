"use client";

import useAgentPayouts from "@/components/AgentPayouts/hooks/useAgentPayouts";
import Slider from "@/components/Common/modules/Slider";
import { TOKENS } from "@/lib/constants";
import moment from "moment";
import InfiniteScroll from "react-infinite-scroll-component";

export default function AgentPayouts() {
  const {
    screen,
    setScreen,
    ordersLoading,
    ownersPaid,
    collectorsPaid,
    handleMorePaid,
    hasMore,
  } = useAgentPayouts();
  return (
    <>
      <Slider />
      <div className="relative w-full h-full flex flex-col gap-4 items-start px-20 pb-20 py-10 justify-start">
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
            >
              <InfiniteScroll
                dataLength={
                  (screen < 1 ? ownersPaid : collectorsPaid)?.length || 1
                }
                next={handleMorePaid}
                hasMore={screen < 1 ? hasMore?.owners : hasMore?.collectors}
                loader={<></>}
                className="relative w-full"
              >
                {(screen < 1 ? ownersPaid : collectorsPaid)?.map(
                  (item, key) => {
                    return (
                      <div
                        key={key}
                        className="relative w-full h-fit flex cursor-pixel justify-between items-center flex-row gap-2"
                        onClick={() =>
                          window.open(
                            `https://block-explorer.testnet.lens.dev/tx/${item?.transactionHash}`
                          )
                        }
                      >
                        <div className="relative w-fit h-fit flex font-start text-xs">
                          {(screen < 1
                            ? (item as any)?.owner
                            : (item as any)?.recipient
                          )?.slice(0, 10) + " ..."}
                        </div>
                        <div className="relative w-fit h-fit flex items-center justify-center text-black font-jackey2">
                          {item?.amount}{" "}
                          {
                            TOKENS.find(
                              (tok) =>
                                tok.contract?.toLowerCase() ==
                                item?.token?.toLowerCase()
                            )?.symbol
                          }
                        </div>
                        <div className="relative w-fit h-fit flex items-center justify-center text-black font-jackey2 text-xs">
                          {moment.unix(Number(item?.blockTimestamp)).fromNow()}
                        </div>
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
