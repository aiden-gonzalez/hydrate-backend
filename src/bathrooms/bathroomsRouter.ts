import bathroomsController = require('./bathroomsController');
import express from "express";
const bathroomsRouter = express.Router();

// bathrooms
bathroomsRouter.get('/bathrooms', bathroomsController.getBathrooms);
bathroomsRouter.put('/bathrooms', bathroomsController.updateBathroom);
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
