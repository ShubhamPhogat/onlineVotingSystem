import "dotenv/config";
import express from "express";
import voteRouter from "./routes/voteRouter.js";
import participateRouter from "./routes/participateRouter.js";
import { initilizeWebSocketServer } from "./wsServer.js";
import cors from "cors";

const app = express();
app.use(express.json());
// app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cors({ origin: true }));
const PORT = process.env.PORT || 3000;
initilizeWebSocketServer();
app.use("/api/v1/vote", voteRouter);
app.use("/api/v1/participate", participateRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
