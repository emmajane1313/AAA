import {
  SessionClient,
  UnexpectedError,
  UnauthenticatedError,
  CreateUnfollowRequest,
  UnfollowResult,
  UnfollowMutation,
} from "@lens-protocol/client";

const unfollow = async (
  request: CreateUnfollowRequest,
  sessionClient: SessionClient
): Promise<UnfollowResult | UnexpectedError | UnauthenticatedError> => {
  const result = await sessionClient.mutation(UnfollowMutation, {
    request,
  });

  if (result.isOk()) {
    return result.value;
  }

  return result.error;
};

export default unfollow;
