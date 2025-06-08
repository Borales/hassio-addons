import {
  OutputCategory as OpCategory,
  Field as OpField,
  URL as OpURL
} from '@1password/op-js';
import { PrismaClient } from '@prisma/client';
import { pagination } from 'prisma-extension-pagination';

export type {
  Setting as AppSetting,
  Secret as HaSecret,
  Item as OpItem,
  Vault as OpVault
} from '@prisma/client';

const db_url = process.env.OP_DB_URL || '';

export type PrismaType = typeof prisma;

export const prisma = new PrismaClient({ datasources: { db: { url: db_url } } })
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
