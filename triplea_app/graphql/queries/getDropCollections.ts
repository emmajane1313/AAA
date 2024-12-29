import { aaaClient } from "@/lib/graph/client";
import { FetchResult, gql } from "@apollo/client";

const DROP_COLLECTIONS = gql`
  query ($dropId: Int!, $skip: Int!) {
    dropCreateds(where: { dropId: $dropId }, skip: $skip, first: 20) {
      metadata {
        title
        cover
      }
      collections {
        collectionId
        metadata {
          cover
        }
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

export const getDropCollections = async (
  dropId: number,
  skip: number
): Promise<FetchResult | void> => {
  let timeoutId: NodeJS.Timeout | undefined;
  const queryPromise = aaaClient.query({
    query: DROP_COLLECTIONS,
    variables: { dropId, skip },
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
