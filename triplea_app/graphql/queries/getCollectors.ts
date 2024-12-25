import { aaaClient } from "@/lib/graph/client";
import { FetchResult, gql } from "@apollo/client";

const COLLECTORS = gql`
  query ($collectionId: Int!) {
    orders(where: { collectionId: $collectionId }) {
      transactionHash
      buyer
      amount
      blockTimestamp
    }
  }
`;

export const getCollectors = async (
  collectionId: number
): Promise<FetchResult | void> => {
  let timeoutId: NodeJS.Timeout | undefined;
  const queryPromise = aaaClient.query({
    query: COLLECTORS,
    variables: { collectionId },
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
