import fountainsController = require('./fountainsController');
import express from "express";
const fountainsRouter = express.Router();

// fountains
fountainsRouter.get('/fountains', fountainsController.getFountains);
fountainsRouter.put('/fountains', fountainsController.updateFountain);
fountainsRouter.post('/fountains', fountainsController.createFountain);

// fountains/pictures
fountainsRouter.get('/fountains/pictures', fountainsController.getFountainPhotos);
fountainsRouter.post('/fountains/pictures', fountainsController.addFountainPhoto);
fountainsRouter.delete('/fountains/pictures', fountainsController.deleteFountainPhoto);

// fountains/ratings
fountainsRouter.get('/fountains/ratings', fountainsController.getFountainRatings);
fountainsRouter.put('/fountains/ratings', fountainsController.updateFountainRating);
fountainsRouter.post('/fountains/ratings', fountainsController.addFountainRating);

export default fountainsRouter;
