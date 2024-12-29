"use client";

import { ModalContext } from "@/app/providers";
import useAgent from "@/components/Agent/hooks/useAgent";
import useInteractions from "@/components/NFT/hooks/useInteractions";
import Comments from "@/components/NFT/modules/Comments";
import Post from "@/components/NFT/modules/Post";
import { INFURA_GATEWAY, TOKENS } from "@/lib/constants";
import moment from "moment";
import Image from "next/legacy/image";
import { useParams, useRouter } from "next/navigation";
import { useContext } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

export default function Agent() {
  const id = useParams();
  const router = useRouter();
  const context = useContext(ModalContext);
  const {
    agent,
    agentLoading,
    hasMore,
    handleMoreActivity,
    screen,
    setScreen,
    setAgent,
  } = useAgent(id?.id as string, context?.lensClient!, context?.lensConnected);

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
    agent?.activity,
    context?.lensConnected?.sessionClient!,
    context?.setSignless!,
    context?.storageClient!,
    String(agent?.id),
    context?.setIndexer!,
    context?.setNotification!,
    setAgent,
    agent
  );

  return (
    <div className="relative w-full h-full flex flex-row items-start justify-between gap-4 pb-10">
      <div className="relative w-full h-full flex px-6 py-2">
        {agent?.cover && (
          <Image
            alt={id?.toString() || ""}
            src={`${INFURA_GATEWAY}/ipfs/${
              agent?.cover?.includes("ipfs")
                ? agent?.cover?.split("ipfs://")?.[1]
                : agent?.cover
            }`}
            draggable={false}
            layout="fill"
            objectFit="contain"
            className="cursor-pixel"
            onClick={() =>
              context?.setImageView(
                `${INFURA_GATEWAY}/ipfs/${agent?.cover?.split("ipfs://")?.[1]}`
              )
            }
          />
        )}
      </div>
      <div
        className={`relative w-[38rem] h-[40rem] flex flex-col gap-4 items-start justify-start text-left p-3 pixel-border-2 bg-white ${
          (agentLoading || !agent) && "animate-pulse"
        }`}
      >
        {(!agentLoading || agent) && (
          <>
            <div className="relative w-full h-fit flex items-center justify-center gap-3 flex-col">
              <div className="relative w-full h-fit flex items-center justify-center gap-1 flex-col">
                <div className="h-1 w-full flex bg-black" />
                <div className="h-1 w-full flex bg-black" />
              </div>
              <div className="relative w-full h-fit flex flex-row justify-between items-center">
                <div
                  className="relative w-fit h-fit flex items-center justiy-center cursor-pixel"
                  onClick={() => setScreen(screen > 0 ? screen - 1 : 5)}
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
                    ? "Agent"
                    : screen == 1
                    ? "Agent Activity"
                    : screen == 2
                    ? "Active Collections"
                    : screen == 3
                    ? "Collection History"
                    : screen == 4
                    ? "Rent History"
                    : "Active Balances"}
                </div>
                <div
                  className="relative w-fit h-fit flex items-center justiy-center cursor-pixel"
                  onClick={() => setScreen(screen < 5 ? screen + 1 : 0)}
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
                  {agent?.title}
                </div>
                <div className="relative w-full h-fit flex items-center justify-between gap-2">
                  <div className="relative w-fit h-fit flex text-black text-xs text-black font-jackey2">
                    Agent Owner
                  </div>
                  <div className="relative w-fit h-fit flex items-center justify-start gap-2 flex-row">
                    <div className="relative flex rounded-full w-8 h-8 bg-morado border border-morado">
                      {agent?.ownerProfile?.metadata?.picture && (
                        <Image
                          src={`${INFURA_GATEWAY}/ipfs/${
                            agent?.ownerProfile?.metadata?.picture?.split(
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
                      {agent?.ownerProfile?.username?.localName
                        ? "@" +
                          agent?.ownerProfile?.username?.localName?.slice(0, 10)
                        : agent?.owner?.slice(0, 10)}
                    </div>
                  </div>
                </div>
                <div className="relative w-full h-fit flex items-center justify-between gap-2">
                  <div className="relative w-fit h-fit flex text-black text-xs text-black font-jackey2">
                    Agent
                  </div>
                  <div className="relative w-fit h-fit flex items-center justify-start gap-2 flex-row">
                    <div className="relative flex rounded-full w-8 h-8 bg-morado border border-morado">
                      {agent?.profile?.metadata?.picture && (
                        <Image
                          src={`${INFURA_GATEWAY}/ipfs/${
                            agent?.profile?.metadata?.picture?.split(
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
                      {agent?.profile?.username?.localName
                        ? "@" +
                          agent?.profile?.username?.localName?.slice(0, 10)
                        : agent?.wallet?.slice(0, 10)}
                    </div>
                  </div>
                </div>
                <div className="relative w-full h-fit flex py-4 overflow-y-scroll">
                  <div className="py-3 h-full max-h-full overflow-y-scroll flex relative items-start justify-start text-left text-black text-sm font-jack">
                    {agent?.description}
                  </div>
                </div>
                <div className="relative w-full h-fit flex py-4 overflow-y-scroll">
                  <div className="py-3 h-full max-h-full overflow-y-scroll flex relative items-start justify-start text-left text-black text-sm font-jack">
                    {agent?.customInstructions}
                  </div>
                </div>
              </>
            ) : screen == 1 ? (
              <div className="relative w-full gap-3 flex flex-col h-full">
                <div
                  className="relative w-full h-[50%] overflow-y-scroll"
                  id="scrollableDiv"
                >
                  <InfiniteScroll
                    scrollableTarget="scrollableDiv"
                    dataLength={agent?.activity?.length || 1}
                    next={handleMoreActivity}
                    hasMore={hasMore}
                    loader={<></>}
                    className="relative w-full"
                  >
                    <Comments
                      comments={agent?.activity || []}
                      setImageView={context?.setImageView!}
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
            ) : screen == 4 ? (
              <div className="relative w-full h-full overflow-y-scroll flex items-start justify-start">
                <div className="relative w-full h-fit flex flex-col items-start justify-start  gap-3">
                  {Number(agent?.rentPaid?.length) < 1 ? (
                    <div className="relative w-full h-full flex items-center justify-center text-sm text-gray-600 font-jack">
                      No Rent Paid Yet.
                    </div>
                  ) : (
                    agent?.rentPaid?.map((rent, key) => {
                      return (
                        <div
                          key={key}
                          className="relative w-full h-fit flex cursor-pixel justify-between items-center flex-row gap-2"
                          onClick={() =>
                            window.open(
                              `https://block-explorer.testnet.lens.dev/tx/${rent?.transactionHash}`
                            )
                          }
                        >
                          <div className="relative w-fit h-fit flex items-center justify-center text-black font-jackey2 text-xs">
                            {rent?.transactionHash?.slice(0, 5) +
                              "..." +
                              rent?.transactionHash?.slice(-3)}
                          </div>
                          <div className="relative w-fit h-fit flex items-center justify-center text-black font-jackey2 text-xs">
                            {moment
                              .unix(Number(rent?.blockTimestamp))
                              .fromNow()}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : screen == 5 ? (
              <div className="relative w-full h-full overflow-y-scroll flex items-start justify-start">
                <div className="relative w-full h-fit flex flex-col items-start justify-start  gap-3">
                  {Number(agent?.balance?.length) < 1 ? (
                    <div className="relative w-full h-full flex items-center justify-center text-sm text-gray-600 font-jack">
                      No Balances Yet.
                    </div>
                  ) : (
                    agent?.balance?.map((balance, key) => {
                      return (
                        <div
                          key={key}
                          className="relative w-full h-fit flex justify-between items-center flex-row gap-2 cursor-pixel"
                          onClick={() =>
                            router.push(
                              `/nft/${
                                agent?.collectionIdsHistory
                                  ?.find(
                                    (col) =>
                                      Number(col?.collectionId) ==
                                      Number(balance?.collectionId)
                                  )
                                  ?.profile?.username?.value?.split(
                                    "lens/"
                                  )?.[1]
                              }/${
                                agent?.collectionIdsHistory?.find(
                                  (col) =>
                                    Number(col?.collectionId) ==
                                    Number(balance?.collectionId)
                                )?.collectionId
                              }`
                            )
                          }
                        >
                          <div className="relative w-fit h-fit flex items-center justify-center">
                            <div className="rounded-sm w-7 h-7 flex relative">
                              <Image
                                draggable={false}
                                objectFit="cover"
                                className="rounded-sm"
                                layout="fill"
                                src={`${INFURA_GATEWAY}/ipf/${
                                  agent?.collectionIdsHistory
                                    ?.find(
                                      (col) =>
                                        Number(col?.collectionId) ==
                                        Number(balance?.collectionId)
                                    )
                                    ?.metadata?.image?.split("ipfs://")?.[1]
                                }`}
                              />
                            </div>
                          </div>
                          <div className="relative w-fit h-fit flex text-left">
                            {balance.activeBalance}{" "}
                            {
                              TOKENS.find(
                                (tok) =>
                                  tok.contract?.toLowerCase() ==
                                  balance?.token?.toLowerCase()
                              )?.symbol
                            }
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : (
              <div className="relative w-full h-full overflow-y-scroll flex items-start justify-start">
                <div className="relative w-full h-fit flex flex-col items-start justify-start  gap-3">
                  {Number(
                    screen == 2
                      ? agent?.activeCollectionIds?.length
                      : agent?.collectionIdsHistory?.length
                  ) < 1 ? (
                    <div className="relative w-full h-full flex items-center justify-center text-sm text-gray-600 font-jack">
                      No Collections Yet.
                    </div>
                  ) : (
                    (screen == 2
                      ? agent?.activeCollectionIds
                      : agent?.collectionIdsHistory
                    )?.map((collection, key) => {
                      return (
                        <div
                          key={key}
                          className="relative w-full h-fit flex cursor-pixel justify-between items-center flex-row gap-2"
                          onClick={() =>
                            router.push(
                              `/nft/${
                                collection?.profile?.username?.value?.split(
                                  "lens/"
                                )?.[1]
                              }/${collection?.collectionId}`
                            )
                          }
                        >
                          <div className="relative w-fit h-fit flex items-center justify-center">
                            <div className="rounded-sm w-7 h-7 flex relative">
                              <Image
                                draggable={false}
                                objectFit="cover"
                                className="rounded-sm"
                                layout="fill"
                                src={`${INFURA_GATEWAY}/ipf/${
                                  collection?.metadata?.image?.split(
                                    "ipfs://"
                                  )?.[1]
                                }`}
                              />
                            </div>
                          </div>
                          <div className="relative w-fit h-fit flex items-center justify-center text-black font-jackey2 text-xs">
                            {collection?.metadata?.title}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
