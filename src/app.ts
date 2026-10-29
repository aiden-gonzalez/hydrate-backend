import express from 'express';
import { generalRateLimit } from './utils/rateLimit';
import * as OpenApiValidator from "express-openapi-validator";

// Routers
import fobsRouter from "./fobs/fobsRouter";
import authRouter from './auth/authRouter';
import profilesRouter from './profiles/profilesRouter';
import meRouter from './profiles/meRouter';
import signupRouter from './signup/signupRouter';
import picturesRouter from './pictures/picturesRouter';
import reportsRouter from './reports/reportsRouter';

const app = express();

// When running behind a reverse proxy (e.g. Caddy), trust it for the client IP used by rate limiting
if (process.env.TRUST_PROXY) {
  app.set('trust proxy', parseInt(process.env.TRUST_PROXY) || process.env.TRUST_PROXY);
}
app.disable('x-powered-by');

app.use(generalRateLimit);

// Body parser middleware
app.use(express.json({ limit: '100kb' }));
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
app.use('/api/reports', reportsRouter);

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
