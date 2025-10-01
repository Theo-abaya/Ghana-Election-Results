import prisma from "../../../src/utils/prisma";
import bcrypt from "bcryptjs";
import { Role, CandidateType, Region } from "@prisma/client";

export async function createTestUser(role: Role = Role.POLLING_OFFICER) {
  const hashedPassword = await bcrypt.hash("password123", 10);
  return prisma.user.create({
    data: {
      email: `test-${Date.now()}@example.com`,
      password: hashedPassword,
      role,
    },
  });
}

export async function createTestParty() {
  return prisma.party.create({
    data: {
      name: `Test Party ${Date.now()}`,
      abbreviation: `TP${Date.now()}`,
      color: "#FF0000",
    },
  });
}

export async function createTestConstituency() {
  return prisma.constituency.create({
    data: {
      name: `Test Constituency ${Date.now()}`,
      region: Region.GREATER_ACCRA,
    },
  });
}

export async function createTestCandidate(
  partyId: string,
  type: CandidateType = CandidateType.PRESIDENTIAL,
  constituencyId?: string
) {
  return prisma.candidate.create({
    data: {
      name: `Test Candidate ${Date.now()}`,
      type,
      partyId,
      constituencyId,
    },
  });
}

export async function createTestPollingStation(constituencyId: string) {
  return prisma.pollingStation.create({
    data: {
      name: `Test Station ${Date.now()}`,
      code: `TS-${Date.now()}`,
      location: "Test Location",
      constituencyId,
    },
  });
}
