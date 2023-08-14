const signupRouter = require('express').Router();
const signupController = require('./signupController');

// signup
signupRouter.post('/signup', signupController.createAccount);

module.exports = signupRouter;
