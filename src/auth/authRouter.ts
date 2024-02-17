import authController = require('./authController');
import express from "express";
const authRouter = express.Router();

// auth
authRouter.post(
  '/auth',
  authController.findUserMiddleware,
  authController.validatePassword
); // login user and return new access token and refresh token

// auth/refresh
authRouter.post('/auth/refresh',
  authController.validateRefresh
); // take refresh token and grant new access token and refresh token

export default authRouter;
