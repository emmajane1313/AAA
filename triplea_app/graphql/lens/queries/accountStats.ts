import {
  SessionClient,
  UnexpectedError,
  PublicClient,
  AccountStatsQuery,
  AccountStatsRequest,
  AccountStats,
} from "@lens-protocol/client";

export const fetchStats = async (
  request: AccountStatsRequest,
  client: SessionClient | PublicClient
): Promise<AccountStats | UnexpectedError> => {
  const result = await client.query(AccountStatsQuery, {
    request,
  });

  if (result.isOk()) {
    return result.value as AccountStats;
  }

  return result.error as UnexpectedError;
};
export default fetchStats;
