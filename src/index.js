import { config } from "dotenv";
import express from "express";
import { prisma, connectDB, disconnectDB } from "./config/db.js";

// routes imports
import movieRoutes from "./routes/movies.route.js";
import authRoutes from "./routes/auth.route.js";
import watchListRoutes from "./routes/watchlist.route.js";

config();
connectDB();

const app = express();

const PORT = 8002;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/movie", movieRoutes);
app.use("/auth", authRoutes);
app.use("/watchlist", watchListRoutes);

const server = app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
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
