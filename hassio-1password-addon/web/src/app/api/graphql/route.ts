/* eslint-disable react-hooks/rules-of-hooks */

import {
  MutationSyncArgs,
  MutationSyncOpSecretArgs,
  QueryOpSecretArgs,
  QueryOpVaultArgs
} from '@/gql/graphql';
import { onePasswordService } from '@/service/1password.service';
import { useDeferStream } from '@graphql-yoga/plugin-defer-stream';
import { DateTimeResolver } from 'graphql-scalars';
import { createSchema, createYoga } from 'graphql-yoga';
import { readFileSync } from 'node:fs';
import path from 'node:path';

export const dynamic = 'force-dynamic';

const typeDefs = readFileSync(path.resolve('./src/schema.graphql'), 'utf8');

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
