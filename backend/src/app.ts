
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";
import queryRoutes from "./routes/query.routes.js";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: env.FRONTEND_URL,
  }),
);

app.use(express.json({ limit: "10kb" }));

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/query", queryRoutes);

app.use((_req, res) => {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: "The requested endpoint does not exist.",
    },
  });
});

export default app;
