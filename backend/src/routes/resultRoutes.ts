import { Router } from "express";
import {
  submitResult,
  updateResult,
  getPresidentialResults,
  getParliamentaryResults,
  getResultsByRegion,
} from "../controllers/resultController";
import { authenticateJWT, authorize } from "../middlewares/authMiddleware";
import { Role } from "@prisma/client";

const router = Router();

// Polling Officers only
router.post(
  "/",
  authenticateJWT,
  authorize([Role.POLLING_OFFICER]),
  submitResult
);
router.put(
  "/:id",
  authenticateJWT,
  authorize([Role.POLLING_OFFICER]),
  updateResult
);

// Public
router.get("/presidential", getPresidentialResults);
router.get("/parliamentary/:constituencyId", getParliamentaryResults);
router.get("/region/:region", getResultsByRegion);

export default router;
