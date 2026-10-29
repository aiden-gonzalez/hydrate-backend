import * as signupController from "./signupController";
import express from "express";
import { signupRateLimit } from "../utils/rateLimit";

const signupRouter = express.Router();

// /signup
signupRouter.post('/',
  signupRateLimit,
  signupController.createAccount
); // take SignupRequest and create new account for the user

export default signupRouter;
