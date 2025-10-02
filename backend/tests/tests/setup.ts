// tests/setup.ts
import prisma from "../../src/utils/prisma";
import bcrypt from "bcryptjs";

beforeAll(async () => {
  // Clean database
  await prisma.auditLog.deleteMany();
  await prisma.result.deleteMany();
  await prisma.pollingStation.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.constituency.deleteMany();
  await prisma.party.deleteMany();
  await prisma.user.deleteMany();

  // Seed essential parties
  await prisma.party.createMany({
    data: [
      { name: "New Patriotic Party", abbreviation: "NPP", color: "#0000FF" },
      {
        name: "National Democratic Congress",
        abbreviation: "NDC",
        color: "#008000",
      },
    ],
    skipDuplicates: true,
  });

  // Seed test users
  const hashedAdmin = await bcrypt.hash("admin123", 10);
  await prisma.user.create({
    data: {
      email: "admin@example.com",
      password: hashedAdmin,
      role: "ADMIN",
    },
  });

  const hashedOfficer = await bcrypt.hash("officer123", 10);
  await prisma.user.create({
    data: {
      email: "officer@example.com",
      password: hashedOfficer,
      role: "POLLING_OFFICER",
    },
  });
});

beforeEach(async () => {
  // Clean domain-specific tables before each test run
  await prisma.auditLog.deleteMany();
  await prisma.result.deleteMany();
  await prisma.pollingStation.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.constituency.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
