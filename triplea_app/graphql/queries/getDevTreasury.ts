import { aaaClient } from "@/lib/graph/client";
import { FetchResult, gql } from "@apollo/client";

const DEV_TREASURY = gql`
  query {
    devTreasuryAddeds(first: 1) {
      amount
      token
    }
  }
`;

export const getDevTreasury = async (): Promise<FetchResult | void> => {
  let timeoutId: NodeJS.Timeout | undefined;
  const queryPromise = aaaClient.query({
    query: DEV_TREASURY,
    fetchPolicy: "no-cache",
    errorPolicy: "all",
  });

  const timeoutPromise = new Promise((resolve) => {
    timeoutId = setTimeout(() => {
      resolve({ timedOut: true });
    }, 60000);
  });

  const result: any = await Promise.race([queryPromise, timeoutPromise]);

  timeoutId && clearTimeout(timeoutId);

  if (result.timedOut) {
    return;
  } else {
    return result;
  }
};
