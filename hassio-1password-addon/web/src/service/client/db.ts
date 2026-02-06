import {
  OutputCategory as OpCategory,
  Field as OpField,
  URL as OpURL
} from '@1password/op-js';
import { PrismaClient } from '@prisma-generated/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { pagination } from 'prisma-extension-pagination';
import { env } from 'prisma/config';

export type {
  Secret as HaSecret,
  Item as OpItem
} from '@prisma-generated/client';

const adapter = new PrismaBetterSqlite3({
  url: env('OP_DB_URL') || ''
});

export type PrismaType = typeof prisma;

export const prisma = new PrismaClient({ adapter })
  .$extends(pagination())
  .$extends({
    result: {
      item: {
        category: {
          compute: (data) => data.category as OpCategory
        },
        urls: {
          compute: ({ urls }) => (urls && (JSON.parse(urls) as OpURL[])) || []
        },
        fields: {
          compute: ({ fields }) =>
            (fields && (JSON.parse(fields) as OpField[])) || []
        }
      }
    }
  });
