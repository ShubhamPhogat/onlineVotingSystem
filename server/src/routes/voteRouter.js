import express from "express";
import { voteHandler } from "../controller/voteController.js";
const voteRouter = express.Router();

voteRouter.post("/", voteHandler);

export default voteRouter;
