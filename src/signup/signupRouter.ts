import signupController = require('./signupController');
import express from "express";
const signupRouter = express.Router();

// signup
signupRouter.post('/signup', signupController.createAccount);

export default signupRouter;
