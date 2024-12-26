import { FunctionComponent, JSX } from "react";
import { CommentsProps } from "../types/nft.types";

const Comments: FunctionComponent<CommentsProps> = ({
  comments,
}): JSX.Element => {
  return (
    <div className="relative w-full h-full overflow-y-scroll flex items-start justify-start">
      <div className="relative w-full h-fit flex flex-col items-start justify-start gap-3">
      {/* {comments?.map((activity, key) => {
        return <div key={key} className="relative w-full h-40 flex"></div>;
      })} */}
      </div>
    </div>
  );
};

export default Comments;
