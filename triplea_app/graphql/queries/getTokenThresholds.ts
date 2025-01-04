import { aaaClient } from "@/lib/graph/client";
import { FetchResult, gql } from "@apollo/client";

const TOKEN_THRESHOLDS = gql`
  query {
    tokenThresholdSets {
     token
     threshold
     rent
    }
  }
`;

export const getTokenThresholds = async (): Promise<FetchResult | void> => {
  let timeoutId: NodeJS.Timeout | undefined;
  const queryPromise = aaaClient.query({
    query: TOKEN_THRESHOLDS,
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
