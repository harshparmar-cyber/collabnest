import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import collaborationRoutes from "./routes/collaborationRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import setupSocket from "./socket.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

const CLIENT_URL =
  process.env.CLIENT_URL || "http://localhost:5173";

const allowedOrigins = [
  "http://localhost:5173",
  CLIENT_URL,
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json({ limit: "4mb" }));

app.use(cookieParser());

/*
 * ==============================
 * API ROUTES
 * ==============================
 */

app.use("/api/auth", authRoutes);

app.use("/api/projects", projectRoutes);

app.use(
  "/api/collaborations",
  collaborationRoutes
);

app.use("/api/messages", messageRoutes);

/*
 * ==============================
 * ROOT ROUTE
 * ==============================
 */

app.get("/", (_req, res) => {
  res.json({
    message: "CollabNest API is running 🚀",
  });
});

/*
 * ==============================
 * HTTP SERVER
 * ==============================
 */

const httpServer = createServer(app);

/*
 * ==============================
 * SOCKET.IO SERVER
 * ==============================
 */

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

setupSocket(io);

/*
 * ==============================
 * START SERVER
 * ==============================
 */

const startServer = async () => {
  try {
    await connectDB();

    httpServer.listen(PORT, () => {
      console.log(
        `🚀 CollabNest server running on http://localhost:${PORT}`
      );

      console.log(
        `🔌 Socket.IO server is ready`
      );
    });
  } catch (error) {
    console.error(
      "❌ Server startup failed:",
      error
    );
  }
};

startServer();