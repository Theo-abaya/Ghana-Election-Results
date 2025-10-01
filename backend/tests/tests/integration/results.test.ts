import request from "supertest";
import app from "../../../src/app";
import {
  createTestUser,
  createTestParty,
  createTestConstituency,
  createTestCandidate,
  createTestPollingStation,
} from "../helpers/testData";
import { generateTestToken, getAuthHeader } from "../helpers/auth";
import { Role, CandidateType } from "@prisma/client";

describe("Results Endpoints", () => {
  let token: string;
  let candidateId: string;
  let pollingStationId: string;

  beforeEach(async () => {
    const user = await createTestUser(Role.POLLING_OFFICER);
    token = generateTestToken(user.id, user.email, user.role);

    const party = await createTestParty();
    const constituency = await createTestConstituency();
    const candidate = await createTestCandidate(party.id);
    const station = await createTestPollingStation(constituency.id);

    candidateId = candidate.id;
    pollingStationId = station.id;
  });

  describe("POST /api/results", () => {
    it("should submit a result with valid data", async () => {
      const response = await request(app)
        .post("/api/results")
        .set(getAuthHeader(token))
        .send({
          candidateId,
          pollingStationId,
          votes: 250,
        });

      expect(response.status).toBe(201);
      expect(response.body.votes).toBe(250);
    });

    it("should reject submission without authentication", async () => {
      const response = await request(app).post("/api/results").send({
        candidateId,
        pollingStationId,
        votes: 250,
      });

      expect(response.status).toBe(401);
    });

    it("should reject missing required fields", async () => {
      const response = await request(app)
        .post("/api/results")
        .set(getAuthHeader(token))
        .send({
          candidateId,
        });

      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/results/presidential", () => {
    it("should return aggregated presidential results", async () => {
      const response = await request(app).get("/api/results/presidential");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("totalVotes");
      expect(response.body).toHaveProperty("results");
    });
  });
});
