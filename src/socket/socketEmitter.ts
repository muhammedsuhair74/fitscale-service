import { Server } from "socket.io";
import { getUserRoom } from "../utils/socket";
import { RABBITMQ_QUEUE_NAMES } from "../lib/constants";

let io: Server;

export function setSocketServer(server: Server) {
  io = server;
}

function getSocketServer() {
  if (!io) {
    throw new Error("Socket server not initialized");
  }

  return io;
}

export function emitNotification(
  userId: string,
  notification: {
    title: string;
    message: string;
    type: string;
  },
) {
  getSocketServer()
    .to(getUserRoom(userId))
    .emit(RABBITMQ_QUEUE_NAMES.NOTIFICATIONS, notification);
}
