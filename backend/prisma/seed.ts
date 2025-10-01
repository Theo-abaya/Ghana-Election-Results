// prisma/seed.ts
import { PrismaClient, CandidateType, Region, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const useRandomVotes = process.argv.includes("--random");

// Helper: generate random votes
const randomVotes = (min = 50, max = 500) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

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
    create: { name: "Accra Central", region: Region.GREATER_ACCRA },
  });

  const kumasi = await prisma.constituency.upsert({
    where: { name: "Kumasi South" },
    update: {},
    create: { name: "Kumasi South", region: Region.ASHANTI },
  });

  // --- Candidates ---
  if (npp && ndc && cpp) {
    await prisma.candidate.createMany({
      data: [
        // Presidential
        {
          name: "Mahamudu Bawumia",
          type: CandidateType.PRESIDENTIAL,
          partyId: npp.id,
        },
        {
          name: "John Dramani Mahama",
          type: CandidateType.PRESIDENTIAL,
          partyId: ndc.id,
        },
        {
          name: "Nana Akosua Frimpomaa Sarpong-Kumankumah",
          type: CandidateType.PRESIDENTIAL,
          partyId: cpp.id,
        },

        // Parliamentary (Accra)
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

        // Parliamentary (Kumasi)
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
  const station1 = await prisma.pollingStation.upsert({
    where: { code: "PS-001" },
    update: {},
    create: {
      name: "Accra High School",
      code: "PS-001",
      location: "Accra Central",
      constituencyId: accra.id,
    },
  });

  const station2 = await prisma.pollingStation.upsert({
    where: { code: "PS-002" },
    update: {},
    create: {
      name: "Independence Square",
      code: "PS-002",
      location: "Accra Central",
      constituencyId: accra.id,
    },
  });

  // --- Users ---
  const adminPassword = await bcrypt.hash("admin123", 10);
  const officerPassword = await bcrypt.hash("officer123", 10);
  const viewerPassword = await bcrypt.hash("viewer123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  const pollingOfficer = await prisma.user.upsert({
    where: { email: "officer@example.com" },
    update: {},
    create: {
      email: "officer@example.com",
      password: officerPassword,
      role: Role.POLLING_OFFICER,
    },
  });

  const viewer = await prisma.user.upsert({
    where: { email: "viewer@example.com" },
    update: {},
    create: {
      email: "viewer@example.com",
      password: viewerPassword,
      role: Role.VIEWER,
    },
  });

  // --- Seed Example Results ---
  const mahama = await prisma.candidate.findFirst({
    where: { name: "John Dramani Mahama" },
  });
  const bawumia = await prisma.candidate.findFirst({
    where: { name: "Mahamudu Bawumia" },
  });

  if (mahama && bawumia) {
    await prisma.result.createMany({
      data: [
        {
          candidateId: mahama.id,
          pollingStationId: station1.id,
          votes: useRandomVotes ? randomVotes() : 120,
          userId: pollingOfficer.id,
        },
        {
          candidateId: bawumia.id,
          pollingStationId: station1.id,
          votes: useRandomVotes ? randomVotes() : 150,
          userId: pollingOfficer.id,
        },
      ],
      skipDuplicates: true,
    });
  }

  console.log("🎉 Seeding complete!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔐 Admin: admin@example.com / admin123");
  console.log("🗳️ Officer: officer@example.com / officer123");
  console.log("👀 Viewer: viewer@example.com / viewer123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .catch(async (e) => {
    console.error("❌ Seeding failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
