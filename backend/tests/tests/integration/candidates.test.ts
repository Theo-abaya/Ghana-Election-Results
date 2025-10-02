import request from "supertest";
import prisma from "../../../src/utils/prisma";
import app from "../../../src/app";

let adminToken: string;
let officerToken: string;
let constituencyId: string;
let partyId: string;

beforeAll(async () => {
  // Login users
  const adminRes = await request(app).post("/api/auth/login").send({
    email: "admin@example.com",
    password: "admin123",
  });
  adminToken = adminRes.body.token;

  const officerRes = await request(app).post("/api/auth/login").send({
    email: "officer@example.com",
    password: "officer123",
  });
  officerToken = officerRes.body.token;

  // Get a party (created in setup.ts)
  const party = await prisma.party.findFirstOrThrow({
    where: { abbreviation: "NPP" },
  });
  partyId = party.id;
});

// Create constituency before EACH test that needs it
const createTestConstituency = async () => {
  const constituency = await prisma.constituency.create({
    data: {
      name: `Test Constituency ${Date.now()}`, // Unique name to avoid conflicts
      region: "GREATER_ACCRA",
    },
  });
  return constituency.id;
};

describe("Candidates API", () => {
  it("should allow admin to create a presidential candidate", async () => {
    const res = await request(app)
      .post("/api/candidates")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Jane Doe",
        partyId,
        type: "PRESIDENTIAL",
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.name).toBe("Jane Doe");
    expect(res.body.type).toBe("PRESIDENTIAL");
  });

  it("should allow admin to create a parliamentary candidate", async () => {
    // ✅ Create constituency RIGHT BEFORE the test
    constituencyId = await createTestConstituency();

    console.log("🧪 Testing parliamentary candidate creation");
    console.log("📦 constituencyId:", constituencyId);
    console.log("📦 partyId:", partyId);

    const res = await request(app)
      .post("/api/candidates")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Kwame Mensah",
        partyId,
        type: "PARLIAMENTARY",
        constituencyId: constituencyId,
      });

    console.log("📊 Response status:", res.status);
    console.log("📊 Response body:", JSON.stringify(res.body, null, 2));

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.type).toBe("PARLIAMENTARY");
    expect(res.body.constituencyId).toBe(constituencyId);
  });

  it("should forbid officer from creating candidates", async () => {
    const res = await request(app)
      .post("/api/candidates")
      .set("Authorization", `Bearer ${officerToken}`)
      .send({
        name: "Illegal Candidate",
        partyId,
        type: "PRESIDENTIAL",
      });

    expect(res.status).toBe(403);
  });

  it("should fetch all presidential candidates", async () => {
    // First create a presidential candidate to fetch
    await request(app)
      .post("/api/candidates")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Test Presidential Candidate",
        partyId,
        type: "PRESIDENTIAL",
      });

    const res = await request(app)
      .get("/api/candidates/presidential")
      .set("Authorization", `Bearer ${officerToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty("name");
      expect(res.body[0].type).toBe("PRESIDENTIAL");
    }
  });

  it("should fetch parliamentary candidates by constituency", async () => {
    // ✅ Create constituency and candidate right before the test
    constituencyId = await createTestConstituency();

    await request(app)
      .post("/api/candidates")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Test Parliamentary Candidate",
        partyId,
        type: "PARLIAMENTARY",
        constituencyId: constituencyId,
      });

    const res = await request(app)
      .get(`/api/candidates/parliamentary/${constituencyId}`)
      .set("Authorization", `Bearer ${officerToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty("name");
      expect(res.body[0].type).toBe("PARLIAMENTARY");
      expect(res.body[0].constituencyId).toBe(constituencyId);
    }
  });
});
