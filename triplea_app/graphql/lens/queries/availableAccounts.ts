import {
  SessionClient,
  UnexpectedError,
  PublicClient,
  AccountsAvailableRequest,
  AccountsAvailableQuery,
  AccountManaged,
} from "@lens-protocol/client";

export const fetchAccountsAvailable = async (
  request: AccountsAvailableRequest,
  client: SessionClient | PublicClient
): Promise<AccountManaged[] | UnexpectedError> => {
  const result = await client.query(AccountsAvailableQuery, {
    request,
  });

  if (result.isOk()) {
    return result.value.items as AccountManaged[];
  }

  return result.error as UnexpectedError;
};
export default fetchAccountsAvailable;
