import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import prisma from "../utils/prisma";
import { CandidateType } from "@prisma/client";

let io: Server;

export const initializeWebSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Join specific rooms for targeted updates
    socket.on("subscribe:presidential", () => {
      socket.join("presidential-results");
      console.log(`${socket.id} subscribed to presidential results`);
    });

    socket.on("subscribe:constituency", (constituencyId: string) => {
      socket.join(`constituency-${constituencyId}`);
      console.log(`${socket.id} subscribed to constituency ${constituencyId}`);
    });

    socket.on("subscribe:region", (region: string) => {
      socket.join(`region-${region}`);
      console.log(`${socket.id} subscribed to region ${region}`);
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  // Start polling for updates every 10 seconds
  startResultsPolling();

  return io;
};

// Broadcast when new result is submitted
export const broadcastNewResult = async (resultId: string) => {
  if (!io) return;

  try {
    const result = await prisma.result.findUnique({
      where: { id: resultId },
      include: {
        candidate: {
          include: { party: true, constituency: true },
        },
        pollingStation: {
          include: { constituency: true },
        },
      },
    });

    if (!result) return;

    // Broadcast to presidential results room
    if (result.candidate.type === CandidateType.PRESIDENTIAL) {
      const aggregated = await getPresidentialAggregation();
      io.to("presidential-results").emit("presidential:update", aggregated);
    }

    // Broadcast to constituency room
    if (result.candidate.constituencyId) {
      const constituencyResults = await getConstituencyResults(
        result.candidate.constituencyId
      );
      io.to(`constituency-${result.candidate.constituencyId}`).emit(
        "constituency:update",
        constituencyResults
      );
    }

    // Broadcast to region room
    if (result.pollingStation.constituency.region) {
      const regionResults = await getRegionResults(
        result.pollingStation.constituency.region
      );
      io.to(`region-${result.pollingStation.constituency.region}`).emit(
        "region:update",
        regionResults
      );
    }
  } catch (error) {
    console.error("Error broadcasting result:", error);
  }
};

// Poll for updates every 10 seconds
let pollingInterval: NodeJS.Timeout;

const startResultsPolling = () => {
  pollingInterval = setInterval(async () => {
    try {
      // Broadcast presidential updates
      const presidentialData = await getPresidentialAggregation();
      io.to("presidential-results").emit(
        "presidential:update",
        presidentialData
      );

      // You can add more polling logic here for constituencies and regions
    } catch (error) {
      console.error("Polling error:", error);
    }
  }, 10000); // Every 10 seconds
};

export const stopResultsPolling = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
  }
};

// Helper functions to get aggregated data
async function getPresidentialAggregation() {
  const candidates = await prisma.candidate.findMany({
    where: { type: CandidateType.PRESIDENTIAL },
    include: { party: true },
  });

  const results = await Promise.all(
    candidates.map(async (candidate) => {
      const totalVotes = await prisma.result.aggregate({
        where: { candidateId: candidate.id },
        _sum: { votes: true },
      });

      return {
        ...candidate,
        votes: totalVotes._sum.votes || 0,
      };
    })
  );

  const totalVotes = results.reduce((sum, r) => sum + r.votes, 0);

  return {
    candidates: results
      .map((r) => ({
        ...r,
        percentage: totalVotes > 0 ? (r.votes / totalVotes) * 100 : 0,
      }))
      .sort((a, b) => b.votes - a.votes),
    totalVotes,
    lastUpdated: new Date(),
  };
}

async function getConstituencyResults(constituencyId: string) {
  const candidates = await prisma.candidate.findMany({
    where: {
      type: CandidateType.PARLIAMENTARY,
      constituencyId,
    },
    include: { party: true },
  });

  const results = await Promise.all(
    candidates.map(async (candidate) => {
      const totalVotes = await prisma.result.aggregate({
        where: {
          candidateId: candidate.id,
          pollingStation: { constituencyId },
        },
        _sum: { votes: true },
      });

      return {
        ...candidate,
        votes: totalVotes._sum.votes || 0,
      };
    })
  );

  const totalVotes = results.reduce((sum, r) => sum + r.votes, 0);

  return {
    constituencyId,
    candidates: results
      .map((r) => ({
        ...r,
        percentage: totalVotes > 0 ? (r.votes / totalVotes) * 100 : 0,
      }))
      .sort((a, b) => b.votes - a.votes),
    totalVotes,
    lastUpdated: new Date(),
  };
}

async function getRegionResults(region: string) {
  const constituencies = await prisma.constituency.findMany({
    where: { region: region as any },
  });

  const constituencyIds = constituencies.map((c) => c.id);

  const candidates = await prisma.candidate.findMany({
    where: { type: CandidateType.PRESIDENTIAL },
    include: { party: true },
  });

  const results = await Promise.all(
    candidates.map(async (candidate) => {
      const totalVotes = await prisma.result.aggregate({
        where: {
          candidateId: candidate.id,
          pollingStation: {
            constituencyId: { in: constituencyIds },
          },
        },
        _sum: { votes: true },
      });

      return {
        ...candidate,
        votes: totalVotes._sum.votes || 0,
      };
    })
  );

  const totalVotes = results.reduce((sum, r) => sum + r.votes, 0);

  return {
    region,
    candidates: results
      .map((r) => ({
        ...r,
        percentage: totalVotes > 0 ? (r.votes / totalVotes) * 100 : 0,
      }))
      .sort((a, b) => b.votes - a.votes),
    totalVotes,
    lastUpdated: new Date(),
  };
}

export const getIO = () => io;
