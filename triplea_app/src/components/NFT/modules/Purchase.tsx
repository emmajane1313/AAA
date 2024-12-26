import { FunctionComponent, JSX } from "react";
import { PurchaseProps } from "../types/nft.types";
import usePurchase from "../hooks/usePurchase";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { AiOutlineLoading } from "react-icons/ai";
import { createPublicClient, http } from "viem";
import { chains } from "@lens-network/sdk/viem";
import { TOKENS } from "@/lib/constants";
import Image from "next/legacy/image";
import createProfilePicture from "@/lib/helpers/createProfilePicture";
import moment from "moment";
import InfiniteScroll from "react-infinite-scroll-component";

const Purchase: FunctionComponent<PurchaseProps> = ({
  nft,
  setNft,
  nftLoading,
  setNotification,
  hasMore,
  handleMoreActivity,
  agentLoading
}): JSX.Element => {
  const { isConnected, address } = useAccount();
  const publicClient = createPublicClient({
    chain: chains.testnet,
    transport: http(
      "https://rpc.testnet.lens.dev"
      // `https://lens-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_LENS_KEY}`
    ),
  });
  const {
    purchaseLoading,
    handleApprove,
    handlePurchase,
    approved,
    setCollectData,
    collectData,
    screen,
    setScreen,
  } = usePurchase(nft, setNft, address, publicClient, setNotification);
  const { openConnectModal } = useConnectModal();
  return (
    <div
      className={`relative w-[38rem] h-full flex flex-col gap-4 items-start justify-start text-left bg-gray-200 p-3 shadow-lg rounded-md ${
        (nftLoading || nft?.amount == 0) && "animate-pulse"
      }`}
    >
      {!nftLoading && nft?.amount > 0 && (
        <>
          <div className="relative text-2xl text-black flex">{nft?.title}</div>
          <div className="relative text-sm text-black flex">
            Edition — {nft?.amountSold} / {nft?.amount}
          </div>
          <div className="relative w-full h-fit flex items-center justify-between flex-row gap-3">
            <div className="relative w-fit h-fit flex items-center justify-start gap-2 flex-row">
              <div className="relative flex rounded-full w-8 h-8 bg-morado border border-morado"></div>
              <div className="relative flex w-fit h-fit text-xs text-black">
                {nft?.artist?.slice(0, 10)}
              </div>
            </div>
            <div className="relative w-fit h-fit flex">
              {nft?.blocktimestamp}
            </div>
          </div>
          <div className="relative w-full justify-between items-center flex flex-row text-2xl">
            <input
              disabled={purchaseLoading}
              type="number"
              min={1}
              max={Number(nft?.amount) - Number(nft?.amountSold) || ""}
              title={nft?.title}
              placeholder={"1"}
              value={collectData.amount}
              step={1}
              className="relative flex w-14 px-1 h-10 text-gray-600 bg-gray-200 focus:outline-none text-xl text-left"
              onChange={(e) =>
                setCollectData({
                  ...collectData,
                  amount: Number(e.target.value),
                })
              }
            />
            <div className="relative w-fit h-fit justify-end flex">
              {(Number(nft?.prices?.[0]) / 10 ** 18) * collectData?.amount}{" "}
              {
                TOKENS?.find(
                  (tok) =>
                    nft?.tokens?.[0]?.toLowerCase() ==
                    tok.contract?.toLowerCase()
                )?.symbol
              }
            </div>
          </div>

          <div
            className={`relative w-full h-14 bg-black text-white rounded-md flex items-center justify-center ${
              !purchaseLoading ? "cursor-pointer" : "opacity-70"
            }`}
            onClick={() => {
              if (!purchaseLoading) {
                if (!isConnected) {
                  openConnectModal?.();
                } else if (approved) {
                  handlePurchase();
                } else {
                  handleApprove();
                }
              }
            }}
          >
            {purchaseLoading ? (
              <AiOutlineLoading
                color={"white"}
                className="animate-spin h-8 w-8"
              />
            ) : approved || !isConnected ? (
              "Collect"
            ) : (
              "Approve"
            )}
          </div>
          <div className="py-4 h-fit max-h-40 overflow-y-scroll flex relative items-start justify-start text-left text-black text-sm">
            {nft?.description}
          </div>
          <div className="relative w-full h-fit flex flex-col gap-3 items-center justify-center">
            <div className="relative w-full h-fit flex items-center justify-center gap-3 flex-col">
              <div className="relative w-full h-fit flex items-center justify-center gap-px flex-col">
                <div className="h-px w-full flex bg-morado" />
                <div className="h-px w-full flex bg-cielo" />
                <div className="h-px w-full flex bg-oscuro" />
              </div>
              <div className="relative w-full h-fit flex flex-row justify-between items-center">
                <div
                  className="relative w-fit h-fit flex items-center justiy-center cursor-pointer"
                  onClick={() => setScreen(screen > 0 ? screen - 1 : 1)}
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
                      d="M15.75 19.5 8.25 12l7.5-7.5"
                    />
                  </svg>
                </div>
                <div className="text-black text-lg relative flex w-fit h-fit text-center text-black">
                  {screen < 1 ? "Agent Activity" : "Collectors"}
                </div>
                <div
                  className="relative w-fit h-fit flex items-center justiy-center cursor-pointer"
                  onClick={() => setScreen(screen < 1 ? screen + 1 : 0)}
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
                      d="m8.25 4.5 7.5 7.5-7.5 7.5"
                    />
                  </svg>
                </div>
              </div>
              <div className="relative w-full h-fit flex items-center justify-center gap-px flex-col">
                <div className="h-px w-full flex bg-morado" />
                <div className="h-px w-full flex bg-cielo" />
                <div className="h-px w-full flex bg-oscuro" />
              </div>
            </div>

            {screen == 1 ? (
              <div className="relative w-full h-fit overflow-y-scroll flex flex-col items-start justify-start gap-3">
                {nft?.collectors?.map((collector, key) => {
                  return (
                    <div
                      key={key}
                      className="relative w-full h-fit flex cursor-pointer justify-between items-center flex-row gap-2"
                      onClick={() =>
                        window.open(
                          `https://block-explorer.testnet.lens.dev/tx/${collector?.transactionHash}`
                        )
                      }
                    >
                      {collector?.name ? (
                        <div className="relative w-fit h-fit flex flex-row gap-1 items-center justify-center">
                          {collector?.pfp && (
                            <div className="relative rounded-full w-6 h-6 bg-crema border border-morado">
                              <Image
                                src={
                                  createProfilePicture(collector?.pfp as any) ||
                                  ""
                                }
                                alt="pfp"
                                draggable={false}
                                className="rounded-full"
                              />
                            </div>
                          )}
                          <div className="relative w-fit h-fit flex text-black text-sm">
                            @{collector?.name}
                          </div>
                        </div>
                      ) : (
                        <div className="relative w-fit h-fit flex">
                          {collector?.address?.slice(0, 10) + " ..."}
                        </div>
                      )}

                      <div className="relative w-fit h-fit flex items-center justify-center text-black">
                        X {collector?.amount}
                      </div>
                      <div className="relative w-fit h-fit flex items-center justify-center text-black">
                        {moment
                          .unix(Number(collector?.blockTimestamp))
                          .fromNow()}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <InfiniteScroll
                dataLength={nft?.agentActivity?.length || 1}
                next={handleMoreActivity}
                hasMore={hasMore}
                loader={<></>}
              >
                <div className="relative w-full h-fit overflow-y-scroll flex flex-col items-start justify-start gap-3">
                  {nft?.agentActivity?.map((activity, key) => {
                    return (
                      <div
                        key={key}
                        className="relative w-full h-fit flex"
                      >
                        
                      </div>
                    );
                  })}
                </div>
              </InfiniteScroll>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Purchase;
