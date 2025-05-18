import 'dotenv/config';
import express from 'express';
import * as OpenApiValidator from "express-openapi-validator";
import {migrateToLatest} from "./db/migrate";

// Routers
import fobsRouter from "./fobs/fobsRouter";
import authRouter from './auth/authRouter';
import profilesRouter from './profiles/profilesRouter';
import signupRouter from './signup/signupRouter';

// Server port
const port = process.env.PORT;

// Server
const https = require("https");
const http = require("http");
const app = express();

// Body parser middleware
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: false }));

// Setup validator middleware (using to validate requests)
app.use(
  OpenApiValidator.middleware({
    apiSpec: './hydRate.json',
    validateApiSpec: true, // (default)
    validateSecurity: true, // (default)
    validateRequests: true, // (default)
    validateResponses: true // false by default
  })
);

// Error handling middleware
app.use((err, req, res, next) => {
  // format error
  return res.status(err.status || 500).json({
    message: err.message,
    errors: err.errors
  });
});

app.use('/api/', fobsRouter);
app.use('/api/', authRouter);
app.use('/api/', profilesRouter);
app.use('/api/', signupRouter);

// Base endpoint
app.get('/', (req, res) => {
  return res.send('Server OK');
});

// Https stuff
const fs = require('node:fs');

const options = {
  key: fs.readFileSync('./https_private_key.pem'),
  cert: fs.readFileSync('./certificate.pem'),
};

http.createServer(app).listen(port);
console.log("Express is listening on port", port);
https.createServer(options, app).listen('3001');
console.log("Https express is listening on port 3001");

// Connect to postgres
async function main() {
  await migrateToLatest();
  console.log("Connected to postgres!");
}
main().catch((err) => console.log(err));

module.exports = app;
