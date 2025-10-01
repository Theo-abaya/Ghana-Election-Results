import { PrismaClient, CandidateType, Region, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // --- Parties ---
  console.log("📊 Creating parties...");
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

  const partyCount = await prisma.party.count();
  console.log(`✅ Created ${partyCount} parties`);

  // --- Constituencies ---
  console.log("🗺️  Creating constituencies...");
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

  const constituencyCount = await prisma.constituency.count();
  console.log(`✅ Created ${constituencyCount} constituencies`);

  // --- Presidential Candidates (3 parties) ---
  console.log("🎯 Creating presidential candidates...");
  if (npp && ndc && cpp) {
    await prisma.candidate.createMany({
      data: [
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
      ],
      skipDuplicates: true,
    });
  }

  const presidentialCount = await prisma.candidate.count({
    where: { type: CandidateType.PRESIDENTIAL },
  });
  console.log(`✅ Created ${presidentialCount} presidential candidates`);

  // --- Parliamentary Candidates for Accra (3) ---
  console.log("🏛️  Creating parliamentary candidates...");
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

  const parliamentaryCount = await prisma.candidate.count({
    where: { type: CandidateType.PARLIAMENTARY },
  });
  console.log(`✅ Created ${parliamentaryCount} parliamentary candidates`);

  // --- Polling Stations ---
  console.log("🗳️  Creating polling stations...");
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

  const pollingStationCount = await prisma.pollingStation.count();
  console.log(`✅ Created ${pollingStationCount} polling stations`);

  // --- Admin User ---
  console.log("👤 Creating admin user...");
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

  const userCount = await prisma.user.count();
  console.log(`✅ Created ${userCount} user(s)`);

  console.log("\n🎉 Seeding complete!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📈 Summary:");
  console.log(`   Parties: ${partyCount}`);
  console.log(`   Constituencies: ${constituencyCount}`);
  console.log(`   Presidential Candidates: ${presidentialCount}`);
  console.log(`   Parliamentary Candidates: ${parliamentaryCount}`);
  console.log(`   Polling Stations: ${pollingStationCount}`);
  console.log(`   Users: ${userCount}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\n🔐 Admin Credentials:");
  console.log("   Email: admin@example.com");
  console.log("   Password: admin123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .catch(async (e) => {
    console.error("❌ Seeding failed:");
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
