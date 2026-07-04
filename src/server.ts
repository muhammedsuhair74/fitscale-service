import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import http from "http";

import "./lib/redis";
import router from "./routes/index";
import { performanceLogger } from "./middlewares/performance.middleware";
import { connectRabbit } from "./lib/rabbitmq";
import startConsumers from "./lib/consumers";
import { errorMiddleware } from "./middlewares/error.middleware";
import { initializeSocket } from "./socket";

const app = express();
app.use(helmet());

const clientOrigin = process.env.CLIENT_URL ?? "http://localhost:3000";

app.use(performanceLogger);
app.use(
  cors({
    origin: clientOrigin,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.get("/health", (_, res) => {
  res.json({
    success: true,
    message: "Backend running",
  });
});

app.use("/api", router);

const PORT = process.env.PORT || 5001;

async function startServer() {
  await connectRabbit();

  startConsumers();

  const server = http.createServer(app);
  initializeSocket(server);

  server.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error(err);
  process.exit(1);
});

app.use(errorMiddleware);
