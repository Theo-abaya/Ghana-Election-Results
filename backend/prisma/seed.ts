import { PrismaClient, CandidateType, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

// Helper: Random votes between min and max
const randomVotes = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

async function main() {
  console.log("🌱 Starting complete database seeding...\n");

  // 1. Clean existing data
  await prisma.result.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.pollingStation.deleteMany();
  await prisma.constituency.deleteMany();
  await prisma.party.deleteMany();
  await prisma.user.deleteMany();

  // 2. Load JSON data
  console.log("📦 Loading data from JSON files...");
  const partiesData = JSON.parse(
    fs.readFileSync(path.join(__dirname, "data/parties.json"), "utf-8")
  );
  const constituenciesData = JSON.parse(
    fs.readFileSync(path.join(__dirname, "data/constituencies.json"), "utf-8")
  );

  // 3. Create Parties from JSON
  console.log("Creating parties...");
  const createdParties = [];
  for (const partyData of partiesData) {
    const party = await prisma.party.upsert({
      where: { abbreviation: partyData.abbreviation },
      update: {},
      create: partyData,
    });
    createdParties.push(party);
  }

  console.log(`✅ Created ${createdParties.length} parties`);

  // Get NPP, NDC, CPP for candidates
  const npp = createdParties.find((p) => p.abbreviation === "NPP")!;
  const ndc = createdParties.find((p) => p.abbreviation === "NDC")!;
  const cpp = createdParties.find((p) => p.abbreviation === "CPP")!;

  // 4. Create Constituencies from JSON
  console.log("Creating constituencies...");
  const createdConstituencies = [];
  for (const constituencyData of constituenciesData) {
    const constituency = await prisma.constituency.upsert({
      where: { name: constituencyData.name },
      update: {},
      create: constituencyData,
    });
    createdConstituencies.push(constituency);
  }
  console.log(`✅ Created ${createdConstituencies.length} constituencies`);

  // Get first two constituencies for demo data
  const accra = createdConstituencies[0];
  const kumasi =
    createdConstituencies.find((c) => c.name.includes("Kumasi")) ||
    createdConstituencies[1];

  // 5. Create Presidential Candidates
  console.log("Creating presidential candidates...");
  const bawumia = await prisma.candidate.create({
    data: {
      name: "Mahamudu Bawumia",
      type: CandidateType.PRESIDENTIAL,
      partyId: npp.id,
    },
  });

  const mahama = await prisma.candidate.create({
    data: {
      name: "John Dramani Mahama",
      type: CandidateType.PRESIDENTIAL,
      partyId: ndc.id,
    },
  });

  const cppCandidate = await prisma.candidate.create({
    data: {
      name: "Nana Akosua Frimpomaa Sarpong-Kumankumah",
      type: CandidateType.PRESIDENTIAL,
      partyId: cpp.id,
    },
  });

  // 6. Create Parliamentary Candidates
  console.log("Creating parliamentary candidates...");
  await prisma.candidate.createMany({
    data: [
      {
        name: "Ama Mensah",
        type: CandidateType.PARLIAMENTARY,
        constituencyId: accra.id,
        partyId: npp.id,
      },
      {
        name: "Kojo Asante",
        type: CandidateType.PARLIAMENTARY,
        constituencyId: accra.id,
        partyId: ndc.id,
      },
      {
        name: "Kwame Owusu",
        type: CandidateType.PARLIAMENTARY,
        constituencyId: kumasi.id,
        partyId: npp.id,
      },
      {
        name: "Yaw Mensah",
        type: CandidateType.PARLIAMENTARY,
        constituencyId: kumasi.id,
        partyId: ndc.id,
      },
    ],
  });

  // 7. Create Polling Stations
  console.log("Creating polling stations...");
  const stations = [
    await prisma.pollingStation.create({
      data: {
        name: "Accra High School",
        code: "GA-ACC-001",
        location: "Ring Road",
        constituencyId: accra.id,
      },
    }),
    await prisma.pollingStation.create({
      data: {
        name: "Independence Square",
        code: "GA-ACC-002",
        location: "Osu",
        constituencyId: accra.id,
      },
    }),
    await prisma.pollingStation.create({
      data: {
        name: "Makola Market",
        code: "GA-ACC-003",
        location: "Central Accra",
        constituencyId: accra.id,
      },
    }),
    await prisma.pollingStation.create({
      data: {
        name: "Kumasi Central Mosque",
        code: "AS-KUM-001",
        location: "Adum",
        constituencyId: kumasi.id,
      },
    }),
    await prisma.pollingStation.create({
      data: {
        name: "Kumasi Technical University",
        code: "AS-KUM-002",
        location: "Tech Junction",
        constituencyId: kumasi.id,
      },
    }),
  ];

  // 8. Create Users
  console.log("Creating users...");
  const admin = await prisma.user.create({
    data: {
      email: "admin@electionhub.com",
      password: await bcrypt.hash("Admin@123", 10),
      role: Role.ADMIN,
    },
  });

  const officer = await prisma.user.create({
    data: {
      email: "officer@electionhub.com",
      password: await bcrypt.hash("Officer@123", 10),
      role: Role.POLLING_OFFICER,
    },
  });

  // 9. Generate Realistic Results
  console.log("Generating vote results...");
  const presidentialCandidates = [bawumia, mahama, cppCandidate];

  for (const station of stations) {
    for (const candidate of presidentialCandidates) {
      let votes;

      // NPP stronger in Kumasi, NDC stronger in Accra (realistic)
      if (station.constituencyId === kumasi.id) {
        votes =
          candidate.partyId === npp.id
            ? randomVotes(180, 250)
            : candidate.partyId === ndc.id
            ? randomVotes(100, 150)
            : randomVotes(10, 30);
      } else {
        votes =
          candidate.partyId === ndc.id
            ? randomVotes(180, 250)
            : candidate.partyId === npp.id
            ? randomVotes(100, 150)
            : randomVotes(10, 30);
      }

      await prisma.result.create({
        data: {
          candidateId: candidate.id,
          pollingStationId: station.id,
          votes,
          userId: officer.id,
        },
      });
    }
  }

  console.log("\n✅ Seeding complete!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔐 Login Credentials:");
  console.log("   Admin:  admin@electionhub.com / Admin@123");
  console.log("   Officer: officer@electionhub.com / Officer@123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📊 Data Created:");
  console.log(`   Parties: ${createdParties.length}`);
  console.log(`   Constituencies: ${createdConstituencies.length}`);
  console.log("   Polling Stations: 5");
  console.log("   Presidential Candidates: 3");
  console.log("   Parliamentary Candidates: 4");
  console.log("   Results: " + stations.length * 3 + " records");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
