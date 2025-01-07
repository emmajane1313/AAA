import { FunctionComponent, JSX, useContext } from "react";
import { PurchaseProps } from "../types/nft.types";
import usePurchase from "../hooks/usePurchase";
import { useAccount } from "wagmi";
import { createPublicClient, http } from "viem";
import { chains } from "@lens-network/sdk/viem";
import { INFURA_GATEWAY, TOKENS } from "@/lib/constants";
import Image from "next/legacy/image";
import moment from "moment";
import InfiniteScroll from "react-infinite-scroll-component";
import useInteractions from "../hooks/useInteractions";
import Post from "./Post";
import Comments from "./Comments";
import { useRouter } from "next/navigation";
import { useModal } from "connectkit";
import useAgentRecharge from "../hooks/useAgentRecharge";
import { AnimationContext } from "@/app/providers";

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
  tokenThresholds,
  agents,
  handlePosts,
}): JSX.Element => {
  const { isConnected, address } = useAccount();
  const router = useRouter();
  const { setOpen, open } = useModal();
  const animationContext = useContext(AnimationContext);
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
    rechargeLoading,
    handleRecharge,
    setRechargeAmount,
    rechargeAmount,
    handleApproveRecharge,
    approvedRecharge,
  } = useAgentRecharge(
    nft?.agents,
    publicClient,
    address,
    setNotification,
    nft?.id
  );
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
    lensConnected?.sessionClient!,
    setSignless,
    storageClient,
    setIndexer,
    setNotification,
    setNft,
    nft,
    handlePosts
  );

  return (
    <div
      className={`relative w-full md:w-[38rem] h-[60rem] md:h-[40rem] flex flex-col gap-4 items-start justify-start text-left p-3 pixel-border-2 bg-white ${
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
                onClick={() =>
                  setScreen(
                    screen > 0
                      ? screen - 1
                      : Number(nft?.agents?.length || 0) > 0
                      ? 3
                      : 1
                  )
                }
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
                {Number(nft?.agents?.length || 0) > 0
                  ? screen < 1
                    ? "Collect"
                    : screen == 1
                    ? "Collectors"
                    : screen == 2
                    ? "Agents On Lens"
                    : "Agent Recharge Station"
                  : screen < 1
                  ? "Collect"
                  : "Collectors"}
              </div>
              <div
                className="relative w-fit h-fit flex items-center justiy-center cursor-pixel"
                onClick={() =>
                  setScreen(
                    screen < (Number(nft?.agents?.length || 0) > 0 ? 3 : 1)
                      ? screen + 1
                      : 0
                  )
                }
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
                Edition — {nft?.amountSold || 0} / {nft?.amount}
              </div>
              <div className="relative w-full h-fit flex items-center justify-between flex-row gap-3 font-jackey2 flex-wrap sm:flex-nowrap">
                <div className="relative w-fit h-fit flex items-center justify-start gap-2 flex-row">
                  {nft?.profile?.metadata?.picture && (
                    <div
                      className="relative flex rounded-full w-8 h-8 bg-morado border border-morado cursor-pixel"
                      onClick={(e) => {
                        e.stopPropagation();
                        animationContext?.setPageChange?.(true);
                        router.push(
                          `/user/${nft?.profile?.username?.localName}`
                        );
                      }}
                    >
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
                  {moment.unix(Number(nft?.blocktimestamp)).fromNow()}
                </div>
              </div>
              <div className="relative w-full font-start justify-between items-center flex flex-wrap sm:flex-nowrap flex-row gap-3">
                <input
                  disabled={purchaseLoading}
                  type="number"
                  min={1}
                  max={Number(nft?.amount) - Number(nft?.amountSold) || ""}
                  title={nft?.title}
                  placeholder={"1"}
                  value={collectData.amount}
                  step={1}
                  className="relative flex w-20 px-1 h-10 text-black focus:outline-none text-xl text-left text-lg pixel-border-3"
                  onChange={(e) =>
                    setCollectData({
                      ...collectData,
                      amount: Number(e.target.value),
                    })
                  }
                />
                <div className="relative w-fit h-fit justify-end flex text-sm">
                  {(
                    (Number(nft?.prices?.[0]) / 10 ** 18) *
                    Number(collectData?.amount)
                  )?.toFixed(2)}{" "}
                  {
                    TOKENS?.find(
                      (tok) =>
                        nft?.tokens?.[0]?.toLowerCase() ==
                        tok.contract?.toLowerCase()
                    )?.symbol
                  }
                </div>
              </div>
              <div className="relative w-full h-fit flex font-start text-xxs text-[#e14c14] items-start justify-start text-left">
                {Number(nft?.agents?.length || 0) <= 0
                  ? "No Agents Assigned To this Collection."
                  : (Number(nft?.amountSold || 0) > 1 &&
                      Number(nft?.amount || 0) > 2 &&
                      Number(nft?.agents?.length || 0) > 0 &&
                      Number(nft?.prices?.[0]) >=
                        Number(
                          tokenThresholds?.find(
                            (t) =>
                              t?.token?.toLowerCase() ==
                              nft?.tokens?.[0]?.toLowerCase()
                          )?.threshold
                        )) ||
                    (Number(nft?.agents?.length || 0) > 0 &&
                      Number(nft?.amount || 0) > 2 &&
                      Number(nft?.prices?.[0]) >=
                        Number(
                          tokenThresholds?.find(
                            (t) =>
                              t?.token?.toLowerCase() ==
                              nft?.tokens?.[0]?.toLowerCase()
                          )?.threshold
                        ) &&
                      agents
                        ?.filter((ag) => nft?.agents?.includes(ag?.id))
                        ?.map((bal) =>
                          bal?.balance?.filter(
                            (b) =>
                              b?.collectionId == nft?.id &&
                              Number(b?.activeBalance) > 0
                          )
                        )
                        ?.filter((arr) => arr?.length > 0)?.length > 0)
                  ? "Agents Activated!"
                  : Number(nft?.amountSold || 0) == 1 &&
                    Number(nft?.agents?.length || 0) > 0 &&
                    Number(nft?.amount || 0) > 2 &&
                    Number(nft?.prices?.[0]) >=
                      Number(
                        tokenThresholds?.find(
                          (t) =>
                            t?.token?.toLowerCase() ==
                            nft?.tokens?.[0]?.toLowerCase()
                        )?.threshold
                      )
                  ? "Agents Not Yet Activated for this Collection. One more sale needed! Or recharge now!"
                  : "Agents Not Yet Activated for this Collection. Two more sales needed! Or recharge now!"}
              </div>
              <div className="relative w-full h-fit flex">
                <div
                  className={`relative w-full h-14 pixel-border-2 text-black flex items-center justify-center font-start ${
                    !purchaseLoading ? "cursor-pixel" : "opacity-70"
                  }`}
                  onClick={() => {
                    if (!purchaseLoading) {
                      if (!isConnected) {
                        setOpen?.(!open);
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
          ) : screen == 1 ? (
            <div className="relative w-full h-full overflow-y-scroll flex items-start justify-start">
              {Number(nft?.collectors?.length || 0) < 1 ? (
                <div className="relative w-full h-full flex items-center justify-center text-sm text-gray-600 font-jack">
                  No Collectors Yet.
                </div>
              ) : (
                <div className="relative w-full h-fit flex flex-col items-start justify-start  gap-3">
                  {nft?.collectors?.map((collector, key) => {
                    return (
                      <div
                        key={key}
                        className="relative w-full h-fit flex cursor-pixel justify-between items-center flex-wrap sm:flex-nowrap flex-row gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(
                            `https://block-explorer.testnet.lens.dev/tx/${collector?.transactionHash}`
                          );
                        }}
                      >
                        {collector?.name ? (
                          <div
                            className="relative w-fit h-fit flex flex-row gap-1 items-center justify-center cursor-pixel"
                            onClick={(e) => {
                              e.stopPropagation();
                              animationContext?.setPageChange?.(true);
                              router.push(`/user/${collector?.localName}`);
                            }}
                          >
                            {collector?.pfp && (
                              <div className="relative rounded-full w-6 h-6 bg-crema border border-morado">
                                <Image
                                  src={`${INFURA_GATEWAY}/ipfs/${
                                    (collector?.pfp || "")?.split(
                                      "ipfs://"
                                    )?.[1]
                                  }`}
                                  alt="pfp"
                                  draggable={false}
                                  className="rounded-full"
                                  layout="fill"
                                  objectFit="cover"
                                />
                              </div>
                            )}
                            <div className="relative w-fit h-fit flex text-black text-xxs font-start">
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
              )}
            </div>
          ) : screen == 2 ? (
            <div className="relative w-full gap-3 flex flex-col h-full">
              {Number(nft?.agentActivity?.length || 0) < 1 ? (
                <div className="relative w-full h-full flex items-center justify-center text-sm text-gray-600 font-jack">
                  No Agent Activity Yet.
                </div>
              ) : (
                <div
                  className="relative w-full h-[50%] overflow-y-scroll"
                  id="scrollableDiv"
                >
                  <InfiniteScroll
                    scrollableTarget="scrollableDiv"
                    dataLength={nft?.agentActivity?.length || 1}
                    next={handleMoreActivity}
                    hasMore={hasMore}
                    loader={<div key={0} />}
                    className="relative w-full"
                  >
                    <Comments
                      agents={agents}
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
              )}

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
          ) : (
            <div className="relative w-full h-full overflow-y-scroll flex items-start justify-start">
              <div className="relative w-full h-fit flex flex-col items-start justify-start  gap-3">
                {agents
                  ?.filter((ag) => nft?.agents?.includes(ag?.id))
                  ?.map((agent, key) => {
                    return (
                      <div
                        key={key}
                        className="relative w-full h-fit flex justify-between items-center flex-col gap-2"
                      >
                        <div className="relative w-full h-px flex bg-black"></div>
                        <div className="relative w-full h-fit flex flex-row gap-2 justify-between items-center md:flex-nowrap flex-wrap">
                          <div
                            className="relative w-fit h-fit flex cursor-pixel"
                            onClick={(e) => {
                              e.stopPropagation();
                              animationContext?.setPageChange?.(true);
                              router.push(`/agent/${agent?.id}`);
                            }}
                          >
                            <div className="relative w-20 h-20 flex">
                              <Image
                                src={`${INFURA_GATEWAY}/ipfs/${
                                  agent?.cover?.split("ipfs://")?.[1]
                                }`}
                                alt="pfp"
                                draggable={false}
                                layout="fill"
                                objectFit="contain"
                              />
                            </div>
                          </div>
                          <input
                            className="relative w-full h-full p-1 bg-white text-sm text-black font-jackey2 focus:outline-none pixel-border-3"
                            placeholder="1"
                            type="number"
                            disabled={rechargeLoading[key]}
                            min={1}
                            value={rechargeAmount[key]}
                            onChange={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setRechargeAmount((prev) => {
                                const newR = { ...prev };

                                newR[key] = Number(e.target.value);

                                return newR;
                              });
                            }}
                          />
                          <div className="relative w-fit h-fit flex text-sm font-jackey2">
                            {
                              TOKENS?.find(
                                (tok) =>
                                  tok.contract?.toLowerCase() ==
                                  nft?.tokens?.[0]?.toLowerCase()
                              )?.symbol
                            }
                          </div>
                          <div className="relative w-fit h-fit flex">
                            <div
                              className={`relative w-24 h-8 pixel-border-2 text-black flex items-center justify-center text-xxs font-start ${
                                !rechargeLoading[key]
                                  ? "cursor-pixel"
                                  : "opacity-70"
                              }`}
                              onClick={() => {
                                if (!rechargeLoading[key]) {
                                  if (!isConnected) {
                                    setOpen?.(!open);
                                  } else if (approvedRecharge[key]) {
                                    handleRecharge(
                                      key,
                                      nft?.tokens?.[0],
                                      Number(agent?.id)
                                    );
                                  } else {
                                    handleApproveRecharge(key);
                                  }
                                }
                              }}
                            >
                              {rechargeLoading[key] ? (
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
                              ) : approvedRecharge[key] || !isConnected ? (
                                "Recharge"
                              ) : (
                                "Approve"
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="relative w-full h-fit flex items-start justify-between gap-2 text-xs font-jackey2 sm:flex-nowrap flex-wrap">
                          <div className="relative w-full h-fit flex items-start justify-between flex-col gap-1">
                            <div className="relative w-fit h-fit flex">
                              Active Collection Balance:
                            </div>
                            <div className="relative w-fit h-fit flex">
                              {Number(
                                agent?.balance?.find(
                                  (bal) =>
                                    Number(bal?.collectionId) == Number(nft?.id)
                                )?.activeBalance || 0
                              ) /
                                10 ** 18}
                            </div>
                          </div>
                          <div className="relative w-full h-fit flex items-start justify-between flex-col gap-1">
                            <div className="relative w-fit h-fit flex">
                              Publishing Rate:
                            </div>
                            <div className="relative w-fit h-fit flex">
                              {Number(
                                agent?.details?.find(
                                  (bal) =>
                                    Number(bal?.collectionId) == Number(nft?.id)
                                )?.dailyFrequency || 0
                              ) *
                                (Number(
                                  tokenThresholds?.find(
                                    (thr) =>
                                      thr?.token?.toLowerCase() ==
                                      nft?.tokens?.[0]?.toLowerCase()
                                  )?.rent || 0
                                ) /
                                  10 ** 18)}
                            </div>
                          </div>
                        </div>
                        <div className="relative w-full h-fit text-[#e14c14] font-jackey2 text-sm break-all flex">
                          {Number(
                            agent?.balance?.find(
                              (bal) =>
                                Number(bal?.collectionId) == Number(nft?.id)
                            )?.activeBalance || 0
                          ) /
                            (Number(
                              agent?.details?.find(
                                (bal) =>
                                  Number(bal?.collectionId) == Number(nft?.id)
                              )?.dailyFrequency || 0
                            ) *
                              Number(
                                tokenThresholds?.find(
                                  (thr) =>
                                    thr?.token?.toLowerCase() ==
                                    nft?.tokens?.[0]?.toLowerCase()
                                )?.rent || 0
                              )) || 0 > 0
                            ? `If not recharged, Agent will run out in ${
                                Number(
                                  agent?.balance?.find(
                                    (bal) =>
                                      Number(bal?.collectionId) ==
                                      Number(nft?.id)
                                  )?.activeBalance || 0
                                ) /
                                  (Number(
                                    agent?.details?.find(
                                      (bal) =>
                                        Number(bal?.collectionId) ==
                                        Number(nft?.id)
                                    )?.dailyFrequency || 0
                                  ) *
                                    Number(
                                      tokenThresholds?.find(
                                        (thr) =>
                                          thr?.token?.toLowerCase() ==
                                          nft?.tokens?.[0]?.toLowerCase()
                                      )?.rent || 0
                                    )) || 0
                              } cycles!!`
                            : "Agent needs to be recharged to start activity!"}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Purchase;
