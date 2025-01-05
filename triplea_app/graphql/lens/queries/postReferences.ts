import {
  SessionClient,
  UnexpectedError,
  PublicClient,
  PostReferencesRequest,
  PostReferencesQuery,
} from "@lens-protocol/client";

const fetchPostReferences = async (
  request: PostReferencesRequest,
  client: SessionClient | PublicClient
): Promise<any | UnexpectedError> => {
  const result = await client.query(PostReferencesQuery, {
    request,
  });

  if (result.isOk()) {
    return result.value;
  }

  return result.error as UnexpectedError;
};
export default fetchPostReferences;
