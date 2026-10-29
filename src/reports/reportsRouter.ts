import * as reportsController from "./reportsController";
import express from "express";
import {authenticateRequest} from '../utils/auth';

const reportsRouter = express.Router();

// reports
reportsRouter.post('/',
  authenticateRequest, // authenticate request
  reportsController.createReport // record report (and auto-hide pictures past the threshold)
); // report content

export default reportsRouter;
