import prisma from "../../src/utils/prisma";

beforeEach(async () => {
  await prisma.auditLog.deleteMany();
  await prisma.result.deleteMany();
  await prisma.pollingStation.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.constituency.deleteMany();
  await prisma.party.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
