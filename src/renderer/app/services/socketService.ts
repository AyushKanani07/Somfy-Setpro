// ~/services/socketService.ts
import { io, Socket } from "socket.io-client";
import { getApiBaseUrl } from "~/interceptor/interceptor";

// Create socket with autoConnect: false to prevent automatic connection
export let socket: Socket;

/**
 * Connects to the socket server if not already connected
 * Should be called after successful login
 * @returns boolean - true if connection initiated, false if already connected
 */
export const connectSocket = (): boolean => {
  if (socket && socket.connected) {
    console.info("Socket already connected:", socket.id);
    return false;
  }

  console.info("Initiating socket connection...");
  const url = getApiBaseUrl().replace(/\/+$/, "").replace(/\/api$/, "");
  socket = io(url, {
    path: "/socket.io",
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionDelay: 5000,
    reconnectionDelayMax: 10000,
    autoConnect: false, // Don't connect automatically - wait for login
  });
  socket.connect();
  return true;
};

/**
 * Disconnects from the socket server
 * Should be called on logout
 */
export const disconnectSocket = (): void => {
  if (socket && socket.connected) {
    console.info("Disconnecting socket...");
    socket.disconnect();
  }
};
