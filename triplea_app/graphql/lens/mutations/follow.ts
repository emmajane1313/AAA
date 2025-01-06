import {
  SessionClient,
  FollowMutation,
  CreateFollowRequest,
  FollowResult,
  UnexpectedError,
  UnauthenticatedError,
} from "@lens-protocol/client";

const follow = async (
  request: CreateFollowRequest,
  sessionClient: SessionClient
): Promise<FollowResult | UnexpectedError | UnauthenticatedError> => {
  const result = await sessionClient.mutation(FollowMutation, {
    request,
  });

  if (result.isOk()) {
    return result.value;
  }

  return result.error;
};

export default follow;
