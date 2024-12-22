import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const aaaLink = new HttpLink({
  uri: `https://api.studio.thegraph.com/query/37770/triplea/version/latest`,
});

export const aaaClient = new ApolloClient({
  link: aaaLink,
  cache: new InMemoryCache(),
});
