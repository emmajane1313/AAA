import {
  SessionClient,
  UnexpectedError,
  ChallengeRequest,
  ChallengeMutation,
  AuthenticationChallenge,
  UnauthenticatedError,
} from "@lens-protocol/client";

const challenge = async (
  request: ChallengeRequest,
  sessionClient: SessionClient
): Promise<AuthenticationChallenge | UnexpectedError | UnauthenticatedError> => {
  const result = await sessionClient.mutation(ChallengeMutation, {
    request,
  });

  if (result.isOk()) {
    return result.value;
  }

  return result.error;
};

export default challenge;
