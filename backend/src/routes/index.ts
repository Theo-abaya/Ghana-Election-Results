// src/routes/index.ts
import { Router } from "express";

// Controllers
import {
  createUser,
  getUsers,
  updateUser,
  deleteUser,
} from "../controllers/userController";
import {
  createCandidate,
  getPresidentialCandidates,
  getParliamentaryCandidates,
} from "../controllers/candidateController";
import {
  createConstituency,
  getConstituencies,
} from "../controllers/constituencyController";
import {
  createPollingStation,
  getPollingStations,
} from "../controllers/pollingStationController";
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

// Health check / root endpoint
router.get("/", (_req, res) => {
  res.json({ message: "Welcome to Ghana Elections API 🚀" });
});

//
// USERS (Admin only)
//
router.post("/users", authenticateJWT, authorizeRole([Role.ADMIN]), createUser);
router.get("/users", authenticateJWT, authorizeRole([Role.ADMIN]), getUsers);
router.put(
  "/users/:id",
  authenticateJWT,
  authorizeRole([Role.ADMIN]),
  updateUser
);
router.delete(
  "/users/:id",
  authenticateJWT,
  authorizeRole([Role.ADMIN]),
  deleteUser
);

//
// CANDIDATES
//
router.post(
  "/candidates",
  authenticateJWT,
  authorizeRole([Role.ADMIN]),
  createCandidate
);
router.get("/candidates/presidential", getPresidentialCandidates);
router.get(
  "/candidates/parliamentary/:constituencyId",
  getParliamentaryCandidates
);

//
// CONSTITUENCIES
//
router.post(
  "/constituencies",
  authenticateJWT,
  authorizeRole([Role.ADMIN]),
  createConstituency
);
router.get("/constituencies", getConstituencies);

//
// POLLING STATIONS
//
router.post(
  "/polling-stations",
  authenticateJWT,
  authorizeRole([Role.ADMIN]),
  createPollingStation
);
router.get("/polling-stations/:constituencyId", getPollingStations);

//
// RESULTS
//
router.post(
  "/results",
  authenticateJWT,
  authorizeRole([Role.POLLING_OFFICER]),
  submitResult
);
router.put(
  "/results/:id",
  authenticateJWT,
  authorizeRole([Role.POLLING_OFFICER]),
  updateResult
);

router.get("/results/presidential", getPresidentialResults);
router.get("/results/parliamentary/:constituencyId", getParliamentaryResults);
router.get("/results/region/:region", getResultsByRegion);

export default router;
