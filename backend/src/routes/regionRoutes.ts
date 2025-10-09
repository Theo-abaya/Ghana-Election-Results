import { Router } from "express";
import {
  getAllRegions,
  getRegionByName,
} from "../controllers/regionController";

const router = Router();

// GET /api/regions - Get all regions (Public)
router.get("/", getAllRegions);

// GET /api/regions/:name - Get single region by name (Public)
router.get("/:name", getRegionByName);

export default router;
