-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_family_members" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "lastName" TEXT NOT NULL,
    "maidenName" TEXT,
    "birthDate" DATETIME,
    "deathDate" DATETIME,
    "birthCity" TEXT,
    "birthState" TEXT,
    "birthCountry" TEXT,
    "deathCity" TEXT,
    "deathState" TEXT,
    "deathCountry" TEXT,
    "bio" TEXT,
    "notes" TEXT,
    "isAlive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "family_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_family_members" ("bio", "birthCity", "birthCountry", "birthDate", "birthState", "createdAt", "deathCity", "deathCountry", "deathDate", "deathState", "firstName", "id", "isAlive", "lastName", "maidenName", "middleName", "notes", "updatedAt", "userId") SELECT "bio", "birthCity", "birthCountry", "birthDate", "birthState", "createdAt", "deathCity", "deathCountry", "deathDate", "deathState", "firstName", "id", "isAlive", "lastName", "maidenName", "middleName", "notes", "updatedAt", "userId" FROM "family_members";
DROP TABLE "family_members";
ALTER TABLE "new_family_members" RENAME TO "family_members";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
