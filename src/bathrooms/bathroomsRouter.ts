import * as bathroomsController from "./bathroomsController";
import express from "express";
import {authenticateRequest} from "../utils/auth";

const bathroomsRouter = express.Router();

// bathrooms
bathroomsRouter.get('/bathrooms',
  authenticateRequest, // authenticate request
  bathroomsController.getBathrooms // get bathrooms
); // Get bathrooms
bathroomsRouter.post('/bathrooms',
  authenticateRequest, // authenticate request
  bathroomsController.createBathroom // create new bathroom
); // Create bathroom

// bathroom/:id
bathroomsRouter.put('/bathrooms/:id',
  authenticateRequest, // authenticate request
  bathroomsController.getBathroom // get bathroom
); // Get bathroom
bathroomsRouter.put('/bathrooms/:id',
  authenticateRequest, // authenticate request
  bathroomsController.updateBathroom // update bathroom
); // Update bathroom

// bathrooms/:id/pictures
bathroomsRouter.get('/bathrooms/:id/pictures',
  authenticateRequest, // authenticate request
  bathroomsController.getBathroomPhotos // get bathroom photos
); // Get photos for bathroom
bathroomsRouter.post('/bathrooms/:id/pictures',
  authenticateRequest, // authenticate request
  bathroomsController.addBathroomPhoto // create new bathroom photo
); // Create photo for bathroom

// bathrooms/:id/pictures/:pictureId
bathroomsRouter.get('/bathrooms/:id/pictures/:pictureId',
  authenticateRequest, // authenticate request
  bathroomsController.getBathroomPhoto // get bathroom photo
); // Get photo for bathroom
bathroomsRouter.delete('/bathrooms/:id/pictures/:pictureId',
  authenticateRequest, // authenticate request
  bathroomsController.deleteBathroomPhoto // delete bathroom photo
); // Delete photo for bathroom

// bathrooms/:id/ratings
bathroomsRouter.get('/bathrooms/:id/ratings',
  authenticateRequest, // authenticate request
  bathroomsController.getBathroomRatings // get bathroom ratings
); // Get bathroom ratings
bathroomsRouter.post('/bathrooms/:id/ratings',
  authenticateRequest, // authenticate request
  bathroomsController.addBathroomRating // create new bathroom rating
);

// bathrooms/:id/ratings/:ratingId
bathroomsRouter.get('/bathrooms/:id/ratings/:ratingId',
  authenticateRequest, // authenticate request
  bathroomsController.getBathroomRating // get bathroom rating
); // Get bathroom rating
bathroomsRouter.put('/bathrooms/:id/ratings/:ratingId',
  authenticateRequest, // authenticate request
  bathroomsController.updateBathroomRating // update bathroom rating by id
); // Update bathroom rating

export default bathroomsRouter;
