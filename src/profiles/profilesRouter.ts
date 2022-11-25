const profilesRouter = require('express').Router();
const profilesController = require('./profilesController');

// profiles
profilesRouter.get('/profiles', profilesController.getProfile);
profilesRouter.put('/profiles', profilesController.updateProfile);

module.exports = profilesRouter;
