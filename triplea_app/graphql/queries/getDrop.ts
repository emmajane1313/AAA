import { aaaClient } from "@/lib/graph/client";
import { FetchResult, gql } from "@apollo/client";

const DROP = gql`
  query ($dropId: Int!) {
    collectionCreateds(where: { dropId: $dropId }) {
      collectionId
      artist
      uri
      tokens
      prices
      agents
      active
      amountSold
      amount
      metadata {
        image
        title
        description
      }
    }
  }
`;

export const getDrop = async (dropId: number): Promise<FetchResult | void> => {
  let timeoutId: NodeJS.Timeout | undefined;
  const queryPromise = aaaClient.query({
    query: DROP,
    variables: { dropId },
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
