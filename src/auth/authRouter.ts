import authController = require('./authController');
import express from "express";
const authRouter = express.Router();

// auth
authRouter.post(
  '/auth',
  authController.validateUser,
  authController.validatePassword,
  authController.createTokens
); // login user and return new access token and refresh token

// auth/refresh
authRouter.post('/auth/refresh',
  authController.refreshTokens
); // take refresh token and grant new access token and refresh token

export default authRouter;
