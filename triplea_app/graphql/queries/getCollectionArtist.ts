import { aaaClient } from "@/lib/graph/client";
import { FetchResult, gql } from "@apollo/client";

const COLLECTION_ARTIST = gql`
  query ($collectionId: Int!) {
    collectionCreateds(
      where: { collectionId: $collectionId }
      first: 1
      orderDirection: desc
      orderBy: blockTimestamp
    ) {
      artist
      tokens
      metadata {
        image
        title
      }
    }
  }
`;

export const getCollectionArtist = async (
  collectionId: number
): Promise<FetchResult | void> => {
  let timeoutId: NodeJS.Timeout | undefined;
  const queryPromise = aaaClient.query({
    query: COLLECTION_ARTIST,
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
