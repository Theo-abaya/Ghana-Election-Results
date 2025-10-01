import { generateToken } from "../../../src/utils/jwt";
import { Role } from "@prisma/client";

export function generateTestToken(
  userId: string,
  email: string,
  role: Role
): string {
  return generateToken(userId, email, role);
}

export function getAuthHeader(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}
