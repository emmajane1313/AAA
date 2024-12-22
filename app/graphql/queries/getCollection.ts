import { aaaClient } from "@/lib/graph/client";
import { FetchResult, gql } from "@apollo/client";

const COLLECTION = gql`
  query ($collection_id: Int!) {
    collectionCreateds(where: { collection_id: $collection_id }, first: 1) {
      id
      artist
      collectionId
      metadata {
        image
        title
        description
      }
      dropId
      amountSold
      amount
      agents
      tokenIds
      tokens
      transactionHash
      uri
      prices
      blockTimestamp
    }
  }
`;

export const getCollection = async (
  collection_id: number
): Promise<FetchResult | void> => {
  let timeoutId: NodeJS.Timeout | undefined;
  const queryPromise = aaaClient.query({
    query: COLLECTION,
    variables: { collection_id },
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