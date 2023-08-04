import authController = require('./authController');
import express from "express";
const authRouter = express.Router();

// auth
authRouter.post(
    '/auth',
    authController.createToken
); // login user and return key

// auth/refresh
authRouter.post('/auth/refresh', authController.refreshToken);

export default authRouter;
