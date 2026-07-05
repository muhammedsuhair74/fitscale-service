import { Socket, DefaultEventsMap } from "socket.io";
import { SocketData } from "../types/socket-data";

export type AppSocket = Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  SocketData
>;
