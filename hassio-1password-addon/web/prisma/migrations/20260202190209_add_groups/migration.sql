-- CreateTable
CREATE TABLE "groups" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "secret_groups" (
    "secret_id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "added_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("secret_id", "group_id"),
    CONSTRAINT "secret_groups_secret_id_fkey" FOREIGN KEY ("secret_id") REFERENCES "ha_secrets" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "secret_groups_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "groups_name_key" ON "groups"("name");
