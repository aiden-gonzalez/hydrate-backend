import { authenticateRequest } from "../utils/auth";
import * as authController from "./authController";
import express from "express";

const authRouter = express.Router();

// auth
authRouter.get('/',
  authenticateRequest,
  authController.success // return success message if we get this far
); // check if access token / user account is still valid
authRouter.post('/',
  authController.findUserMiddleware,
  authController.validatePassword
); // login user and return new access token and refresh token

// auth/refresh
authRouter.post('/refresh',
  authController.validateRefresh
); // take refresh token and grant new access token and refresh token

// password reset
authRouter.post('/password-reset/request',
  authController.requestPasswordReset
); // request password reset email

authRouter.post('/password-reset/reset',
  authController.resetPassword
); // reset password with token

export default authRouter;
