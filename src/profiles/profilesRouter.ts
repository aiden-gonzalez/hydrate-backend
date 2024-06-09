import * as profilesController from "./profilesController";
import express from "express";
import {authenticateRequest} from '../utils/auth';

const profilesRouter = express.Router();


// profiles
profilesRouter.get('/profiles/:username',
  authenticateRequest, // authenticate request
  profilesController.getUserMiddleware, // get user from db by username
  profilesController.getProfileForUser // return profile for user
); // get profile by username
profilesRouter.put('/profiles/:username',
  authenticateRequest, // authenticate request
  profilesController.profilePermissionCheck, // ensure user is allowed to update profile
  profilesController.getUserMiddleware, // get user from db by username
  profilesController.updateProfile // update and return user
); // update profile by username
profilesRouter.get('/profiles/:username/contributions',
  authenticateRequest, // authenticate request
  profilesController.getUserMiddleware, // get user from db by username
  profilesController.getContributionsForUser // return contributions for user
); // get contributions by username

export default profilesRouter;
