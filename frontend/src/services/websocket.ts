import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const connectWebSocket = () => {
  const wsUrl = import.meta.env.VITE_WS_URL || "http://localhost:5000";

  socket = io(wsUrl, {
    transports: ["websocket"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  socket.on("connect", () => {
    console.log("✅ WebSocket connected:", socket?.id);
  });

  socket.on("disconnect", () => {
    console.log("❌ WebSocket disconnected");
  });

  socket.on("connect_error", (error) => {
    console.error("WebSocket connection error:", error);
  });

  return socket;
};

export const disconnectWebSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Subscribe to presidential results
export const subscribeToPresidentialResults = (
  callback: (data: any) => void
) => {
  if (!socket) {
    console.error("WebSocket not connected");
    return;
  }

  socket.emit("subscribe:presidential");
  socket.on("presidential:update", callback);
};

// Subscribe to constituency results
export const subscribeToConstituency = (
  constituencyId: string,
  callback: (data: any) => void
) => {
  if (!socket) {
    console.error("WebSocket not connected");
    return;
  }

  socket.emit("subscribe:constituency", constituencyId);
  socket.on("constituency:update", callback);
};

// Subscribe to regional results
export const subscribeToRegion = (
  region: string,
  callback: (data: any) => void
) => {
  if (!socket) {
    console.error("WebSocket not connected");
    return;
  }

  socket.emit("subscribe:region", region);
  socket.on("region:update", callback);
};

// Unsubscribe from all events
export const unsubscribeAll = () => {
  if (socket) {
    socket.off("presidential:update");
    socket.off("constituency:update");
    socket.off("region:update");
  }
};

export const getSocket = () => socket;
