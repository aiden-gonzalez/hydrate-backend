const authRouter = require('express').Router();
const authController = require('./authController');

// auth
authRouter.post(
    '/auth',
    authController.createToken
); // login user and return key

// auth/refresh
authRouter.post('/auth/refresh', authController.refreshToken);

module.exports = authRouter;
