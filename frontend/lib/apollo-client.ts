import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
// import { setContext } from '@apollo/client/link/context';


// HTTP connection to the GraphQL API
const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT, // Replace with your GraphQL endpoint
  credentials: 'same-origin', // Include credentials for same-origin requests
});

// Apollo Client instance
const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

export default client;


// Middleware to add authorization headers (if required)
// const authLink = setContext((_, { headers }) => {
//   const token = process.env.NEXT_PUBLIC_AUTH_TOKEN; 
//   return {
//     headers: {
//       ...headers,
//       authorization: token ? `Bearer ${token}` : '',
//     },
//   };
// });

// Apollo Client instance
// const client = new ApolloClient({
//   link: authLink.concat(httpLink),
//   cache: new InMemoryCache(),
// });

// export default client;
