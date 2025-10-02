// tests/integration/parties.test.ts
import request from "supertest";
import prisma from "../../../src/utils/prisma";
import app from "../../../src/app";

let adminToken: string;
let officerToken: string;

beforeAll(async () => {
  // ✅ Login with seeded users
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

describe("Parties API", () => {
  it("should fetch all parties", async () => {
    const res = await request(app)
      .get("/api/parties")
      .set("Authorization", `Bearer ${officerToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty("name");
      expect(res.body[0]).toHaveProperty("abbreviation");
    }
  });

  it("should allow admin to create a new party", async () => {
    const res = await request(app)
      .post("/api/parties")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Test Party",
        abbreviation: "TP",
        color: "#123456",
        logoUrl: "https://example.com/logo.png",
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.name).toBe("Test Party");
  });

  it("should forbid officer from creating a new party", async () => {
    const res = await request(app)
      .post("/api/parties")
      .set("Authorization", `Bearer ${officerToken}`)
      .send({
        name: "Forbidden Party",
        abbreviation: "FP",
        color: "#654321",
      });

    expect(res.status).toBe(403);
  });
});
