import { onePasswordService } from '@/service/1password.service';
import { useDeferStream } from '@graphql-yoga/plugin-defer-stream';
import { DateTimeResolver, DateTimeTypeDefinition } from 'graphql-scalars';
import { createSchema, createYoga } from 'graphql-yoga';

export const dynamic = 'force-dynamic';

const typeDefs = /* GraphQL */ `
  ${DateTimeTypeDefinition}

`;

const resolvers = {
  DateTime: DateTimeResolver,
  Query: {
  },
  Mutation: {
  }
};

const schema = createSchema({ typeDefs, resolvers });

const { handleRequest } = createYoga({
  schema,
  graphqlEndpoint: '/api/graphql',
  // Yoga needs to know how to create a valid Next response
  fetchAPI: { Response },
  plugins: [useDeferStream()]
});

export {
  handleRequest as GET,
  handleRequest as OPTIONS,
  handleRequest as POST
};
