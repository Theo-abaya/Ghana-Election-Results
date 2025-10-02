import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes"; // This should be your main router
import authRoutes from "./routes/authRoutes";
import errorHandler from "./middlewares/errorHandler";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes); // Auth routes first
app.use("/api", routes); // All other API routes

// Global error handler
app.use(errorHandler);

export default app;
