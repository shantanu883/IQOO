import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { env } from "./config/env.js";
import routes from "./routes/index.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js";
import { globalLimiter } from "./middleware/rateLimit.middleware.js";

export function createApp() {
  const app = express();

  // Security headers.
  app.use(helmet());

  // CORS — allow the client origin and send credentials (cookies).
  app.use(
    cors({
      origin: env.clientUrl,
      credentials: true,
    })
  );

  // Body & cookie parsing with sane size limits.
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  if (!env.isProd) app.use(morgan("dev"));

  // Rate limit all API traffic.
  app.use("/api", globalLimiter);

  // Mount the API.
  app.use("/api", routes);

  // Health check at the root.
  app.get("/", (_req, res) =>
    res.json({ name: "DevLoop API", status: "running", docs: "/api/status" })
  );

  // 404 + centralised error handling (must be last).
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
