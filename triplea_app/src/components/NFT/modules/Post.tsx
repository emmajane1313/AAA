import { FunctionComponent, JSX } from "react";
import { PostProps } from "../types/nft.types";

const Post: FunctionComponent<PostProps> = ({
  handlePost,
  postLoading,
  setPost,
  post,
  commentQuote,
  setCommentQuote,
  handleComment,
  handleQuote,
  success,
  postPage,
}): JSX.Element => {
  return (
    <div className="relative w-full h-fit flex">
      <div className="relative w-full h-60 flex items-center justify-center flex flex-col gap-2">
        <textarea
          value={post}
          onChange={(e) => setPost(e.target.value)}
          className="relative w-full h-28 flex items-start justify-start p-2 text-left text-black text-sm focus:outline-none font-jack pixel-border-2"
          style={{
            resize: "none",
          }}
        ></textarea>
        <div className="relative w-full h-fit flex">
          <div className="relative w-full flex h-12 flex-row gap-2 justify-between items-center">
            {commentQuote && !commentQuote?.post && (
              <div
                className="cursor-pixel w-10 h-full bg-black rounded-md text-white text-center flex items-center justify-center"
                onClick={() => setCommentQuote(undefined)}
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
            )}
            <div
              className={`relative w-full h-full pixel-border-2 text-black font-start text-center flex items-center justify-center ${
                !success && !postLoading && post?.trim() !== ""
                  ? "cursor-pixel"
                  : "opacity-70"
              }`}
              onClick={() =>
                !success &&
                !postLoading &&
                post?.trim() !== "" &&
                commentQuote?.type == "Comment"
                  ? handleComment()
                  : commentQuote?.type == "Quote"
                  ? handleQuote()
                  : handlePost()
              }
            >
              <div className="relative w-full h-full flex items-center justify-center">
                {success ? (
                  "Success"
                ) : postLoading ? (
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
                ) : postPage ? (
                  commentQuote?.type == "Comment" ? (
                    "Comment"
                  ) : (
                    "Quote"
                  )
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
      </div>
    </div>
  );
};

export default Post;
