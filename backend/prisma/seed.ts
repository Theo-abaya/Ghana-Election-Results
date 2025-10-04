import { PrismaClient, CandidateType, Region, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

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

  // 2. Create Parties
  console.log("Creating parties...");
  const npp = await prisma.party.create({
    data: {
      name: "New Patriotic Party",
      abbreviation: "NPP",
      color: "#0066CC",
    },
  });

  const ndc = await prisma.party.create({
    data: {
      name: "National Democratic Congress",
      abbreviation: "NDC",
      color: "#006B3F",
    },
  });

  const cpp = await prisma.party.create({
    data: {
      name: "Convention People's Party",
      abbreviation: "CPP",
      color: "#DC2626",
    },
  });

  // 3. Create Constituencies
  console.log("Creating constituencies...");
  const accra = await prisma.constituency.create({
    data: { name: "Accra Central", region: Region.GREATER_ACCRA },
  });

  const kumasi = await prisma.constituency.create({
    data: { name: "Kumasi South", region: Region.ASHANTI },
  });

  // 4. Create Presidential Candidates
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

  // 5. Create Parliamentary Candidates
  console.log("Creating parliamentary candidates...");
  // Accra Central
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
    ],
  });

  // Kumasi South
  await prisma.candidate.createMany({
    data: [
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

  // 6. Create Polling Stations
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

  // 7. Create Users
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

  // 8. Generate Realistic Results
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
  console.log("   Parties: 3 (NPP, NDC, CPP)");
  console.log("   Constituencies: 2");
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
