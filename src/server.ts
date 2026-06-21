import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import "./lib/redis";
import router from "./routes/index";

const app = express();
app.use(helmet());

const clientOrigin = process.env.CLIENT_URL ?? "http://localhost:3000";

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

app
  .listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
  })
  .on("error", (err) => {
    console.error(err);
    process.exit(1);
  });
