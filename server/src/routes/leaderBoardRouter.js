import express from "express";
import { leaderBoardHandler } from "../controller/leaderBoardController.js";
const leaderBoardRouter = express.Router();

leaderBoardRouter.get("/leaderboard", leaderBoardHandler);

export default leaderBoardRouter;
