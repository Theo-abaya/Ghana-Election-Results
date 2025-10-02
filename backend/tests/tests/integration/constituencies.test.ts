// tests/integration/constituencies.test.ts
import request from "supertest";
import prisma from "../../../src/utils/prisma";
import app from "../../../src/app";

let adminToken: string;
let officerToken: string;

beforeAll(async () => {
  // ✅ Login using seeded users from setup.ts
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

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Constituencies API", () => {
  it("should fetch all constituencies", async () => {
    const res = await request(app)
      .get("/api/constituencies")
      .set("Authorization", `Bearer ${officerToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty("name");
      expect(res.body[0]).toHaveProperty("region");
    }
  });

  it("should allow admin to create a new constituency", async () => {
    const res = await request(app)
      .post("/api/constituencies")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Test Constituency",
        region: "GREATER_ACCRA",
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.name).toBe("Test Constituency");
  });

  it("should forbid officer from creating a new constituency", async () => {
    const res = await request(app)
      .post("/api/constituencies")
      .set("Authorization", `Bearer ${officerToken}`)
      .send({
        name: "Forbidden Constituency",
        region: "ASHANTI",
      });

    expect(res.status).toBe(403);
  });
});
