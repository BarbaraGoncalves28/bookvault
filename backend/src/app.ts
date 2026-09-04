import cors from 'cors';
import express from 'express';

import { env } from './config/env';
import { errorHandler } from './http/middlewares/error-handler.middleware';
import { routes } from './http/routes';

export const app = express();

app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,
  }),
);

app.use(express.json());

app.use('/api', routes);

app.use(errorHandler);