import 'react-router';
import { createRequestHandler } from '@react-router/express';
import express from 'express';
import { seedTransactions } from '../src/data/seed';

export const app = express();

app.use(express.json());

app.get('/api/transactions', async (_req, res) => {

  await new Promise(resolve => setTimeout(resolve, 500));

  res.json(seedTransactions);
});

app.use(
  createRequestHandler({
    build: () => import('virtual:react-router/server-build'),
  }),
);
