import express from 'express';
import * as OpenApiValidator from "express-openapi-validator";

// Routers
import fobsRouter from "./fobs/fobsRouter";
import authRouter from './auth/authRouter';
import profilesRouter from './profiles/profilesRouter';
import meRouter from './profiles/meRouter';
import signupRouter from './signup/signupRouter';
import picturesRouter from './pictures/picturesRouter';

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

app.use('/api/fobs', fobsRouter);
app.use('/api/auth', authRouter);
app.use('/api/profiles', profilesRouter);
app.use('/api/me', meRouter);
app.use('/api/signup', signupRouter);
app.use('/api/pictures', picturesRouter);

// Base endpoint
app.get('/', (req, res) => {
  return res.send('Server OK');
});

// Error handling middleware (must be registered after routes so express routes errors here)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err, req, res, next) => {
  // format error
  return res.status(err.status || 500).json({
    message: err.message,
    errors: err.errors
  });
});

export default app;
