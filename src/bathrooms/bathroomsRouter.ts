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
  authenticateRequest, // authenticate request
  bathroomsController.updateBathroom // update bathroom by id
);
bathroomsRouter.post('/bathrooms',
  authenticateRequest, // authenticate request
  bathroomsController.createBathroom // create new bathroom
);

// bathrooms/pictures
bathroomsRouter.get('/bathrooms/pictures',
  authenticateRequest, // authenticate request
  bathroomsController.getBathroomPhotos // get bathroom photos
);
bathroomsRouter.post('/bathrooms/pictures',
  authenticateRequest, // authenticate request
  bathroomsController.addBathroomPhoto // create new bathroom photo
);
bathroomsRouter.delete('/bathrooms/pictures',
  authenticateRequest, // authenticate request
  bathroomsController.deleteBathroomPhoto // delete bathroom photo
);

// bathrooms/ratings
bathroomsRouter.get('/bathrooms/ratings',
  authenticateRequest, // authenticate request
  bathroomsController.getBathroomRatings // get bathroom ratings
);
bathroomsRouter.put('/bathrooms/ratings',
  authenticateRequest, // authenticate request
  bathroomsController.updateBathroomRating // update bathroom rating by id
);
bathroomsRouter.post('/bathrooms/ratings',
  authenticateRequest, // authenticate request
  bathroomsController.addBathroomRating // create new bathroom rating
);

export default bathroomsRouter;
