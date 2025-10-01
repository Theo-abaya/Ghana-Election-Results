// src/routes/resultRoutes.ts
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

// ✅ Polling Officer only: submit & update results
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

// ✅ Public (anyone can view)
router.get("/presidential", getPresidentialResults);
router.get("/parliamentary/:constituencyId", getParliamentaryResults);
router.get("/region/:region", getResultsByRegion);

export default router;
