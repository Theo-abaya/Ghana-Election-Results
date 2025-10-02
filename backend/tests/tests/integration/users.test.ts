// tests/integration/users.test.ts
import request from "supertest";
import prisma from "../../../src/utils/prisma";
import app from "../../../src/app";

let adminToken: string;
let officerToken: string;

beforeAll(async () => {
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

describe("Users API", () => {
  it("should allow admin to fetch all users", async () => {
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty("email");
  });

  it("should forbid officer from fetching all users", async () => {
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${officerToken}`);

    expect(res.status).toBe(403);
  });

  it("should allow admin to create a new user", async () => {
    const res = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        email: "newuser@example.com",
        password: "password123",
        role: "VIEWER",
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.email).toBe("newuser@example.com");
  });

  it("should forbid officer from creating a new user", async () => {
    const res = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${officerToken}`)
      .send({
        email: "forbiddenuser@example.com",
        password: "password123",
        role: "VIEWER",
      });

    expect(res.status).toBe(403);
  });
});
