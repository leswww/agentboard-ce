-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "localPath" TEXT,
    "repositoryUrl" TEXT,
    "techStack" TEXT,
    "packageManager" TEXT NOT NULL DEFAULT 'npm',
    "startCommand" TEXT,
    "testCommand" TEXT,
    "buildCommand" TEXT,
    "deployCommand" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastOpenedAt" DATETIME
);

-- CreateTable
CREATE TABLE "CommandTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "command" TEXT NOT NULL,
    "workingDirectory" TEXT,
    "projectId" TEXT,
    "category" TEXT NOT NULL DEFAULT 'custom',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CommandTemplate_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CommandRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT,
    "commandTemplateId" TEXT,
    "command" TEXT NOT NULL,
    "workingDirectory" TEXT,
    "output" TEXT,
    "exitCode" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" DATETIME,
    "durationMs" INTEGER,
    CONSTRAINT "CommandRun_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CommandRun_commandTemplateId_fkey" FOREIGN KEY ("commandTemplateId") REFERENCES "CommandTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AgentProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'Custom',
    "recommendedTool" TEXT NOT NULL DEFAULT 'Generic',
    "systemPrompt" TEXT NOT NULL,
    "inputTemplate" TEXT,
    "outputFormat" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "IssueDraft" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT,
    "issueTitle" TEXT NOT NULL,
    "issueBody" TEXT,
    "environment" TEXT,
    "expectedBehavior" TEXT,
    "actualBehavior" TEXT,
    "screenshots" TEXT,
    "additionalNotes" TEXT,
    "draftType" TEXT,
    "draftPriority" TEXT,
    "draftSeverity" TEXT,
    "affectedArea" TEXT,
    "reproductionSteps" TEXT,
    "missingInformation" TEXT,
    "suggestedLabels" TEXT,
    "suggestedReply" TEXT,
    "suggestedAction" TEXT,
    "markdownOutput" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PrReviewDraft" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT,
    "prTitle" TEXT NOT NULL,
    "prSummary" TEXT,
    "changedFilesSummary" TEXT,
    "testResults" TEXT,
    "riskNotes" TEXT,
    "documentationImpact" TEXT,
    "reviewSummary" TEXT,
    "riskLevel" TEXT,
    "requiredChanges" TEXT,
    "suggestedApproval" TEXT,
    "suggestedChanges" TEXT,
    "markdownOutput" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ReleaseNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT,
    "version" TEXT NOT NULL,
    "releaseDate" TEXT,
    "summary" TEXT,
    "added" TEXT,
    "changed" TEXT,
    "fixed" TEXT,
    "security" TEXT,
    "deprecated" TEXT,
    "removed" TEXT,
    "breakingChanges" TEXT,
    "migrationGuide" TEXT,
    "contributors" TEXT,
    "markdownOutput" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "AgentProfile_slug_key" ON "AgentProfile"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Setting_key_key" ON "Setting"("key");
