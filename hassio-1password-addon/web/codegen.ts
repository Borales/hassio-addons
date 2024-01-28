import type { CodegenConfig } from '@graphql-codegen/cli';
import { DateTimeResolver } from 'graphql-scalars';

const scalars = {
  DateTime: DateTimeResolver.extensions.codegenScalarType
};

const config: CodegenConfig = {
  overwrite: true,
  schema: './src/schema.graphql',
  hooks: {
    afterOneFileWrite: ['prettier --write']
  },
  generates: {
    'src/gql/': {
      preset: 'client',
      config: { scalars }
    },
    'src/gql/operations.ts': {
      documents: './src/gql/**/*.graphql',
      config: {
        scalars,
        exposeQueryKeys: true,
        legacyMode: false,
        reactQueryVersion: 5,
        fetcher: {
          endpoint: '"/api/graphql"',
          fetchParams: {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        }
      },
      plugins: ['typescript', 'typescript-operations', 'typescript-react-query']
    }
  }
};

export default config;
