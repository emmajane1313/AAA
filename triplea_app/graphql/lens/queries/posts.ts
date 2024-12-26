import {
  SessionClient,
  UnexpectedError,
  PublicClient,
  PostsRequest,
  PostsQuery,
  Post,
} from "@lens-protocol/client";

export const fetchPosts = async (
  request: PostsRequest,
  client: SessionClient | PublicClient
): Promise<any | UnexpectedError> => {
  const result = await client.query(PostsQuery, {
    request,
  });

  if (result.isOk()) {
    return result.value;
  }

  return result.error as UnexpectedError;
};
export default fetchPosts;
