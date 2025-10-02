import request from "supertest";
import prisma from "../../../src/utils/prisma";
import app from "../../../src/app";

let adminToken: string;
let officerToken: string;

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
});

// No need for beforeAll constituency creation anymore

afterAll(async () => {
  await prisma.$disconnect();
});

const createTestConstituency = async () => {
  const constituency = await prisma.constituency.create({
    data: {
      name: `Test Constituency ${Date.now()}`, // Unique name
      region: "GREATER_ACCRA",
    },
  });
  return constituency.id;
};

describe("Polling Stations API", () => {
  it("should fetch all polling stations", async () => {
    const constituencyId = await createTestConstituency();

    // Create a polling station to fetch
    await prisma.pollingStation.create({
      data: {
        name: "Test Station",
        code: `PS-TEST-${Date.now()}`, // Unique code
        location: "Test Location",
        constituencyId: constituencyId,
      },
    });

    const res = await request(app)
      .get("/api/polling-stations")
      .set("Authorization", `Bearer ${officerToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("should allow admin to create a polling station", async () => {
    const constituencyId = await createTestConstituency();

    const uniqueCode = `PS-TEST-${Date.now()}`;
    const res = await request(app)
      .post("/api/polling-stations")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "New Test Station",
        code: uniqueCode,
        location: "Test Location",
        constituencyId: constituencyId,
      });

    console.log("📊 Create polling station response:", {
      status: res.status,
      body: res.body,
    });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe("New Test Station");
    expect(res.body.code).toBe(uniqueCode);
  });

  it("should forbid officer from creating a polling station", async () => {
    const constituencyId = await createTestConstituency();

    const res = await request(app)
      .post("/api/polling-stations")
      .set("Authorization", `Bearer ${officerToken}`)
      .send({
        name: "Forbidden Station",
        code: `PS-FORBID-${Date.now()}`,
        location: "Nowhere",
        constituencyId: constituencyId,
      });

    expect(res.status).toBe(403);
  });
});
