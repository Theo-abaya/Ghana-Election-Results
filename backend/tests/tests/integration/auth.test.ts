// tests/integration/auth.test.ts
import request from "supertest";
import bcrypt from "bcryptjs";
import prisma from "../../../src/utils/prisma";
import app from "../../../src/app"; // your Express app

const admin = { email: "admin@example.com", password: "admin123" };

describe("Auth endpoints", () => {
  beforeAll(async () => {
    // Ensure the user exists or is updated
    const hashed = await bcrypt.hash(admin.password, 10);
    await prisma.user.upsert({
      where: { email: admin.email },
      update: { password: hashed, role: "ADMIN" },
      create: { email: admin.email, password: hashed, role: "ADMIN" },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: admin.email } });
    await prisma.$disconnect();
  });

  it("should login successfully", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: admin.email, password: admin.password });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(typeof res.body.token).toBe("string");
  });

  it("should reject invalid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: admin.email, password: "wrongpassword" });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message");
  });
});
