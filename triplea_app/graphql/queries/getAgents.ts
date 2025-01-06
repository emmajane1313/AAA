import { aaaClient } from "@/lib/graph/client";
import { FetchResult, gql } from "@apollo/client";

const AGENTS = gql`
  query {
    agentCreateds(first: 50) {
      metadata {
        title
        description
        cover
        customInstructions
      }
      creator
      blockTimestamp
      balances {
        activeBalance
        totalBalance
        collectionId
        token
        dailyFrequency
        instructions
      }
      details {
        collectionId
        dailyFrequency
        instructions
      }
      activeCollectionIds {
        collectionId
        artist
        metadata {
          image
          title
        }
      }
      collectionIdsHistory {
        collectionId
        artist
        metadata {
          image
          title
        }
      }
      blockNumber
      AAAAgents_id
      transactionHash
      uri
      wallets
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
