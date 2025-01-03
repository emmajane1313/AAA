import { aaaClient } from "@/lib/graph/client";
import { FetchResult, gql } from "@apollo/client";

const COLLECTIONS = gql`
  query ($skip: Int!) {
    collectionCreateds(
      first: 40
      skip: $skip
      orderDirection: desc
      orderBy: blockTimestamp
    ) {
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

export const getCollections = async (
  skip: number
): Promise<FetchResult | void> => {
  let timeoutId: NodeJS.Timeout | undefined;
  const queryPromise = aaaClient.query({
    query: COLLECTIONS,
    variables: { skip },
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
