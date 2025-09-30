import { PrismaClient, CandidateType, Region, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // --- Parties ---
  await prisma.party.createMany({
    data: [
      {
        name: "New Patriotic Party",
        abbreviation: "NPP",
        color: "#0000FF",
        logoUrl: null,
      },
      {
        name: "National Democratic Congress",
        abbreviation: "NDC",
        color: "#008000",
        logoUrl: null,
      },
      {
        name: "Convention People's Party",
        abbreviation: "CPP",
        color: "#FF0000",
        logoUrl: null,
      },
    ],
    skipDuplicates: true,
  });

  const npp = await prisma.party.findUnique({ where: { abbreviation: "NPP" } });
  const ndc = await prisma.party.findUnique({ where: { abbreviation: "NDC" } });
  const cpp = await prisma.party.findUnique({ where: { abbreviation: "CPP" } });

  // --- Constituencies ---
  const accra = await prisma.constituency.upsert({
    where: { name: "Accra Central" },
    update: {},
    create: {
      name: "Accra Central",
      region: Region.GREATER_ACCRA,
    },
  });

  const kumasi = await prisma.constituency.upsert({
    where: { name: "Kumasi South" },
    update: {},
    create: {
      name: "Kumasi South",
      region: Region.ASHANTI,
    },
  });

  // --- Presidential Candidates (3 parties) ---
  if (npp && ndc && cpp) {
    await prisma.candidate.createMany({
      data: [
        {
          name: "Nana Akufo-Addo",
          type: CandidateType.PRESIDENTIAL,
          partyId: npp.id,
        },
        {
          name: "John Mahama",
          type: CandidateType.PRESIDENTIAL,
          partyId: ndc.id,
        },
        {
          name: "Ivor Greenstreet",
          type: CandidateType.PRESIDENTIAL,
          partyId: cpp.id,
        },
      ],
      skipDuplicates: true,
    });
  }

  // --- Parliamentary Candidates for Accra (3) ---
  if (npp && ndc && cpp) {
    await prisma.candidate.createMany({
      data: [
        {
          name: "Ama NPP",
          type: CandidateType.PARLIAMENTARY,
          constituencyId: accra.id,
          partyId: npp.id,
        },
        {
          name: "Kojo NDC",
          type: CandidateType.PARLIAMENTARY,
          constituencyId: accra.id,
          partyId: ndc.id,
        },
        {
          name: "Akua CPP",
          type: CandidateType.PARLIAMENTARY,
          constituencyId: accra.id,
          partyId: cpp.id,
        },
      ],
      skipDuplicates: true,
    });
  }

  // --- Parliamentary Candidates for Kumasi (3) ---
  if (npp && ndc && cpp) {
    await prisma.candidate.createMany({
      data: [
        {
          name: "Kwame NPP",
          type: CandidateType.PARLIAMENTARY,
          constituencyId: kumasi.id,
          partyId: npp.id,
        },
        {
          name: "Yaw NDC",
          type: CandidateType.PARLIAMENTARY,
          constituencyId: kumasi.id,
          partyId: ndc.id,
        },
        {
          name: "Esi CPP",
          type: CandidateType.PARLIAMENTARY,
          constituencyId: kumasi.id,
          partyId: cpp.id,
        },
      ],
      skipDuplicates: true,
    });
  }

  // --- Polling Stations ---
  await prisma.pollingStation.createMany({
    data: [
      {
        name: "Accra High School",
        code: "PS-001",
        location: "Accra Central",
        constituencyId: accra.id,
      },
      {
        name: "Independence Square",
        code: "PS-002",
        location: "Accra Central",
        constituencyId: accra.id,
      },
      {
        name: "Kumasi Tech Institute",
        code: "PS-003",
        location: "Kumasi South",
        constituencyId: kumasi.id,
      },
      {
        name: "Kejetia Market",
        code: "PS-004",
        location: "Kumasi South",
        constituencyId: kumasi.id,
      },
    ],
    skipDuplicates: true,
  });

  // --- Admin User ---
  const hashedPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  console.log("✅ Seeding complete!");
}

main()
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
