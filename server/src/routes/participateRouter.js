import express from "express";
import {
  getParticipants,
  participateHandler,
} from "../controller/participationController.js";

const participateRouter = express.Router();

participateRouter.post("/", participateHandler);
participateRouter.get("/get", getParticipants);

export default participateRouter;
