import { Server } from "socket.io";
import { getUserRoom } from "../utils/socket";
import { Socket } from "socket.io";

export function registerSocketHandlers(io: Server) {
  io.on("connection", (socket: Socket) => {
    socket.join(getUserRoom(socket.data.user.id));
    console.log(`✅ user ${socket.data.user.id} connected: ${socket.id}`);

    socket.on("disconnect", () => {
      console.log(`❌ user ${socket.data.user.id} disconnected: ${socket.id}`);
    });
  });
}
