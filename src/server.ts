import "dotenv/config";
import express, { NextFunction, Router } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import router from "./routes/index";

// function logger(req: Request, res: Response, next: NextFunction) {
//   console.log(`${req.method} ${req.url}`);

//   next();
// }

const app = express();
app.use(helmet());

app.use(
  cors({
    // origin: "http://localhost:3000",
    origin: "*",
    credentials: true,
  }),
);

app.use(express.json());

app.use(cookieParser());

app.use(morgan("dev"));
// app.use(logger as any);

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
