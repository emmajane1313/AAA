import { aaaClient } from "@/lib/graph/client";
import { FetchResult, gql } from "@apollo/client";

const SALES = gql`
  query ($artist: String!) {
    orders(
      where: { collection_: { artist_contains: $artist } }
      orderDirection: desc
      orderBy: blockTimestamp
    ) {
      id
      totalPrice
      token
      mintedTokenIds
      transactionHash
      collectionId
      collection {
        metadata {
          image
          title
        }
        id
        artist
      }
      buyer
      amount
      blockTimestamp
    }
  }
`;

export const getSales = async (artist: string): Promise<FetchResult | void> => {
  let timeoutId: NodeJS.Timeout | undefined;
  const queryPromise = aaaClient.query({
    query: SALES,
    variables: { artist },
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
