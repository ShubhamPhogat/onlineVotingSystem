import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from the server root directory FIRST
const envPath = resolve(__dirname, "../.env");
console.log("Loading .env from:", envPath);
const result = dotenv.config({ path: envPath });
if (result.error) {
  console.error("Error loading .env file:", result.error);
} else {
  console.log("✅ .env loaded successfully");
  console.log("DATABASE_URL:", process.env.DATABASE_URL ? "SET" : "NOT SET");
  console.log("DATABASE_API:", process.env.DATABASE_API ? "SET" : "NOT SET");
}

import express from "express";
import cors from "cors";

const app = express();
app.use(express.json());
// app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cors({ origin: true }));
const PORT = process.env.PORT || 3000;

// Dynamic imports to ensure dotenv loads first
(async () => {
  const { initilizeWebSocketServer } = await import("./wsServer.js");
  const { default: voteRouter } = await import("./routes/voteRouter.js");
  const { default: participateRouter } = await import("./routes/participateRouter.js");
  
  await initilizeWebSocketServer();
  app.use("/api/v1/vote", voteRouter);
  app.use("/api/v1/participate", participateRouter);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
})();
