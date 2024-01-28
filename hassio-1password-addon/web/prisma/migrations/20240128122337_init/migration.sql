-- CreateTable
CREATE TABLE "ha_secrets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reference" TEXT,
    "item_id" TEXT,
    CONSTRAINT "ha_secrets_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "op_items" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "op_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "vault_id" TEXT,
    "category" TEXT NOT NULL,
    "additional_information" TEXT,
    "created_at" DATETIME NOT NULL,
    "updated_at" DATETIME NOT NULL,
    "urls" TEXT,
    "fields" TEXT,
    CONSTRAINT "op_items_vault_id_fkey" FOREIGN KEY ("vault_id") REFERENCES "op_vaults" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "op_vaults" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
