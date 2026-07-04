import "socket.io";
import { AuthenticatedUser } from "./auth";

declare module "socket.io" {
  interface Socket {
    user: AuthenticatedUser;
  }
}
