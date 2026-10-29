import * as profilesController from "./profilesController";
import express from "express";
import {authenticateRequest} from '../utils/auth';

const meRouter = express.Router();

// me
meRouter.delete('/',
  authenticateRequest, // authenticate request
  profilesController.deleteAccount // permanently delete the authenticated user's account
); // delete account

// me/contributions
meRouter.get('/contributions',
  authenticateRequest, // authenticate request
  profilesController.mapDbUserToUsernameUser, // map dbUser to usernameUser
  profilesController.getContributionsForUser // return contributions for user
); // get contributions for the authenticated user

export default meRouter;
