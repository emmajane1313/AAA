import {
  SessionClient,
  UnexpectedError,
  CreateAccountWithUsernameResult,
  UnauthenticatedError,
  CreateAccountWithUsernameRequest,
  CreateAccountWithUsernameMutation,
} from "@lens-protocol/client";

const createAccount = async (
  request: CreateAccountWithUsernameRequest,
  sessionClient: SessionClient
): Promise<
  CreateAccountWithUsernameResult | UnexpectedError | UnauthenticatedError
> => {
  const result = await sessionClient.mutation(
    CreateAccountWithUsernameMutation,
    {
      request,
    }
  );

  if (result.isOk()) {
    return result.value;
  }

  return result.error;
};

export default createAccount;
