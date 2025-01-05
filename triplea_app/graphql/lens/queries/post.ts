import {
    SessionClient,
    UnexpectedError,
    PublicClient,
    PostRequest,
    PostQuery,
  } from "@lens-protocol/client";
  
  export const fetchPost = async (
    request: PostRequest,
    client: SessionClient | PublicClient
  ): Promise<any | UnexpectedError> => {
    const result = await client.query(PostQuery, {
      request,
    });
  
    if (result.isOk()) {
      return result.value;
    }
  
    return result.error as UnexpectedError;
  };
  export default fetchPost;
  