import { Server, Socket } from "socket.io";
import { getUserRoom } from "../utils/socket";

export function registerSocketHandlers(io: Server) {
  io.on("connection", (socket: Socket) => {
    socket.join(getUserRoom(socket.user.id));
    console.log(`✅ user ${socket.user.id} connected: ${socket.id}`);

    socket.on("disconnect", () => {
      console.log(`❌ user ${socket.user.id} disconnected: ${socket.id}`);
    });
  });
}
