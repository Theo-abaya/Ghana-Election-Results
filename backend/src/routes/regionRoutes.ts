import { Router } from "express";
import {
  getAllRegions,
  getRegionByName, // You have this
  // createRegion // You need this if you want to create regions
} from "../controllers/regionController";
import { authenticateJWT, authorizeRole } from "../middlewares/authMiddleware";
import { Role } from "@prisma/client";

const router = Router();

// GET /api/regions - Get all regions (Public)
router.get("/", getAllRegions);

// GET /api/regions/:name - Get single region by name (Public)
router.get("/:name", getRegionByName); // Changed from :id to :name and using getRegionByName

export default router;
