import 'dotenv/config';
import express from 'express';
import mongoose from "mongoose";

// Server port
const port = process.env.PORT;

// Server
const server = express();

// Body parser middleware
import  BodyParser = require('body-parser');
server.use(BodyParser.json());
server.use(BodyParser.urlencoded({ extended: true }));

// Spec validator middleware (using to validate requests)
import OpenApiValidator = require('express-openapi-validator');
server.use(
  OpenApiValidator.middleware({
    apiSpec: './hydRate.json',
    validateRequests: true, // (default)
    validateResponses: true // false by default
  })
);

// Error handling middleware
server.use((err, req, res, next) => {
  // format error
  return res.status(err.status || 500).json({
    message: err.message,
    errors: err.errors
  });
});

// Routers
import bathroomsRouter from "./bathrooms/bathroomsRouter";
import fountainsRouter from './fountains/fountainsRouter'
import authRouter from './auth/authRouter';
import profilesRouter from './profiles/profilesRouter';
import signupRouter from './signup/signupRouter';
server.use('/api/', bathroomsRouter);
server.use('/api/', fountainsRouter);
server.use('/api/', authRouter);
server.use('/api/', profilesRouter);
server.use('/api/', signupRouter);

// Base endpoint
server.get('/', (req, res) => {
  return res.send('Server OK');
});

server.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});

// Connect to mongoDB
async function main() {
  if (process.env.MONGO_ENV == "cloud") {
    await mongoose.connect(process.env.MONGO_CLOUD_URI);
  } else {
    await mongoose.connect(process.env.MONGO_LOCAL_URI);
  }
  console.log("Connected to mongoDB!");
}
main().catch((err) => console.log(err));

module.exports = server;
