import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import api from "./routes/index.js";
import { notFound, errorHandler } from "./middleware/errors.js";

export const createApp = () => {
  const app = express();
  app.use(cors({ origin: env.corsOrigin }));
  app.use(express.json());
  app.use("/api", api);
  app.use(notFound);
  app.use(errorHandler);
  return app;
};
