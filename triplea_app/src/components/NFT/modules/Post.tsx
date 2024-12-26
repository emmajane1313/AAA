import { FunctionComponent, JSX } from "react";
import { PostProps } from "../types/nft.types";
import { AiOutlineLoading } from "react-icons/ai";

const Post: FunctionComponent<PostProps> = ({
  handlePost,
  postLoading,
  setPost,
  post,
  commentQuote,
  setCommentQuote,
}): JSX.Element => {
  return (
    <div className="relative w-full h-fit flex items-center justify-center flex flex-col gap-2">
      <textarea
        value={post}
        onChange={(e) => setPost(e.target.value)}
        className="relative w-full h-28 flex items-start justify-start p-2 text-left text-black text-sm focus:outline-none"
        style={{
          resize: "none",
        }}
      ></textarea>
      <div className="relative w-full flex h-10 flex-row gap-2 justify-between items-center">
        {commentQuote && (
          <div
            className="cursor-pointer w-10 h-full bg-black rounded-md text-white text-center flex items-center justify-center"
            onClick={() => setCommentQuote(undefined)}
          >
            {"<"}
          </div>
        )}
        <div
          className={`relative w-full h-full bg-black rounded-md text-white text-center flex items-center justify-center ${
            !postLoading && post?.trim() !== ""
              ? "cursor-pointer"
              : "opacity-70"
          }`}
          onClick={() => !postLoading && post?.trim() !== "" && handlePost()}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            {postLoading ? (
              <AiOutlineLoading
                color="white"
                size={15}
                className="animate-spin"
              />
            ) : commentQuote?.type == "Comment" ? (
              "Comment"
            ) : commentQuote?.type == "Quote" ? (
              "Quote"
            ) : (
              "Post"
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Post;
