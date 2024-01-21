import {
  URL as OpURL,
  Field as OpField,
  OutputCategory as OpCategory,
} from "@1password/op-js";
import { Prisma, PrismaClient } from "@prisma/client";

export type {
  Item as OpItem,
  Secret as HaSecret,
  Vault as OpVault,
  Setting as AppSetting,
} from "@prisma/client";

const db_url = process.env.OP_DB_URL;

export type PrismaType = typeof prisma;

export const prisma = new PrismaClient({
  datasources: { db: { url: db_url } },
})
  .$extends({
    model: {
      $allModels: {
        async exists<T>(
          this: T,
          where: Prisma.Args<T, "findFirst">["where"]
        ): Promise<boolean> {
          const context = Prisma.getExtensionContext(this);
          const result = await (context as any).findFirst({ where });
          return result !== null;
        },
      },
    },
  })
  .$extends({
    result: {
      item: {
        category: {
          compute: (data) => data.category as OpCategory,
        },
        urls: {
          compute: ({ urls }) => (urls && (JSON.parse(urls) as OpURL[])) || [],
        },
        fields: {
          compute: ({ fields }) =>
            (fields && (JSON.parse(fields) as OpField[])) || [],
        },
      },
    },
  });
