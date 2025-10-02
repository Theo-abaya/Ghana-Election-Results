import request from "supertest";
import prisma from "../../../src/utils/prisma";
import app from "../../../src/app";

let officerToken: string;

beforeAll(async () => {
  // Login officer
  const officerRes = await request(app).post("/api/auth/login").send({
    email: "officer@example.com",
    password: "officer123",
  });
  officerToken = officerRes.body.token;
});

afterAll(async () => {
  await prisma.$disconnect();
});

// Helper to create all test data for a single test
const createTestDataForResultSubmission = async () => {
  // Clean any existing results first
  await prisma.result.deleteMany();

  // Create fresh constituency
  const constituency = await prisma.constituency.create({
    data: {
      name: `Test Constituency ${Date.now()}`,
      region: "GREATER_ACCRA",
    },
  });

  // Create fresh polling station
  const pollingStation = await prisma.pollingStation.create({
    data: {
      name: `Test Polling Station ${Date.now()}`,
      code: `PS-${Date.now()}`,
      location: "Test Location",
      constituencyId: constituency.id,
    },
  });

  // Get a party
  const party = await prisma.party.findFirstOrThrow({
    where: { abbreviation: "NPP" },
  });

  // Create fresh candidates
  const presidentialCandidate = await prisma.candidate.create({
    data: {
      name: `Presidential Test ${Date.now()}`,
      type: "PRESIDENTIAL",
      partyId: party.id,
    },
  });

  const parliamentaryCandidate = await prisma.candidate.create({
    data: {
      name: `Parliamentary Test ${Date.now()}`,
      type: "PARLIAMENTARY",
      partyId: party.id,
      constituencyId: constituency.id,
    },
  });

  return {
    constituencyId: constituency.id,
    pollingStationId: pollingStation.id,
    presidentialCandidateId: presidentialCandidate.id,
    parliamentaryCandidateId: parliamentaryCandidate.id,
  };
};

describe("Results API", () => {
  it("should allow officer to submit results", async () => {
    const testData = await createTestDataForResultSubmission();

    const res = await request(app)
      .post("/api/results")
      .set("Authorization", `Bearer ${officerToken}`)
      .send({
        candidateId: testData.presidentialCandidateId,
        pollingStationId: testData.pollingStationId,
        votes: 120,
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.votes).toBe(120);
    expect(res.body.candidateId).toBe(testData.presidentialCandidateId);
    expect(res.body.pollingStationId).toBe(testData.pollingStationId);
  });

  it("should fetch presidential results (aggregation)", async () => {
    const testData = await createTestDataForResultSubmission();

    // Submit results
    await request(app)
      .post("/api/results")
      .set("Authorization", `Bearer ${officerToken}`)
      .send({
        candidateId: testData.presidentialCandidateId,
        pollingStationId: testData.pollingStationId,
        votes: 150,
      });

    const res = await request(app).get("/api/results/presidential");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("totalVotes");
    expect(res.body).toHaveProperty("results");
    expect(res.body).toHaveProperty("leadingCandidate");
    expect(Array.isArray(res.body.results)).toBe(true);
    expect(res.body.totalVotes).toBe(150);

    // Check results structure
    if (res.body.results.length > 0) {
      expect(res.body.results[0]).toHaveProperty("candidateId");
      expect(res.body.results[0]).toHaveProperty("candidateName");
      expect(res.body.results[0]).toHaveProperty("party");
      expect(res.body.results[0]).toHaveProperty("votes");
      expect(res.body.results[0]).toHaveProperty("percentage");
      expect(res.body.results[0].votes).toBe(150);
    }
  });

  it("should fetch parliamentary results for a constituency", async () => {
    const testData = await createTestDataForResultSubmission();

    // Submit parliamentary results
    await request(app)
      .post("/api/results")
      .set("Authorization", `Bearer ${officerToken}`)
      .send({
        candidateId: testData.parliamentaryCandidateId,
        pollingStationId: testData.pollingStationId,
        votes: 200,
      });

    const res = await request(app).get(
      `/api/results/parliamentary/${testData.constituencyId}`
    );

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("constituencyId");
    expect(res.body).toHaveProperty("totalVotes");
    expect(res.body).toHaveProperty("results");
    expect(res.body).toHaveProperty("leadingCandidate");
    expect(Array.isArray(res.body.results)).toBe(true);
    expect(res.body.totalVotes).toBe(200);
    expect(res.body.constituencyId).toBe(testData.constituencyId);

    if (res.body.results.length > 0) {
      expect(res.body.results[0]).toHaveProperty("candidateId");
      expect(res.body.results[0]).toHaveProperty("candidateName");
      expect(res.body.results[0]).toHaveProperty("party");
      expect(res.body.results[0]).toHaveProperty("votes");
      expect(res.body.results[0]).toHaveProperty("percentage");
      expect(res.body.results[0].votes).toBe(200);
    }
  });

  it("should fetch regional results", async () => {
    const testData = await createTestDataForResultSubmission();

    // Submit results
    await request(app)
      .post("/api/results")
      .set("Authorization", `Bearer ${officerToken}`)
      .send({
        candidateId: testData.presidentialCandidateId,
        pollingStationId: testData.pollingStationId,
        votes: 180,
      });

    const res = await request(app).get("/api/results/region/GREATER_ACCRA");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("region");
    expect(res.body).toHaveProperty("totalVotes");
    expect(res.body).toHaveProperty("results");
    expect(Array.isArray(res.body.results)).toBe(true);
    expect(res.body.region).toBe("GREATER_ACCRA");

    // Check structure of regional results
    if (res.body.results.length > 0) {
      expect(res.body.results[0]).toHaveProperty("candidateId");
      expect(res.body.results[0]).toHaveProperty("candidateName");
      expect(res.body.results[0]).toHaveProperty("party");
      expect(res.body.results[0]).toHaveProperty("votes");
      expect(res.body.results[0]).toHaveProperty("percentage");
    }
  });

  it("should forbid non-officer from submitting results", async () => {
    const testData = await createTestDataForResultSubmission();

    // Try to submit without authentication
    const res = await request(app).post("/api/results").send({
      candidateId: testData.presidentialCandidateId,
      pollingStationId: testData.pollingStationId,
      votes: 100,
    });

    expect(res.status).toBe(401);
  });

  it("should validate required fields when submitting results", async () => {
    const res = await request(app)
      .post("/api/results")
      .set("Authorization", `Bearer ${officerToken}`)
      .send({
        // Missing required fields
        votes: 100,
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
  });
});
