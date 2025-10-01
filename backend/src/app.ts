// src/app.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes";
import authRoutes from "./routes/authRoutes";

// Middleware
import errorHandler from "./middlewares/errorHandler";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes); // Auth routes first
app.use("/api", routes); // Feature routes (with RBAC)

// Global error handler
app.use(errorHandler);

export default app;
