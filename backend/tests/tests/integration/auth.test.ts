import request from "supertest";
import app from "../../../src/app";
import { createTestUser } from "../helpers/testData";
import { generateTestToken, getAuthHeader } from "../helpers/auth";
import { Role } from "@prisma/client";

describe("Auth Endpoints", () => {
  describe("POST /api/auth/login", () => {
    it("should login with correct credentials", async () => {
      const user = await createTestUser();

      const response = await request(app).post("/api/auth/login").send({
        email: user.email,
        password: "password123",
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token");
      expect(response.body.user.id).toBe(user.id);
    });

    it("should reject incorrect password", async () => {
      const user = await createTestUser();

      const response = await request(app).post("/api/auth/login").send({
        email: user.email,
        password: "wrongpassword",
      });

      expect(response.status).toBe(401);
    });

    it("should reject non-existent user", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "nonexistent@example.com",
        password: "password123",
      });

      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/auth/me", () => {
    it("should return current user with valid token", async () => {
      const user = await createTestUser();
      const token = generateTestToken(user.id, user.email, user.role);

      const response = await request(app)
        .get("/api/auth/me")
        .set(getAuthHeader(token));

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(user.id);
      expect(response.body.email).toBe(user.email);
    });

    it("should reject request without token", async () => {
      const response = await request(app).get("/api/auth/me");
      expect(response.status).toBe(401);
    });
  });
});
