import profilesController = require('./profilesController');
import express from "express";
const profilesRouter = express.Router();


// profiles
profilesRouter.get('/profiles', profilesController.getProfile);
profilesRouter.put('/profiles', profilesController.updateProfile);

export default profilesRouter;
