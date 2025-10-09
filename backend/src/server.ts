import dotenv from "dotenv";
dotenv.config();
import { createServer } from "http";
import app from "./app";
import { initializeWebSocket } from "./websocket/sockets";

const PORT = process.env.PORT || 5000;

// Validate required environment variables
if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET missing — check your .env file!");
  process.exit(1);
}

// Create HTTP server
const server = createServer(app);

// Initialize WebSocket with error handling
try {
  initializeWebSocket(server);
  console.log("✅ WebSocket server initialized successfully");
} catch (error) {
  console.error("❌ Failed to initialize WebSocket:", error);
  // Continue without WebSocket if it's not critical
}

// Server error handling
server.on("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} is already in use`);
  } else {
    console.error("❌ Server error:", error);
  }
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM received - shutting down gracefully");
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("🛑 SIGINT received - shutting down gracefully");
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket server initialized`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
});
