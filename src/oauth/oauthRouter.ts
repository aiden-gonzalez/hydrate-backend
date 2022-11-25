const oauthRouter = require('express').Router();
const oauthController = require('./oauthController');

// oauth
oauthRouter.post('/oauth', oauthController.createToken);

// oauth/refresh
oauthRouter.post('/oauth/refresh', oauthController.refreshToken);

module.exports = oauthRouter;
