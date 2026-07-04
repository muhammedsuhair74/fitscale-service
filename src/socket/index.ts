import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { registerSocketHandlers } from "./socketHandler";
import { socketAuth } from "./socketAuth";
import { setSocketServer } from "./sockerEmitter";

export function initializeSocket(server: HttpServer) {
  const io: Server = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  });

  setSocketServer(io);

  io.use(socketAuth);

  registerSocketHandlers(io);

  return io;
}
