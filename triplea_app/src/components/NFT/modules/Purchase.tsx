import { FunctionComponent, JSX } from "react";
import { PurchaseProps } from "../types/nft.types";
import usePurchase from "../hooks/usePurchase";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { AiOutlineLoading } from "react-icons/ai";
import { createPublicClient, http } from "viem";
import { chains } from "@lens-network/sdk/viem";
import { INFURA_GATEWAY, STORAGE_NODE, TOKENS } from "@/lib/constants";
import Image from "next/legacy/image";
import moment from "moment";
import InfiniteScroll from "react-infinite-scroll-component";
import useInteractions from "../hooks/useInteractions";
import Post from "./Post";
import Comments from "./Comments";

const Purchase: FunctionComponent<PurchaseProps> = ({
  nft,
  setNft,
  nftLoading,
  setNotification,
  hasMore,
  handleMoreActivity,
  agentLoading,
  lensConnected,
  setSignless,
  setImageView,
  storageClient,
  setIndexer,
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
  const {
    handlePost,
    postLoading,
    interactionsLoading,
    handleComment,
    handleLike,
    handleMirror,
    handleQuote,
    post,
    setPost,
    commentQuote,
    setCommentQuote,
    success,
  } = useInteractions(
    nft?.agentActivity,
    lensConnected?.sessionClient!,
    setSignless,
    storageClient,
    String(nft?.id),
    setIndexer,
    setNotification,
    setNft,
    nft
  );
  const { openConnectModal } = useConnectModal();
  return (
    <div
      className={`relative w-[38rem] h-[40rem] flex flex-col gap-4 items-start justify-start text-left p-3 pixel-border-2 bg-white ${
        (nftLoading || nft?.amount == 0) && "animate-pulse"
      }`}
    >
      {!nftLoading && nft?.amount > 0 && (
        <>
          <div className="relative w-full h-fit flex items-center justify-center gap-3 flex-col">
            <div className="relative w-full h-fit flex items-center justify-center gap-1 flex-col">
              <div className="h-1 w-full flex bg-black" />
              <div className="h-1 w-full flex bg-black" />
            </div>
            <div className="relative w-full h-fit flex flex-row justify-between items-center">
              <div
                className="relative w-fit h-fit flex items-center justiy-center cursor-pixel"
                onClick={() => setScreen(screen > 0 ? screen - 1 : 2)}
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
                {screen < 1
                  ? "Collect"
                  : screen == 1
                  ? "Agent Activity"
                  : "Collectors"}
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
          </div>
          {screen < 1 ? (
            <>
              <div className="relative text-xl break-all text-black flex font-start">
                {nft?.title}
              </div>
              <div className="relative text-sm text-black flex font-jackey2">
                Edition — {nft?.amountSold} / {nft?.amount}
              </div>
              <div className="relative w-full h-fit flex items-center justify-between flex-row gap-3 font-jackey2">
                <div className="relative w-fit h-fit flex items-center justify-start gap-2 flex-row">
                  {nft?.profile?.metadata?.picture && (
                    <div className="relative flex rounded-full w-8 h-8 bg-morado border border-morado">
                      <Image
                        src={`${INFURA_GATEWAY}/ipfs/${
                          nft?.profile?.metadata?.picture?.split("ipfs://")?.[1]
                        }`}
                        draggable={false}
                        className="rounded-full"
                        layout="fill"
                        objectFit="cover"
                      />
                    </div>
                  )}
                  <div className="relative flex w-fit h-fit text-xs text-black">
                    {nft?.profile?.username?.localName
                      ? nft?.profile?.username?.localName?.slice(0, 10)
                      : nft?.artist?.slice(0, 10)}
                  </div>
                </div>
                <div className="relative w-fit h-fit flex">
                  {nft?.blocktimestamp}
                </div>
              </div>
              <div className="relative w-full font-start justify-between items-center flex flex-row">
                <input
                  disabled={purchaseLoading}
                  type="number"
                  min={1}
                  max={Number(nft?.amount) - Number(nft?.amountSold) || ""}
                  title={nft?.title}
                  placeholder={"1"}
                  value={collectData.amount}
                  step={1}
                  className="relative flex w-20 px-1 h-10 text-black focus:outline-none text-xl text-left text-lg"
                  onChange={(e) =>
                    setCollectData({
                      ...collectData,
                      amount: Number(e.target.value),
                    })
                  }
                />
                <div className="relative w-fit h-fit justify-end flex text-sm">
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
              <div className="relative w-full h-fit flex">
                <div
                  className={`relative w-full h-14 pixel-border-2 text-black flex items-center justify-center font-start ${
                    !purchaseLoading ? "cursor-pixel" : "opacity-70"
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
                  ) : approved || !isConnected ? (
                    "Collect"
                  ) : (
                    "Approve"
                  )}
                </div>
              </div>
              <div className="relative w-full h-fit flex py-4 overflow-y-scroll">
                <div className="py-3 h-full max-h-full overflow-y-scroll flex relative items-start justify-start text-left text-black text-sm font-jack">
                  {nft?.description}
                </div>
              </div>
            </>
          ) : screen == 2 ? (
            <div className="relative w-full h-full overflow-y-scroll flex items-start justify-start">
              <div className="relative w-full h-fit flex flex-col items-start justify-start  gap-3">
                {nft?.collectors?.map((collector, key) => {
                  return (
                    <div
                      key={key}
                      className="relative w-full h-fit flex cursor-pixel justify-between items-center flex-row gap-2"
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
                                src={`${INFURA_GATEWAY}/ipfs/${
                                  (collector?.pfp || "")?.split("ipfs://")?.[1]
                                }`}
                                alt="pfp"
                                draggable={false}
                                className="rounded-full"
                                layout="fill"
                                objectFit="cover"
                              />
                            </div>
                          )}
                          <div className="relative w-fit h-fit flex text-black text-sm font-start">
                            @
                            {collector?.name?.length > 10
                              ? collector?.name?.slice(0, 10) + " ..."
                              : collector?.name}
                          </div>
                        </div>
                      ) : (
                        <div className="relative w-fit h-fit flex font-start text-xs">
                          {collector?.address?.slice(0, 10) + " ..."}
                        </div>
                      )}

                      <div className="relative w-fit h-fit flex items-center justify-center text-black font-jackey2">
                        X {collector?.amount}
                      </div>
                      <div className="relative w-fit h-fit flex items-center justify-center text-black font-jackey2 text-xs">
                        {moment
                          .unix(Number(collector?.blockTimestamp))
                          .fromNow()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="relative w-full gap-3 flex flex-col h-full">
              <div
                className="relative w-full h-[50%] overflow-y-scroll"
                id="scrollableDiv"
              >
                <InfiniteScroll
                  scrollableTarget="scrollableDiv"
                  dataLength={nft?.agentActivity?.length || 1}
                  next={handleMoreActivity}
                  hasMore={hasMore}
                  loader={<></>}
                  className="relative w-full"
                >
                  <Comments
                    comments={nft?.agentActivity || []}
                    setImageView={setImageView}
                    interactionsLoading={interactionsLoading}
                    handleLike={handleLike}
                    handleMirror={handleMirror}
                    setCommentQuote={setCommentQuote}
                    postLoading={postLoading}
                    commentQuote={commentQuote}
                  />
                </InfiniteScroll>
              </div>
              <Post
                handlePost={handlePost}
                postLoading={postLoading}
                setPost={setPost}
                post={post}
                commentQuote={commentQuote}
                setCommentQuote={setCommentQuote}
                handleComment={handleComment}
                handleQuote={handleQuote}
                success={success}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Purchase;
