import { Router } from "express";
import {
  submitResult,
  updateResult,
  getPresidentialResults,
  getParliamentaryResults,
  getResultsByRegion,
} from "../controllers/resultController";
import { authenticateJWT, authorizeRole } from "../middlewares/authMiddleware";
import { Role } from "@prisma/client";

const router = Router();

// Officers only
router.post(
  "/",
  authenticateJWT,
  authorizeRole([Role.POLLING_OFFICER]),
  submitResult
);
router.put(
  "/:id",
  authenticateJWT,
  authorizeRole([Role.POLLING_OFFICER]),
  updateResult
);

// Public
router.get("/presidential", getPresidentialResults);
router.get("/parliamentary/:constituencyId", getParliamentaryResults);
router.get("/region/:region", getResultsByRegion);

export default router;
