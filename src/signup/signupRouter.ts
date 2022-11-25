const signupRouter = require('express').Router();
const signupController = require('./signupController');

// signup
signupRouter.post('/profiles', signupController.createAccount);

module.exports = signupRouter;
