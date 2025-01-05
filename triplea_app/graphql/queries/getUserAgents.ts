import { aaaClient } from "@/lib/graph/client";
import { FetchResult, gql } from "@apollo/client";

const USER_AGENTS = gql`
  query($owner: String!) {
    agentCreateds( where: {owner: $owner }) {
      metadata {
        title
        description
        cover
        customInstructions
      }
      creator
      owner
      blockTimestamp
      balances {
        activeBalance
        totalBalance
        collectionId
        token
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

export const getUserAgents = async (
  owner: string
): Promise<FetchResult | void> => {
  let timeoutId: NodeJS.Timeout | undefined;
  const queryPromise = aaaClient.query({
    query: USER_AGENTS,
    variables: {
      owner,
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
