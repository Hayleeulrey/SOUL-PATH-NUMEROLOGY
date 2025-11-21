-- CreateTable
CREATE TABLE "family_members" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
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

-- CreateTable
CREATE TABLE "relationships" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "personId" TEXT NOT NULL,
    "relatedId" TEXT NOT NULL,
    "relationshipType" TEXT NOT NULL,
    "notes" TEXT,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "relationships_personId_fkey" FOREIGN KEY ("personId") REFERENCES "family_members" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "relationships_relatedId_fkey" FOREIGN KEY ("relatedId") REFERENCES "family_members" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "photos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "familyMemberId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "caption" TEXT,
    "tags" TEXT,
    "isProfile" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "photos_familyMemberId_fkey" FOREIGN KEY ("familyMemberId") REFERENCES "family_members" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "audio_files" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "familyMemberId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "duration" REAL,
    "transcription" TEXT,
    "summary" TEXT,
    "tags" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "audio_files_familyMemberId_fkey" FOREIGN KEY ("familyMemberId") REFERENCES "family_members" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "familyMemberId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "content" TEXT,
    "tags" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "documents_familyMemberId_fkey" FOREIGN KEY ("familyMemberId") REFERENCES "family_members" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "stories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "familyMemberId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'OTHER',
    "summary" TEXT,
    "tags" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "isAI" BOOLEAN NOT NULL DEFAULT false,
    "sourceType" TEXT,
    "sourceId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "stories_familyMemberId_fkey" FOREIGN KEY ("familyMemberId") REFERENCES "family_members" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "biography_prompts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "biography_responses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "familyMemberId" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "answer" TEXT,
    "audioFileId" TEXT,
    "photoId" TEXT,
    "documentId" TEXT,
    "relatedTo" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "tags" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "biography_responses_familyMemberId_fkey" FOREIGN KEY ("familyMemberId") REFERENCES "family_members" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "biography_responses_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "biography_prompts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "biography_responses_audioFileId_fkey" FOREIGN KEY ("audioFileId") REFERENCES "audio_files" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "biography_responses_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "photos" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "biography_responses_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "numerology_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "familyMemberId" TEXT NOT NULL,
    "soulNumber" TEXT NOT NULL,
    "outerPersonality" TEXT NOT NULL,
    "destinyNumber" TEXT NOT NULL,
    "lifeLesson" TEXT NOT NULL,
    "calculationDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "numerology_profiles_familyMemberId_fkey" FOREIGN KEY ("familyMemberId") REFERENCES "family_members" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ai_conversations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "familyMemberId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Sage',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ai_conversations_familyMemberId_fkey" FOREIGN KEY ("familyMemberId") REFERENCES "family_members" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ai_messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ai_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "ai_conversations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "relationships_personId_relatedId_relationshipType_key" ON "relationships"("personId", "relatedId", "relationshipType");

-- CreateIndex
CREATE UNIQUE INDEX "numerology_profiles_familyMemberId_key" ON "numerology_profiles"("familyMemberId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
