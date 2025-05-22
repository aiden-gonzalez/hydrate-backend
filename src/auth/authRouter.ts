import { authenticateRequest } from "../utils/auth";
import * as authController from "./authController";
import express from "express";

const authRouter = express.Router();

// auth
authRouter.get('/auth',
  authenticateRequest,
  authController.success // return success message if we get this far
); // check if access token / user account is still valid
authRouter.post('/auth',
  authController.findUserMiddleware,
  authController.validatePassword
); // login user and return new access token and refresh token

// auth/refresh
authRouter.post('/auth/refresh',
  authController.validateRefresh
); // take refresh token and grant new access token and refresh token

export default authRouter;
