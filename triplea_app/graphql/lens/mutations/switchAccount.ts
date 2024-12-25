import {
  SessionClient,
  UnexpectedError,
  UnauthenticatedError,
  SwitchAccountRequest,
  SwitchAccountMutation,
  SwitchAccountResult,
} from "@lens-protocol/client";

const switchAccount = async (
  request: SwitchAccountRequest,
  sessionClient: SessionClient
): Promise<SwitchAccountResult | UnexpectedError | UnauthenticatedError> => {
  const result = await sessionClient.mutation(SwitchAccountMutation, {
    request,
  });

  if (result.isOk()) {
    return result.value;
  }

  return result.error;
};

export default switchAccount;
