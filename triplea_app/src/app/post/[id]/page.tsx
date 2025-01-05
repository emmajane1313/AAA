"use client";

import { ModalContext } from "@/app/providers";
import useInteractions from "@/components/NFT/hooks/useInteractions";
import Comments from "@/components/NFT/modules/Comments";
import MakePost from "@/components/NFT/modules/Post";
import usePost from "@/components/Post/hooks/usePost";
import { useParams } from "next/navigation";
import { useContext } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

export default function Post() {
  const id = useParams();
  const context = useContext(ModalContext);
  const {
    postData,
    handleActivity,
    activity,
    handleMoreActivity,
    activityCursor,
    activityLoading,
    setActivity,
    setPostData,
    postDataLoading,
  } = usePost(context?.lensConnected, context?.lensClient!, id?.id as string);
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
    interactionsLoadingPost,
  } = useInteractions(
    context?.lensConnected?.sessionClient!,
    context?.setSignless!,
    context?.storageClient!,
    context?.setIndexer!,
    context?.setNotification!,
    setActivity,
    activity,
    handleActivity,
    setPostData,
    id?.id as string
  );
  return (
    <div className="relative w-full h-full flex flex-col md:flex-row items-center justify-between gap-4 pb-10">
      <div className="relative w-full h-full flex px-1 sm:px-6 py-2">
        <Comments
          comments={postData}
          setImageView={context?.setImageView!}
          interactionsLoading={interactionsLoadingPost}
          handleLike={handleLike}
          handleMirror={handleMirror}
          setCommentQuote={setCommentQuote}
          postLoading={postLoading}
          commentQuote={commentQuote}
          agents={context?.agents!}
          post
        />
      </div>
      <div
        className={`relative w-full md:w-[38rem] h-[60rem] md:h-[40rem] flex flex-col gap-4 items-start justify-start text-left p-3 pixel-border-2 bg-white ${
          (postDataLoading || postData?.length < 1 || activityLoading) &&
          "animate-pulse"
        }`}
      >
        {!postDataLoading && postData?.length > 0 && (
          <div className="relative w-full gap-3 flex flex-col h-full justify-between">
            {!activityLoading && activity?.length < 1 ? (
              <div className="relative w-full h-full flex items-center justify-center text-xs font-jackey2 text-black">
                Not Post Activity Yet.
              </div>
            ) : (
              <div className="relative w-full h-[50%] overflow-y-scroll">
                <InfiniteScroll
                  dataLength={activity?.length || 1}
                  next={handleMoreActivity}
                  hasMore={activityCursor ? true : false}
                  loader={<div key={0} />}
                  className="relative w-full"
                >
                  <Comments
                    comments={activity || []}
                    setImageView={context?.setImageView!}
                    interactionsLoading={interactionsLoading}
                    handleLike={handleLike}
                    handleMirror={handleMirror}
                    setCommentQuote={setCommentQuote}
                    postLoading={postLoading}
                    commentQuote={commentQuote}
                    agents={context?.agents!}
                  />
                </InfiniteScroll>
              </div>
            )}
            <MakePost
              handlePost={handlePost}
              postLoading={postLoading}
              setPost={setPost}
              post={post}
              commentQuote={commentQuote}
              setCommentQuote={setCommentQuote}
              handleComment={handleComment}
              handleQuote={handleQuote}
              success={success}
              postPage
            />
          </div>
        )}
      </div>
    </div>
  );
}
