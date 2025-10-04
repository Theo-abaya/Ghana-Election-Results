-- AlterTable
ALTER TABLE "PollingStation" ADD COLUMN     "registeredVoters" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "rejectedVotes" INTEGER NOT NULL DEFAULT 0;
