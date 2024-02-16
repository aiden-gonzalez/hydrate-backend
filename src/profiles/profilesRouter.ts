import profilesController = require('./profilesController');
import express from "express";
const profilesRouter = express.Router();


// profiles
profilesRouter.get('/profiles/:username',
  profilesController.getUserMiddleware,
  profilesController.getProfileFromUser
); // get profile by username
profilesRouter.put('/profiles/:username',
  profilesController.updateProfile
); // update profile by username

export default profilesRouter;
