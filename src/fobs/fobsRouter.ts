import express from "express";
import * as fobsController from "./fobsController";
import {authenticateRequest} from "../utils/auth";

const fobsRouter = express.Router();

// fobs
fobsRouter.get('/fobs',
  authenticateRequest, // authenticate request
  fobsController.getFobs // get fobs
); // Get fobs
fobsRouter.post('/fobs',
  authenticateRequest, // authenticate request
  fobsController.createFob // create new fob
); // Create fob

// fobs/:id
fobsRouter.get('/fobs/:id',
  authenticateRequest, // authenticate request
  fobsController.getFobById // get fob
); // Get fob
fobsRouter.put('/fobs/:id',
  authenticateRequest, // authenticate request
  fobsController.updateFob // update fob
); // Update fob

// fobs/:id/details
fobsRouter.get('/fobs/:id/details',
  authenticateRequest, // authenticate request
  fobsController.getFobWithDetails // get fob with details
); // Get fob with details

// fobs/:id/pictures
fobsRouter.get('/fobs/:id/pictures',
  authenticateRequest, // authenticate request
  fobsController.getFobPictures // get fob pictures
); // Get pictures for fob
fobsRouter.get('/fobs/:id/pictures/upload',
  authenticateRequest, // authenticate request
  fobsController.getFobPictureUploadUrl // get a fob picture upload url
); // Get fob picture upload url

// fobs/:id/ratings
fobsRouter.get('/fobs/:id/ratings',
  authenticateRequest, // authenticate request
  fobsController.getFobRatings // get fob ratings
); // Get fob ratings
fobsRouter.post('/fobs/:id/ratings',
  authenticateRequest, // authenticate request
  fobsController.addFobRating // create new fob rating
); // Create new fob rating

// fobs/:id/ratings/:ratingId
fobsRouter.get('/fobs/:id/ratings/:ratingId',
  authenticateRequest, // authenticate request
  fobsController.getFobRating // get fob rating
); // Get fob rating
fobsRouter.put('/fobs/:id/ratings/:ratingId',
  authenticateRequest, // authenticate request
  fobsController.ratingPermissionCheck, // make sure user is allowed to update this rating
  fobsController.updateFobRating // update fob rating by id
); // Update fob rating

export default fobsRouter;
