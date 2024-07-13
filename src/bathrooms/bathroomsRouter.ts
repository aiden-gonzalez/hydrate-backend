import express from "express";
import * as fobsController from "../fobs/fobsController";
import {authenticateRequest} from "../utils/auth";
import {Bathroom, BathroomRating} from "../mongoDB";

const bathroomsRouter = express.Router();

export function setupBathroomReq (req, res, next) {
  req.isBathroom = true;
  req.fobModel = Bathroom;
  req.fobRatingModel = BathroomRating;
  next();
}

// bathrooms
bathroomsRouter.get('/bathrooms',
  authenticateRequest, // authenticate request
  setupBathroomReq, // set request properties for bathroom request
  fobsController.getFobs // get bathrooms
); // Get bathrooms
bathroomsRouter.post('/bathrooms',
  authenticateRequest, // authenticate request
  setupBathroomReq, // set request properties for bathroom request
  fobsController.createFob // create new bathroom
); // Create bathroom

// bathroom/:id
bathroomsRouter.get('/bathrooms/:id',
  authenticateRequest, // authenticate request
  setupBathroomReq, // set request properties for bathroom request
  fobsController.getFobById // get bathroom
); // Get bathroom
bathroomsRouter.put('/bathrooms/:id',
  authenticateRequest, // authenticate request
  setupBathroomReq, // set request properties for bathroom request
  fobsController.updateFob // update bathroom
); // Update bathroom

// bathrooms/:id/pictures
bathroomsRouter.get('/bathrooms/:id/pictures',
  authenticateRequest, // authenticate request
  setupBathroomReq, // set request properties for bathroom request
  fobsController.getFobPictures // get bathroom pictures
); // Get pictures for bathroom
bathroomsRouter.post('/bathrooms/:id/pictures',
  authenticateRequest, // authenticate request
  setupBathroomReq, // set request properties for bathroom request
  fobsController.addFobPicture // create new bathroom picture
); // Create picture for bathroom

// bathrooms/:id/pictures/:pictureId
bathroomsRouter.get('/bathrooms/:id/pictures/:pictureId',
  authenticateRequest, // authenticate request
  setupBathroomReq, // set request properties for bathroom request
  fobsController.getFobPicture // get bathroom picture
); // Get picture for bathroom
bathroomsRouter.delete('/bathrooms/:id/pictures/:pictureId',
  authenticateRequest, // authenticate request
  setupBathroomReq, // set request properties for bathroom request
  fobsController.deleteFobPicture // delete bathroom picture
); // Delete picture for bathroom

// bathrooms/:id/ratings
bathroomsRouter.get('/bathrooms/:id/ratings',
  authenticateRequest, // authenticate request
  setupBathroomReq, // set request properties for bathroom request
  fobsController.getFobRatings // get bathroom ratings
); // Get bathroom ratings
bathroomsRouter.post('/bathrooms/:id/ratings',
  authenticateRequest, // authenticate request
  setupBathroomReq, // set request properties for bathroom request
  fobsController.addFobRating // create new bathroom rating
); // Create new bathroom rating

// bathrooms/:id/ratings/:ratingId
bathroomsRouter.get('/bathrooms/:id/ratings/:ratingId',
  authenticateRequest, // authenticate request
  setupBathroomReq, // set request properties for bathroom request
  fobsController.getFobRating // get bathroom rating
); // Get bathroom rating
bathroomsRouter.put('/bathrooms/:id/ratings/:ratingId',
  authenticateRequest, // authenticate request
  setupBathroomReq, // set request properties for bathroom request
  fobsController.ratingPermissionCheck, // make sure user is allowed to update this rating
  fobsController.updateFobRating // update bathroom rating by id
); // Update bathroom rating

export default bathroomsRouter;
