import 'dotenv/config';
import express from 'express';
import * as BodyParser from "body-parser";
import * as OpenApiValidator from "express-openapi-validator";

// Routers
import bathroomsRouter from "./bathrooms/bathroomsRouter";
import fountainsRouter from './fountains/fountainsRouter'
import authRouter from './auth/authRouter';
import profilesRouter from './profiles/profilesRouter';
import signupRouter from './signup/signupRouter';

// Server port
const port = process.env.PORT;

// Server
const server = express();

// Body parser middleware
server.use(BodyParser.json());
server.use(BodyParser.urlencoded({ extended: true }));
// Setup validator middleware (using to validate requests)
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

// Connect to postgres
async function main() {
  if (process.env.NODE_ENV == "cloud") {
    // await mongoose.connect(process.env.MONGO_CLOUD_URI);
    // TODO replace this with postgres cloud connection
  } else {
    // await mongoose.connect(process.env.MONGO_LOCAL_URI);
    // TODO replace this with postgres local connection
  }
  console.log("Connected to postgres!");
}
main().catch((err) => console.log(err));

module.exports = server;
