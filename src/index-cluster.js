import { config } from "dotenv";
import cluster from "cluster";
import { cpus } from "node:os";
import process from "node:process";
import express from "express";
import { prisma, connectDB, disconnectDB } from "./config/db.js";

// routes imports
import movieRoutes from "./routes/movies.route.js";
import authRoutes from "./routes/auth.route.js";
import watchListRoutes from "./routes/watchlist.route.js";
// import { worker } from "node:cluster";

config();

const PORT = 8002;
// node clustering code
if (cluster.isPrimary) {
  // PRIMARY PROCESS
  const numCPUs = 4; //as per requirement
  console.log(
    `Primary ${process.pid} is running. Forking ${numCPUs} workers...`,
  );

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // If a worker dies, spawn a new one to maintain 4 workers
  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Spawning replacement...`);
    cluster.fork();
  });
} else {
  // WORKER PROCESS
  const app = express();
  connectDB();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use("/movie", movieRoutes);
  app.use("/auth", authRoutes);
  app.use("/watchlist", watchListRoutes);

  const server = app.listen(PORT, () => {
    console.log(`Worker ${process.pid} started server on port ${PORT}`);
  });

  // Handle unhandled promise rejections (e.g., database connection errors)
  process.on("unhandledRejection", (err) => {
    console.error("Unhandled Rejection:", err);
    server.close(async () => {
      await disconnectDB();
      process.exit(1);
    });
  });

  // Handle uncaught exceptions
  process.on("uncaughtException", async (err) => {
    console.error("Uncaught Exception:", err);
    await disconnectDB();
    process.exit(1);
  });

  // Graceful shutdown
  process.on("SIGTERM", async () => {
    console.log("SIGTERM received, shutting down gracefully");
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  });
}
