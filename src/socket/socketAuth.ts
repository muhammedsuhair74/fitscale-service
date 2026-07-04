// src/socket/socketAuth.ts

import { Socket } from "socket.io";
import { parse } from "cookie";
import { verifyAccessToken } from "../utils/jwt";
import { AuthenticatedUser } from "../types/auth";

export function socketAuth(socket: Socket, next: (err?: Error) => void) {
  const unauthorized = () => next(new Error("Unauthorized"));
  try {
    const cookieHeader = socket.handshake.headers.cookie;

    if (!cookieHeader) {
      return unauthorized();
    }

    const cookies = parse(cookieHeader);

    const accessToken = cookies.accessToken;

    if (!accessToken) {
      return unauthorized();
    }

    const payload = verifyAccessToken(accessToken);

    socket.user = {
      id: payload.userId,
      role: payload.role,
    } as AuthenticatedUser;

    next();
  } catch {
    return unauthorized();
  }
}
