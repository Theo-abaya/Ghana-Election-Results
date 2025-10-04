import { createServer } from "http";
import app from "./app";
import { initializeWebSocket } from "./websocket/sockets";

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = createServer(app);

// Initialize WebSocket
initializeWebSocket(server);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket server initialized`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
});
