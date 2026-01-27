import * as signupController from "./signupController";
import express from "express";

const signupRouter = express.Router();

// /signup
signupRouter.post('/',
  signupController.createAccount
); // take SignupRequest and create new account for the user

export default signupRouter;
