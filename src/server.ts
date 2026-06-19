import "dotenv/config";
import express, { Router } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { addWorkoutRoutes } from "./modules/workouts/workout.routes";
import createUserRoutes from "./modules/users/users.routes";

const app = express();
const router = Router();

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

app.get("/health", (_, res) => {
  res.json({
    success: true,
    message: "Backend running",
  });
});

console.log("Adding workout routes before router");
app.post("/api/workouts", addWorkoutRoutes);
console.log("Adding workout routes after router");

console.log("Adding user routes before router");
app.post("/api/users", createUserRoutes);
console.log("Adding user routes after router");

const PORT = process.env.PORT || 5001;

app
  .listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
  })
  .on("error", (err) => {
    console.error(err);
    process.exit(1);
  });
