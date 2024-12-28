"use client";

import { ModalContext } from "@/app/providers";
import useAgent from "@/components/Agent/hooks/useAgent";
import useInteractions from "@/components/NFT/hooks/useInteractions";
import Comments from "@/components/NFT/modules/Comments";
import Post from "@/components/NFT/modules/Post";
import { INFURA_GATEWAY } from "@/lib/constants";
import moment from "moment";
import Image from "next/legacy/image";
import { useParams } from "next/navigation";
import { useContext } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

export default function Agent() {
  const id = useParams();
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
                <div className="text-black font-start text-sm relative flex w-fit h-fit text-center text-black">
                  {screen < 1 ? "Agent" : "Agent Activity"}
                </div>
                <div
                  className="relative w-fit h-fit flex items-center justiy-center cursor-pixel"
                  onClick={() => setScreen(screen < 1 ? screen + 1 : 0)}
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
                <div className="relative text-sm text-black flex font-jackey2">
                  Owner — {agent?.owner}
                </div>

                <div className="relative w-full h-fit flex items-center justify-start gap-2 flex-row">
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
                      ? "@" + agent?.profile?.username?.localName?.slice(0, 10)
                      : agent?.wallet?.slice(0, 10)}
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
            ) : (
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
            )}
          </>
        )}
      </div>
    </div>
  );
}
