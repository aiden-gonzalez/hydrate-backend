import express from "express";
import * as fobsController from "../fobs/fobsController";
import {authenticateRequest} from "../utils/auth";
import {Fountain, FountainRating} from "../mongoDB";

const fountainsRouter = express.Router();

export function setupFountainReq (req, res, next) {
  req.isFountain = true;
  req.fobModel = Fountain;
  req.fobRatingModel = FountainRating;
  next();
}

// fountains
fountainsRouter.get('/fountains',
  authenticateRequest, // authenticate request
  setupFountainReq, // set request properties for fountain request
  fobsController.getFobs // get fountains
); // Get fountains
fountainsRouter.post('/fountains',
  authenticateRequest, // authenticate request
  setupFountainReq, // set request properties for fountain request
  fobsController.createFob // create new fountain
); // Create fountain

// fountain/:id
fountainsRouter.put('/fountains/:id',
  authenticateRequest, // authenticate request
  setupFountainReq, // set request properties for fountain request
  fobsController.getFobById // get fountain
); // Get fountain
fountainsRouter.put('/fountains/:id',
  authenticateRequest, // authenticate request
  setupFountainReq, // set request properties for fountain request
  fobsController.updateFob // update fountain
); // Update fountain

// fountains/:id/pictures
fountainsRouter.get('/fountains/:id/pictures',
  authenticateRequest, // authenticate request
  setupFountainReq, // set request properties for fountain request
  fobsController.getFobPictures // get fountain pictures
); // Get pictures for fountain
fountainsRouter.post('/fountains/:id/pictures',
  authenticateRequest, // authenticate request
  setupFountainReq, // set request properties for fountain request
  fobsController.addFobPicture // create new fountain picture
); // Create picture for fountain

// fountains/:id/pictures/:pictureId
fountainsRouter.get('/fountains/:id/pictures/:pictureId',
  authenticateRequest, // authenticate request
  setupFountainReq, // set request properties for fountain request
  fobsController.getFobPicture // get fountain picture
); // Get picture for fountain
fountainsRouter.delete('/fountains/:id/pictures/:pictureId',
  authenticateRequest, // authenticate request
  setupFountainReq, // set request properties for fountain request
  fobsController.deleteFobPicture // delete fountain picture
); // Delete picture for fountain

// fountains/:id/ratings
fountainsRouter.get('/fountains/:id/ratings',
  authenticateRequest, // authenticate request
  setupFountainReq, // set request properties for fountain request
  fobsController.getFobRatings // get fountain ratings
); // Get fountain ratings
fountainsRouter.post('/fountains/:id/ratings',
  authenticateRequest, // authenticate request
  setupFountainReq, // set request properties for fountain request
  fobsController.addFobRating // create new fountain rating
); // Create new fountain rating

// fountains/:id/ratings/:ratingId
fountainsRouter.get('/fountains/:id/ratings/:ratingId',
  authenticateRequest, // authenticate request
  setupFountainReq, // set request properties for fountain request
  fobsController.getFobRating // get fountain rating
); // Get fountain rating
fountainsRouter.put('/fountains/:id/ratings/:ratingId',
  authenticateRequest, // authenticate request
  setupFountainReq, // set request properties for fountain request
  fobsController.ratingPermissionCheck, // make sure user is allowed to update this rating
  fobsController.updateFobRating // update fountain rating by id
); // Update fountain rating

export default fountainsRouter;
