const authRouter = require('express').Router();
const authController = require('./authController');

// auth
authRouter.post('/auth', authController.createToken);

// auth/refresh
authRouter.post('/auth/refresh', authController.refreshToken);

module.exports = authRouter;
