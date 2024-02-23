import * as bathroomsController from "./bathroomsController";
import express from "express";
import {authenticateRequest} from "../utils/auth";

const bathroomsRouter = express.Router();

// bathrooms
bathroomsRouter.get('/bathrooms',
  authenticateRequest, // authenticate request
  bathroomsController.getBathrooms // get bathrooms
); // Get bathrooms
bathroomsRouter.put('/bathrooms',
  authenticateRequest,
  bathroomsController.updateBathroom
);
bathroomsRouter.post('/bathrooms', bathroomsController.createBathroom);

// bathrooms/pictures
bathroomsRouter.get('/bathrooms/pictures', bathroomsController.getBathroomPhotos);
bathroomsRouter.post('/bathrooms/pictures', bathroomsController.addBathroomPhoto);
bathroomsRouter.delete('/bathrooms/pictures', bathroomsController.deleteBathroomPhoto);

// bathrooms/ratings
bathroomsRouter.get('/bathrooms/ratings', bathroomsController.getBathroomRatings);
bathroomsRouter.put('/bathrooms/ratings', bathroomsController.updateBathroomRating);
bathroomsRouter.post('/bathrooms/ratings', bathroomsController.addBathroomRating);

export default bathroomsRouter;
