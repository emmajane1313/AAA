import { aaaClient } from "@/lib/graph/client";
import { FetchResult, gql } from "@apollo/client";

const AGENT = gql`
  query ($AAAAgents_id: Int!) {
    agentCreateds(where: { AAAAgents_id: $AAAAgents_id }, first: 1) {
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
      owner
      activeCollectionIds {
        collectionId
        metadata {
          image
          title
        }
        artist
      }
      collectionIdsHistory {
        collectionId
        metadata {
          image
          title
        }
        artist
      }
      details {
        collectionId
        dailyFrequency
        instructions
      }
      blockNumber
      AAAAgents_id
      transactionHash
      uri
      wallets
    }
  }
`;

export const getAgent = async (
  AAAAgents_id: number
): Promise<FetchResult | void> => {
  let timeoutId: NodeJS.Timeout | undefined;
  const queryPromise = aaaClient.query({
    query: AGENT,
    variables: {
      AAAAgents_id,
    },
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
