import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const initializeSocket = (token: string) => {
  if (!socket || !socket.connected) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8080", {
      withCredentials: true,
      transports: ["websocket"],
      auth: { token },
    });
  }
  return socket;
};

export const getSocket = (): Socket | null => socket;
