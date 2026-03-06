// ~/services/socketService.ts
import { io, Socket } from "socket.io-client";
import { API_BASE_URL } from "~/interceptor/interceptor";

const url = API_BASE_URL.replace(/\/+$/, "") // remove trailing slashes
  .replace(/\/api$/, ""); // remove final /api if present

// Create socket with autoConnect: false to prevent automatic connection
export const socket: Socket = io(url, {
  path: "/socket.io",
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionDelay: 5000,
  reconnectionDelayMax: 10000,
  autoConnect: false, // Don't connect automatically - wait for login
});

/**
 * Connects to the socket server if not already connected
 * Should be called after successful login
 * @returns boolean - true if connection initiated, false if already connected
 */
export const connectSocket = (): boolean => {
  if (socket.connected) {
    console.info("Socket already connected:", socket.id);
    return false;
  }

  console.info("Initiating socket connection...");
  socket.connect();
  return true;
};

/**
 * Disconnects from the socket server
 * Should be called on logout
 */
export const disconnectSocket = (): void => {
  if (socket.connected) {
    console.info("Disconnecting socket...");
    socket.disconnect();
  }
};
