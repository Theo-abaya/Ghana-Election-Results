-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'POLLING_OFFICER', 'VIEWER');

-- CreateEnum
CREATE TYPE "public"."CandidateType" AS ENUM ('PRESIDENTIAL', 'PARLIAMENTARY');

-- CreateEnum
CREATE TYPE "public"."Region" AS ENUM ('GREATER_ACCRA', 'ASHANTI', 'NORTHERN', 'WESTERN', 'EASTERN', 'CENTRAL', 'VOLTA', 'UPPER_EAST', 'UPPER_WEST', 'SAVANNAH', 'BONO', 'BONO_EAST', 'AHAFO', 'WESTERN_NORTH', 'OTI', 'NORTH_EAST');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'POLLING_OFFICER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Party" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "logoUrl" TEXT,

    CONSTRAINT "Party_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Candidate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."CandidateType" NOT NULL,
    "constituencyId" TEXT,
    "partyId" TEXT NOT NULL,

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Constituency" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "region" "public"."Region" NOT NULL,

    CONSTRAINT "Constituency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PollingStation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "location" TEXT,
    "constituencyId" TEXT NOT NULL,

    CONSTRAINT "PollingStation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Result" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "pollingStationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "votes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Result_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Party_name_key" ON "public"."Party"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Party_abbreviation_key" ON "public"."Party"("abbreviation");

-- CreateIndex
CREATE UNIQUE INDEX "Constituency_name_key" ON "public"."Constituency"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PollingStation_code_key" ON "public"."PollingStation"("code");

-- AddForeignKey
ALTER TABLE "public"."Candidate" ADD CONSTRAINT "Candidate_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "public"."Party"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Candidate" ADD CONSTRAINT "Candidate_constituencyId_fkey" FOREIGN KEY ("constituencyId") REFERENCES "public"."Constituency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PollingStation" ADD CONSTRAINT "PollingStation_constituencyId_fkey" FOREIGN KEY ("constituencyId") REFERENCES "public"."Constituency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Result" ADD CONSTRAINT "Result_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "public"."Candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Result" ADD CONSTRAINT "Result_pollingStationId_fkey" FOREIGN KEY ("pollingStationId") REFERENCES "public"."PollingStation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Result" ADD CONSTRAINT "Result_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
