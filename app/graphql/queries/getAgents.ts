import { aaaClient } from "@/lib/graph/client";
import { FetchResult, gql } from "@apollo/client";

const AGENTS = gql`
  query {
    agentCreateds {
      metadata {
        name
        description
        cover
      }
      creator
      blockTimestamp
      balances {
        activeBalance
        totalBalance
        collectionId
        token
      }
      blockNumber
      AAAAgents_id
      transactionHash
      uri
      wallet
    }
  }
`;

export const getAgents = async (): Promise<FetchResult | void> => {
  let timeoutId: NodeJS.Timeout | undefined;
  const queryPromise = aaaClient.query({
    query: AGENTS,

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
