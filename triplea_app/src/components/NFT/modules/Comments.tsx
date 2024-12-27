import { FunctionComponent, JSX } from "react";
import { CommentsProps } from "../types/nft.types";
import Metadata from "./Metadata";
import Image from "next/legacy/image";
import { INFURA_GATEWAY } from "@/lib/constants";
import moment from "moment";
import { FaHeart } from "react-icons/fa";
import { AiOutlineLoading, AiOutlineRetweet } from "react-icons/ai";
import { CiHeart } from "react-icons/ci";
import { GoCommentDiscussion } from "react-icons/go";
import { BsChatSquareQuote } from "react-icons/bs";

const Comments: FunctionComponent<CommentsProps> = ({
  comments,
  setImageView,
  setCommentQuote,
  handleLike,
  handleMirror,
  interactionsLoading,
  postLoading,
  commentQuote,
}): JSX.Element => {
  return (
    <div className="relative w-full flex flex-col items-start justify-start gap-3 h-fit">
      {comments?.map((activity, key) => {
        return (
          <div
            key={key}
            className="relative w-full h-fit gap-3 flex-col flex flex shadow-md item-start justify-start p-2"
          >
            <div className="relative w-full h-fit px-1.5 py-1 flex items-start justify-between flex-row gap-2">
              <div className="relative w-fit h-fit flex flex-row gap-1  items-center justify-center">
                <div className="relative w-fit h-fit flex items-center justify-center">
                  <div className="w-6 h-6 flex relative flex items-center justify-center rounded-full border border-morado bg-morado">
                    <Image
                      layout="fill"
                      objectFit="cover"
                      draggable={false}
                      src={`${INFURA_GATEWAY}/ipfs/${activity?.author?.username?.namespace?.metadata?.picture}`}
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
            />
            <div className="relative w-full h-fit p-1 border border-morado rounded-md justify-between flex flex-row gap-3">
              {[
                {
                  name: "Like",
                  function: () =>
                    handleLike(
                      activity?.id,

                      activity?.operations?.hasUpvoted ? "DOWNVOTE" : "UPVOTE"
                    ),
                  svgFull: <FaHeart color="#D076E6" size={15} />,
                  svgEmpty: <CiHeart color="black" size={15} />,
                  stats: (activity as any)?.stats?.upvotes,
                  loader: interactionsLoading?.find(
                    (int) => int.id == activity?.id
                  )?.like,
                },
                {
                  name: "Mirror",
                  function: () => handleMirror(activity?.id),
                  svgFull: <AiOutlineRetweet color="#D076E6" size={15} />,
                  svgEmpty: <AiOutlineRetweet color="black" size={15} />,
                  stats: (activity as any)?.stats?.reposts,
                  loader: interactionsLoading?.find(
                    (int) => int.id == activity?.id
                  )?.mirror,
                },
                {
                  name: "Comment",
                  function: () =>
                    setCommentQuote({
                      type: "Comment",
                      id: activity?.id,
                    }),
                  svgFull: <GoCommentDiscussion color="#D076E6" size={15} />,
                  svgEmpty: <GoCommentDiscussion color="black" size={15} />,
                  stats: (activity as any)?.stats?.reposts,
                  loader: postLoading && commentQuote?.type == "Comment",
                },
                {
                  name: "Quote",
                  function: () =>
                    setCommentQuote({
                      type: "Quote",
                      id: activity?.id,
                    }),
                  svgFull: <BsChatSquareQuote color="#D076E6" size={15} />,
                  svgEmpty: <BsChatSquareQuote color="black" size={15} />,
                  stats: (activity as any)?.stats?.quotes,
                  loader: postLoading && commentQuote?.type == "Quote",
                },
              ].map((item, key) => {
                return (
                  <div
                    key={key}
                    className="relative w-fit h-fit flex items-center justify-center flex-row gap-1"
                  >
                    <div
                      className={`relative w-fit h-fit flex ${
                        item?.loader ? "animate-spin" : "cursor-pointer"
                      }`}
                      onClick={() => !item?.loader && item.function()}
                    >
                      {item?.loader ? (
                        <AiOutlineLoading color="black" size={15} />
                      ) : item?.stats > 0 ? (
                        item?.svgFull
                      ) : (
                        item?.svgEmpty
                      )}
                    </div>
                    <div className="text-xs relative w-fit h-fit flex items-center justify-center text-black">
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
