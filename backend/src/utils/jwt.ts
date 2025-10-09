import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";

if (!process.env.JWT_SECRET) {
  throw new Error("❌ JWT_SECRET is not set in environment variables");
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "1d";

export const generateToken = (id: string, email: string, role: Role) => {
  return jwt.sign({ id, email, role }, JWT_SECRET as string, {
    expiresIn: JWT_EXPIRES_IN,
  });
};
