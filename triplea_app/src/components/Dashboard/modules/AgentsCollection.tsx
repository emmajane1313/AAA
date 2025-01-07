import { FunctionComponent, JSX, useContext } from "react";
import { DropSwitcher, AgentsCollectionProps } from "../types/dashboard.types";
import Image from "next/legacy/image";
import { INFURA_GATEWAY, TOKENS } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { AnimationContext } from "@/app/providers";
import useAgentsCollection from "../hooks/useAgentsCollection";
import { useAccount } from "wagmi";
import { chains } from "@lens-network/sdk/viem";
import { createPublicClient, http } from "viem";

const AgentsCollection: FunctionComponent<AgentsCollectionProps> = ({
  setDropSwitcher,
  setDrop,
  collection,
  agents,
  setCollection,
  setNotification
}): JSX.Element => {
  const { address } = useAccount();
  const publicClient = createPublicClient({
    chain: chains.testnet,
    transport: http(
      "https://rpc.testnet.lens.dev"
      // `https://lens-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_LENS_KEY}`
    ),
  });
  const {
    handlePriceAdjust,
    priceAdjustLoading,
    handleEditAgents,
    editAgentsLoading,
    priceAdjusted,
    setPriceAdjusted,
    dailyFrequency,
    setCustomInstructions,
    setDailyFrequency,
    customInstructions,
    statusLoading,
    handleCollectionStatus
  } = useAgentsCollection(address, publicClient, collection, agents, setNotification);
  const router = useRouter();
  const animationContext = useContext(AnimationContext);

  return (
    <div className="relative w-full h-full flex flex-col gap-4 items-start px-4 sm:px-20 py-10 justify-start ">
      <div className="relative w-full h-full  pixel-border-2 p-3 flex flex-col items-center justify-between gap-6">
        <div className="relative w-full h-fit flex items-start justify-start">
          <div
            className="relative flex w-fit h-fit cursor-pixel hover:opacity-70"
            onClick={() => {
              setDropSwitcher(DropSwitcher.Drops);
              setDrop(undefined);
              setCollection(undefined);
            }}
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
            className={`relative h-96 md:h-full flex flex-row gap-6 ${
              collection?.agents?.length > 1 ? "w-fit" : "w-full"
            }`}
          >
            <div className="relative w-fit h-full flex items-center justify-between flex-col gap-4">
              <div className="relative w-fit h-fit flex text-sm font-start uppercase">
                {collection?.title?.length > 12
                  ? collection?.title?.slice(0, 9) + "..."
                  : collection?.title}
              </div>
              <div
                className="relative w-fit h-full flex cursor-pixel"
                onClick={() => {
                  animationContext?.setPageChange?.(true);
                  router.push(
                    `/nft/${collection?.profile?.username}/${collection?.id}`
                  );
                }}
              >
                <div className="relative w-60 h-full rounded-md flex pixel-border-4">
                  <Image
                    objectFit="cover"
                    layout="fill"
                    draggable={false}
                    alt={collection?.title}
                    src={`${INFURA_GATEWAY}/ipfs/${
                      collection?.image?.split("ipfs://")?.[1]
                    }`}
                    className="rounded-md"
                  />
                </div>
              </div>
              <div className="relative w-full h-fit flex flex-row gap-3 justify-between items-center text-xs font-jackey2 text-black">
                <input
                  className="relative w-full h-10 pixel-border-3 p-1 "
                  type="number"
                  step={1}
                  value={priceAdjusted}
                  disabled={priceAdjustLoading}
                  onChange={(e) => setPriceAdjusted(Number(e.target.value))}
                />
                <div className="relative w-fit h-fit flex">
                  {
                    TOKENS?.find(
                      (tok) =>
                        tok.contract.toLowerCase() ==
                        collection?.tokens?.[0]?.toLowerCase()
                    )?.symbol
                  }
                </div>
              </div>
              <div className="relative w-full h-fit flex">
                <div
                  className={`relative w-full h-8 pixel-border-3 text-black flex items-center justify-center text-xxs font-start ${
                    !priceAdjustLoading ? "cursor-pixel" : "opacity-70"
                  }`}
                  onClick={() => !priceAdjustLoading && handlePriceAdjust()}
                >
                  {priceAdjustLoading ? (
                    <svg
                      fill="none"
                      className="size-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M13 2h-2v6h2V2zm0 14h-2v6h2v-6zm9-5v2h-6v-2h6zM8 13v-2H2v2h6zm7-6h2v2h-2V7zm4-2h-2v2h2V5zM9 7H7v2h2V7zM5 5h2v2H5V5zm10 12h2v2h2v-2h-2v-2h-2v2zm-8 0v-2h2v2H7v2H5v-2h2z"
                        fill="currentColor"
                      />{" "}
                    </svg>
                  ) : (
                    "Adjust Price"
                  )}
                </div>
              </div>
              <div className="relative w-full h-fit flex">
                <div
                  className={`relative w-full h-8 pixel-border-3 text-black flex items-center justify-center text-xxs font-start ${
                    !statusLoading ? "cursor-pixel" : "opacity-70"
                  }`}
                  onClick={() => !statusLoading && handleCollectionStatus()}
                >
                  {statusLoading ? (
                    <svg
                      fill="none"
                      className="size-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M13 2h-2v6h2V2zm0 14h-2v6h2v-6zm9-5v2h-6v-2h6zM8 13v-2H2v2h6zm7-6h2v2h-2V7zm4-2h-2v2h2V5zM9 7H7v2h2V7zM5 5h2v2H5V5zm10 12h2v2h2v-2h-2v-2h-2v2zm-8 0v-2h2v2H7v2H5v-2h2z"
                        fill="currentColor"
                      />{" "}
                    </svg>
                  ) : Number(collection?.amountSold || 0) == 0 ? (
                    "Delete Collecton"
                  ) : collection?.active ? (
                    "Deactivate Collection"
                  ) : (
                    "Activate Collection"
                  )}
                </div>
              </div>
            </div>

            <div
              className={`relative w-full h-full flex items-start flex-col gap-3 justify-start relative  ${
                collection?.agents?.length > 1 && "overflow-x-scroll"
              }`}
            >
              <div
                className={`relative h-full flex flex-row gap-6 ${
                  collection?.agents?.length > 1 ? "w-fit" : "w-full"
                }`}
              >
                {collection?.agents?.length < 1 ? (
                  <div className="relative w-full flex items-center justify-center font-jackey2 text-black text-xs h-full">
                    No Agents Assigned.
                  </div>
                ) : (
                  agents
                    ?.filter((ag) => collection?.agents?.includes(ag?.id))
                    ?.map((agent, key) => {
                      return (
                        <div
                          key={key}
                          className={`relative w-60 pixel-border-4 h-full bg-morado rounded-xl flex flex-col items-center justify-between p-2`}
                        >
                          <div className="relative w-full h-full rounded-md flex p-2">
                            <Image
                              objectFit="contain"
                              layout="fill"
                              draggable={false}
                              alt={agent?.title}
                              src={`${INFURA_GATEWAY}/ipfs/${
                                agent?.cover?.includes("ipfs")
                                  ? agent?.cover?.split("ipfs://")?.[1]
                                  : agent?.cover
                              }`}
                              className="rounded-md"
                            />
                          </div>
                          <div className="relative w-fit h-fit flex text-lg font-start uppercase">
                            {agent.title}
                          </div>

                          <div
                            className="relative w-full h-fit flex pt-4 flex-col gap-2"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                          >
                            <input
                              className="relative w-full h-10 p-1 bg-white text-sm text-black font-jackey2 focus:outline-none"
                              placeholder="1"
                              type="number"
                              min={1}
                              max={3}
                              step={1}
                              disabled={editAgentsLoading}
                              value={dailyFrequency[key]}
                              onChange={(e) => {
                                let value = Number(e.target.value);
                                if (value > 3) {
                                  value = 3;
                                }
                                (e.target.value as any) = value;
                                e.preventDefault();
                                e.stopPropagation();
                                setDailyFrequency((prev) => {
                                  const freqs = [...prev];

                                  freqs[key] = value;

                                  return freqs;
                                });
                              }}
                            />
                            <textarea
                              className="relative w-full h-40 flex overflow-y-scroll p-1 bg-white text-sm text-black font-jackey2 rounded-b-md cursor-text focus:outline-none"
                              placeholder="Add custom instructions for your agent."
                              style={{
                                resize: "none",
                              }}
                              disabled={editAgentsLoading}
                              value={customInstructions[key]}
                              onChange={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setCustomInstructions((prev) => {
                                  const custom = [...prev];

                                  custom[key] = e.target.value;

                                  return custom;
                                });
                              }}
                            ></textarea>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
              {collection?.agents?.length > 0 && (
                <div className="relative w-fit h-fit flex items-center justify-center font-jackey2 text-black text-sm flex-col gap-3">
                  <div className="relative w-fit h-fit flex items-center text-center justify-center">
                    Update Agent Frequency and Custom Instructions
                  </div>
                  <div className="relative w-full h-fit flex">
                    <div
                      className={`relative w-full h-8 pixel-border-3 text-black flex items-center justify-center text-xxs font-start ${
                        !editAgentsLoading ? "cursor-pixel" : "opacity-70"
                      }`}
                      onClick={() => !editAgentsLoading && handleEditAgents()}
                    >
                      {editAgentsLoading ? (
                        <svg
                          fill="none"
                          className="size-4 animate-spin"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M13 2h-2v6h2V2zm0 14h-2v6h2v-6zm9-5v2h-6v-2h6zM8 13v-2H2v2h6zm7-6h2v2h-2V7zm4-2h-2v2h2V5zM9 7H7v2h2V7zM5 5h2v2H5V5zm10 12h2v2h2v-2h-2v-2h-2v2zm-8 0v-2h2v2H7v2H5v-2h2z"
                            fill="currentColor"
                          />{" "}
                        </svg>
                      ) : (
                        "Update"
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentsCollection;
