import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import eventRoutes from "./routes/event.routes.js";
import registrationRoutes from "./routes/registration.routes.js";
import problemRoutes from "./routes/problem.routes.js";
import solutionRoutes from "./routes/solution.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import uploadRoutes from "./routes/upload.routes.js";

import errorMiddleware from "./middlewares/error.middleware.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clientDistPath = path.resolve(__dirname, "../../client/dist");
const clientIndexPath = path.join(clientDistPath, "index.html");
const clientAssetsPath = path.join(clientDistPath, "assets");
const uploadsPath = path.resolve(__dirname, "../uploads");

console.log("Client dist path:", clientDistPath);
console.log("Client dist exists:", fs.existsSync(clientDistPath));
console.log("Client index exists:", fs.existsSync(clientIndexPath));
console.log("Client assets exists:", fs.existsSync(clientAssetsPath));

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:8080",
  "http://localhost:3000",
  "http://localhost:5000",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

const getContentType = (filePath) => {
  const ext = path.extname(filePath);

  if (ext === ".js") return "application/javascript; charset=utf-8";
  if (ext === ".css") return "text/css; charset=utf-8";
  if (ext === ".svg") return "image/svg+xml";
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".ico") return "image/x-icon";
  if (ext === ".html") return "text/html; charset=utf-8";

  return "application/octet-stream";
};

const streamFile = (res, filePath) => {
  console.log("Serving file:", filePath);
  console.log("File exists:", fs.existsSync(filePath));

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("File not found");
  }

  res.setHeader("Content-Type", getContentType(filePath));

  const stream = fs.createReadStream(filePath);

  stream.on("error", (error) => {
    console.error("File stream error:", error);

    if (!res.headersSent) {
      return res.status(500).send(error.message);
    }
  });

  return stream.pipe(res);
};

app.get("/assets/:fileName", (req, res) => {
  const filePath = path.join(clientAssetsPath, req.params.fileName);
  return streamFile(res, filePath);
});

app.get("/favicon.svg", (req, res) => {
  return streamFile(res, path.join(clientDistPath, "favicon.svg"));
});

app.get("/vite.svg", (req, res) => {
  return streamFile(res, path.join(clientDistPath, "vite.svg"));
});

app.use("/uploads", express.static(uploadsPath));

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/solutions", solutionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/uploads", uploadRoutes);

app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next();
  }

  if (req.path.startsWith("/uploads")) {
    return next();
  }

  if (path.extname(req.path)) {
    return res.status(404).send("Static file not found");
  }

  return streamFile(res, clientIndexPath);
});

app.use((error, req, res, next) => {
  console.error("FINAL APP ERROR:", error);

  if (res.headersSent) {
    return next(error);
  }

  return errorMiddleware(error, req, res, next);
});

export default app;