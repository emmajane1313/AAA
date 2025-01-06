import {
  SessionClient,
  RevokeAuthenticationRequest,
  RevokeAuthenticationMutation,
} from "@lens-protocol/client";

const revoke = async (
  request: RevokeAuthenticationRequest,
  sessionClient: SessionClient
): Promise<boolean> => {
  const result = await sessionClient.mutation(RevokeAuthenticationMutation, {
    request,
  });


  if (result.isOk()) {
    return true;
  }

  return false;
};

export default revoke;
