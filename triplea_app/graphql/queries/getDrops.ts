import { aaaClient } from "@/lib/graph/client";
import { FetchResult, gql } from "@apollo/client";

const DROPS = gql`
  query ($artist: String!) {
    dropCreateds(
      where: { artist_contains: $artist }
      orderDirection: desc
      orderBy: blockTimestamp
    ) {
      metadata {
        title
        cover
      }
      dropId
      collectionIds
      artist
      uri
      transactionHash
      blockTimestamp
    }
  }
`;

export const getDrops = async (artist: string): Promise<FetchResult | void> => {
  let timeoutId: NodeJS.Timeout | undefined;
  const queryPromise = aaaClient.query({
    query: DROPS,
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
