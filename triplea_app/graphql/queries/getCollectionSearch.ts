import { aaaClient } from "@/lib/graph/client";
import { FetchResult, gql } from "@apollo/client";

const COLLECTIONS_SEARCH = gql`
  query ($target: String!) {
    collectionCreateds(
      where: {
        or: [
          { metadata_: { description_contains_nocase: $target } }
          { metadata_: { title_contains_nocase: $target } }
        ]
      }
    ) {
      artist
      collectionId
      metadata {
        image
        title
        description
      }
      uri
    }
  }
`;

export const getCollectionSearch = async (
  target: string
): Promise<FetchResult | void> => {
  let timeoutId: NodeJS.Timeout | undefined;
  const queryPromise = aaaClient.query({
    query: COLLECTIONS_SEARCH,
    variables: { target },
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
