import {
  AccountRequest,
  SessionClient,
  Account,
  UnexpectedError,
  AccountQuery,
  PublicClient,
} from "@lens-protocol/client";

export const fetchAccount = async (
  request: AccountRequest,
  client: SessionClient | PublicClient
): Promise<Account | UnexpectedError> => {
  const result = await client.query(AccountQuery, {
    request,
  });

  if (result.isOk()) {
    return result.value as Account;
  }

  return result.error as UnexpectedError;
};
export default fetchAccount;
