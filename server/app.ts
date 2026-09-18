import 'react-router';
import { createRequestHandler } from '@react-router/express';
import express from 'express';
import {
  NotFoundError,
  ValidationError,
  createTransaction,
  deleteTransaction,
  listTransactions,
  updateTransaction,
} from './transactionsStore';

export const app = express();

app.use(express.json());

/** Stand-in for real network latency, so loading states are actually visible. */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Maps store errors onto status codes. Anything else is a genuine 500. */
function send(res: express.Response, run: () => unknown, okStatus = 200) {
  try {
    const body = run();
    if (body === undefined) {
      res.status(204).end();
      return;
    }
    res.status(okStatus).json(body);
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
      return;
    }
    if (error instanceof NotFoundError) {
      res.status(404).json({ error: error.message });
      return;
    }
    throw error;
  }
}

app.get('/api/transactions', async (_req, res) => {
  await delay(500);
  res.json(listTransactions());
});

app.post('/api/transactions', async (req, res) => {
  await delay(400);
  send(res, () => createTransaction(req.body), 201);
});

app.patch('/api/transactions/:id', async (req, res) => {
  await delay(400);
  send(res, () => updateTransaction(req.params.id, req.body));
});

app.delete('/api/transactions/:id', async (req, res) => {
  await delay(400);
  send(res, () => {
    deleteTransaction(req.params.id);
    return undefined;
  });
});

app.use(
  createRequestHandler({
    build: () => import('virtual:react-router/server-build'),
  }),
);
