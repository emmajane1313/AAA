import { FunctionComponent, JSX, useContext } from "react";
import { CommentsProps } from "../types/nft.types";
import Metadata from "./Metadata";
import Image from "next/legacy/image";
import { INFURA_GATEWAY } from "@/lib/constants";
import moment from "moment";
import { useRouter } from "next/navigation";
import { AnimationContext } from "@/app/providers";

const Comments: FunctionComponent<CommentsProps> = ({
  comments,
  setImageView,
  setCommentQuote,
  handleLike,
  handleMirror,
  interactionsLoading,
  postLoading,
  commentQuote,
  agents,
  post,
}): JSX.Element => {
  const router = useRouter();
  const animationContext = useContext(AnimationContext);

  return (
    <div
      className={`relative w-full flex flex-col items-start justify-start gap-3 h-fit ${
        post ? "h-full" : "h-fit"
      }`}
    >
      {comments?.map((activity, key) => {
        return (
          <div
            key={key}
            className={`"relative w-full gap-3 flex-col flex flex shadow-md item-start p-2 ${
              post ? "h-full justify-between" : "h-fit justify-start"
            }`}
          >
            <div
              className={`relative w-full h-fit flex flex-row items-center gap-2 text-xxs ${
                activity?.commentOn?.id || activity?.quoteOf?.id
                  ? "justify-between"
                  : "justify-end"
              }`}
            >
              {(activity?.commentOn?.id || activity?.quoteOf?.id) && (
                <div className="relative font-jackey2 w-fit h-fit flex">
                  {(activity?.commentOn?.id
                    ? `Comment On ${(
                        activity?.commentOn?.metadata as any
                      )?.content?.slice(0, 10)}`
                    : `Quote Of ${(
                        activity?.quoteOf?.metadata as any
                      )?.content?.slice(0, 10)}`) + "..."}
                </div>
              )}
              <div
                className="flex items-center justify-center relative w-fit h-fit cursor-pixel hover:opacity-70"
                onClick={() => {
                  animationContext?.setPageChange?.(true);
                  router.push(`/post/${activity?.id}`);
                }}
              >
                <svg
                  fill="none"
                  className="size-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  {" "}
                  <path
                    d="M21 3h-8v2h4v2h2v4h2V3zm-4 4h-2v2h-2v2h2V9h2V7zm-8 8h2v-2H9v2H7v2h2v-2zm-4-2v4h2v2H5h6v2H3v-8h2z"
                    fill="currentColor"
                  />{" "}
                </svg>
              </div>
            </div>

            <div className="relative w-full h-fit px-1.5 py-1 flex items-start justify-between flex-row gap-2 font-jackey2 sm:flex-nowrap flex-wrap">
              <div
                className="relative w-fit h-fit flex flex-row gap-1  items-center justify-center cursor-pixel"
                onClick={() => {
                  animationContext?.setPageChange?.(true);
                  router.push(
                    agents
                      ?.map((ag) => ag?.profile?.address)
                      ?.includes(activity?.author?.address)
                      ? `/agent/${
                          agents?.find(
                            (ag) =>
                              ag?.profile?.address?.toLowerCase() ==
                              activity?.author?.address?.toLowerCase()
                          )?.id
                        }`
                      : `/user/${activity?.author?.username?.localName}`
                  );
                }}
              >
                <div className="relative w-fit h-fit flex items-center justify-center">
                  <div className="w-6 h-6 flex relative flex items-center justify-center rounded-full border border-morado bg-morado">
                    <Image
                      layout="fill"
                      objectFit="cover"
                      className="rounded-full"
                      draggable={false}
                      src={`${INFURA_GATEWAY}/ipfs/${
                        activity?.author?.metadata?.picture?.split(
                          "ipfs://"
                        )?.[1]
                      }`}
                    />
                  </div>
                </div>
                <div className="relative w-fit h-fit flex items-center justify-center text-black text-xs">
                  {activity?.author?.username?.localName}
                </div>
              </div>
              <div className="relative w-fit h-fit flex text-xs text-black">
                {moment(`${activity?.timestamp}`).fromNow()}
              </div>
            </div>
            <Metadata
              data={activity?.metadata as any}
              metadata={activity?.metadata?.__typename!}
              setImageView={setImageView}
              post={post}
            />
            <div className="relative w-full h-fit p-1 pixel-border-3 font-jackey2 justify-between flex flex-row gap-3 items-center sm:flex-nowrap flex-wrap">
              {[
                {
                  name: "Like",
                  function: () =>
                    handleLike(
                      activity?.id,
                      activity?.operations?.hasUpvoted ? "DOWNVOTE" : "UPVOTE",
                      post || false
                    ),
                  svgFull: (
                    <svg
                      className="size-4"
                      fill="#5aacfa"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      {" "}
                      <path
                        d="M9 2H5v2H3v2H1v6h2v2h2v2h2v2h2v2h2v2h2v-2h2v-2h2v-2h2v-2h2v-2h2V6h-2V4h-2V2h-4v2h-2v2h-2V4H9V2zm0 2v2h2v2h2V6h2V4h4v2h2v6h-2v2h-2v2h-2v2h-2v2h-2v-2H9v-2H7v-2H5v-2H3V6h2V4h4z"
                        fill="#5aacfa"
                      />{" "}
                    </svg>
                  ),
                  svgEmpty: (
                    <svg
                      className="size-4"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      {" "}
                      <path
                        d="M9 2H5v2H3v2H1v6h2v2h2v2h2v2h2v2h2v2h2v-2h2v-2h2v-2h2v-2h2v-2h2V6h-2V4h-2V2h-4v2h-2v2h-2V4H9V2zm0 2v2h2v2h2V6h2V4h4v2h2v6h-2v2h-2v2h-2v2h-2v2h-2v-2H9v-2H7v-2H5v-2H3V6h2V4h4z"
                        fill="currentColor"
                      />{" "}
                    </svg>
                  ),
                  stats: activity?.stats?.reactions,
                  reacted: activity?.operations?.hasUpvoted,
                  loader: interactionsLoading?.find(
                    (int) => int.id == activity?.id
                  )?.like,
                },
                {
                  name: "Mirror",
                  function: () => handleMirror(activity?.id, post || false),
                  reacted: activity?.operations?.hasReposted?.optimistic,
                  svgFull: (
                    <svg
                      className="size-4"
                      fill="#5aacfa"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      {" "}
                      <path
                        d="M11 2H9v2H7v2H5v2H1v8h4v2h2v2h2v2h2V2zM7 18v-2H5v-2H3v-4h2V8h2V6h2v12H7zm6-8h2v4h-2v-4zm8-6h-2V2h-6v2h6v2h2v12h-2v2h-6v2h6v-2h2v-2h2V6h-2V4zm-2 4h-2V6h-4v2h4v8h-4v2h4v-2h2V8z"
                        fill="#5aacfa"
                      />{" "}
                    </svg>
                  ),
                  svgEmpty: (
                    <svg
                      className="size-4"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      {" "}
                      <path
                        d="M11 2H9v2H7v2H5v2H1v8h4v2h2v2h2v2h2V2zM7 18v-2H5v-2H3v-4h2V8h2V6h2v12H7zm6-8h2v4h-2v-4zm8-6h-2V2h-6v2h6v2h2v12h-2v2h-6v2h6v-2h2v-2h2V6h-2V4zm-2 4h-2V6h-4v2h4v8h-4v2h4v-2h2V8z"
                        fill="currentColor"
                      />{" "}
                    </svg>
                  ),
                  stats: activity?.stats?.reposts,
                  loader: interactionsLoading?.find(
                    (int) => int.id == activity?.id
                  )?.mirror,
                },
                {
                  name: "Comment",
                  reacted: activity?.operations?.hasCommented?.optimistic,
                  function: () =>
                    setCommentQuote({
                      type: "Comment",
                      id: activity?.id,
                      post: post ? activity?.id : undefined,
                    }),
                  svgFull: (
                    <svg
                      className="size-4"
                      fill="#5aacfa"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      {" "}
                      <path
                        d="M22 2H2v14h2V4h16v12h-8v2h-2v2H8v-4H2v2h4v4h4v-2h2v-2h10V2z"
                        fill="#5aacfa"
                      />{" "}
                    </svg>
                  ),
                  svgEmpty: (
                    <svg
                      className="size-4"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      {" "}
                      <path
                        d="M22 2H2v14h2V4h16v12h-8v2h-2v2H8v-4H2v2h4v4h4v-2h2v-2h10V2z"
                        fill="currentColor"
                      />{" "}
                    </svg>
                  ),
                  stats: activity?.stats?.comments,
                  loader: postLoading && commentQuote?.type == "Comment",
                },
                {
                  name: "Quote",
                  function: () =>
                    setCommentQuote({
                      type: "Quote",
                      id: activity?.id,
                      post: post ? activity?.id : undefined,
                    }),
                  reacted: activity?.operations?.hasQuoted?.optimistic,
                  svgFull: (
                    <svg
                      className="size-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="#5aacfa"
                    >
                      <path
                        d="M4 2h18v16H6v2H4v-2h2v-2h14V4H4v18H2V2h2zm5 7H7v2h2V9zm2 0h2v2h-2V9zm6 0h-2v2h2V9z"
                        fill="#5aacfa"
                      />
                    </svg>
                  ),
                  svgEmpty: (
                    <svg
                      className="size-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M4 2h18v16H6v2H4v-2h2v-2h14V4H4v18H2V2h2zm5 7H7v2h2V9zm2 0h2v2h-2V9zm6 0h-2v2h2V9z"
                        fill="currentColor"
                      />
                    </svg>
                  ),
                  stats: activity?.stats?.quotes,
                  loader: postLoading && commentQuote?.type == "Quote",
                },
              ].map((item, key) => {
                return (
                  <div
                    key={key}
                    className="relative w-fit h-fit flex items-center justify-center flex-row gap-1"
                    title={item.name}
                  >
                    <div
                      className={`relative w-fit h-fit flex ${
                        item?.loader ? "animate-spin" : "cursor-pixel"
                      }`}
                      onClick={() => !item?.loader && item.function()}
                    >
                      {item?.loader ? (
                        <svg
                          fill="none"
                          className="size-4"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M13 2h-2v6h2V2zm0 14h-2v6h2v-6zm9-5v2h-6v-2h6zM8 13v-2H2v2h6zm7-6h2v2h-2V7zm4-2h-2v2h2V5zM9 7H7v2h2V7zM5 5h2v2H5V5zm10 12h2v2h2v-2h-2v-2h-2v2zm-8 0v-2h2v2H7v2H5v-2h2z"
                            fill="currentColor"
                          />{" "}
                        </svg>
                      ) : item?.reacted ? (
                        item?.svgFull
                      ) : (
                        item?.svgEmpty
                      )}
                    </div>
                    <div className="text-xs relative w-fit h-fit flex items-center justify-center text-black cursor-pixel">
                      {item?.stats || 0}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Comments;
