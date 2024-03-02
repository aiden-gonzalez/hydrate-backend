import * as fountainsController from "./fountainsController";
import express from "express";
import {authenticateRequest} from "../utils/auth";

const fountainsRouter = express.Router();

// fountains
fountainsRouter.get('/fountains',
  authenticateRequest, // authenticate request
  fountainsController.getFountains // get fountains
); // Get fountains
fountainsRouter.post('/fountains',
  authenticateRequest, // authenticate request
  fountainsController.createFountain // create new fountain
); // Create fountain

// fountain/:id
fountainsRouter.put('/fountains/:id',
  authenticateRequest, // authenticate request
  fountainsController.getFountain // get fountain
); // Get fountain
fountainsRouter.put('/fountains/:id',
  authenticateRequest, // authenticate request
  fountainsController.updateFountain // update fountain
); // Update fountain

// fountains/:id/pictures
fountainsRouter.get('/fountains/:id/pictures',
  authenticateRequest, // authenticate request
  fountainsController.getFountainPictures // get fountain pictures
); // Get pictures for fountain
fountainsRouter.post('/fountains/:id/pictures',
  authenticateRequest, // authenticate request
  fountainsController.addFountainPicture // create new fountain picture
); // Create picture for fountain

// fountains/:id/pictures/:pictureId
fountainsRouter.get('/fountains/:id/pictures/:pictureId',
  authenticateRequest, // authenticate request
  fountainsController.getFountainPicture // get fountain picture
); // Get picture for fountain
fountainsRouter.delete('/fountains/:id/pictures/:pictureId',
  authenticateRequest, // authenticate request
  fountainsController.deleteFountainPicture // delete fountain picture
); // Delete picture for fountain

// fountains/:id/ratings
fountainsRouter.get('/fountains/:id/ratings',
  authenticateRequest, // authenticate request
  fountainsController.getFountainRatings // get fountain ratings
); // Get fountain ratings
fountainsRouter.post('/fountains/:id/ratings',
  authenticateRequest, // authenticate request
  fountainsController.addFountainRating // create new fountain rating
);

// fountains/:id/ratings/:ratingId
fountainsRouter.get('/fountains/:id/ratings/:ratingId',
  authenticateRequest, // authenticate request
  fountainsController.getFountainRating // get fountain rating
); // Get fountain rating
fountainsRouter.put('/fountains/:id/ratings/:ratingId',
  authenticateRequest, // authenticate request
  fountainsController.ratingPermissionCheck, // make sure user is allowed to update this rating
  fountainsController.updateFountainRating // update fountain rating by id
); // Update fountain rating

export default fountainsRouter;
