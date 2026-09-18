import { seedTransactions } from '../src/data/seed';
import { byNewest } from '../src/lib/sortTransactions';
import { isCategory, isStatus, isType } from '../src/lib/transactionOptions';
import { amountSignError } from '../src/lib/transactionRules';
import type { Transaction } from '../src/types';

/**
 * In-memory stand-in for the transactions table.
 *
 * The seed array is copied rather than mutated so a server restart always comes
 * back to the same known state. State lives for the life of the process, which
 * is all a demo backend needs.
 */
let transactions: Transaction[] = [...seedTransactions];

let nextIdNumber =
  transactions.reduce((max, transaction) => {
    const parsed = Number.parseInt(transaction.id.replace('txn_', ''), 10);
    return Number.isNaN(parsed) ? max : Math.max(max, parsed);
  }, 1000) + 1;

function nextId(): string {
  return `txn_${nextIdNumber++}`;
}

export class ValidationError extends Error {}
export class NotFoundError extends Error {}

/** Fields a client is allowed to send. `id` is server-assigned. */
type TransactionInput = Omit<Transaction, 'id'>;

/**
 * Validates a request body. `partial` allows the subset a PATCH sends; a POST
 * requires every field except `createdAt`, which defaults to now.
 */
function validate(
  body: unknown,
  { partial }: { partial: boolean },
): Partial<TransactionInput> {
  if (typeof body !== 'object' || body === null) {
    throw new ValidationError('Expected a transaction object.');
  }

  const input = body as Record<string, unknown>;
  const result: Partial<TransactionInput> = {};
  const has = (field: string) => input[field] !== undefined;
  const required = (field: string) => {
    if (!partial && !has(field)) {
      throw new ValidationError(`"${field}" is required.`);
    }
    return has(field);
  };

  if (required('description')) {
    const description = input.description;
    if (typeof description !== 'string' || description.trim() === '') {
      throw new ValidationError('"description" must be a non-empty string.');
    }
    result.description = description.trim();
  }

  if (required('amountCents')) {
    const amountCents = input.amountCents;
    if (typeof amountCents !== 'number' || !Number.isInteger(amountCents)) {
      throw new ValidationError('"amountCents" must be an integer.');
    }
    result.amountCents = amountCents;
  }

  if (required('currency')) {
    const currency = input.currency;
    if (typeof currency !== 'string' || !/^[A-Za-z]{3}$/.test(currency)) {
      throw new ValidationError('"currency" must be a 3-letter code.');
    }
    result.currency = currency.toUpperCase();
  }

  if (required('status')) {
    if (!isStatus(input.status)) {
      throw new ValidationError(`"${String(input.status)}" is not a status.`);
    }
    result.status = input.status;
  }

  if (required('type')) {
    if (!isType(input.type)) {
      throw new ValidationError(`"${String(input.type)}" is not a type.`);
    }
    result.type = input.type;
  }

  if (required('merchantCategory')) {
    if (!isCategory(input.merchantCategory)) {
      throw new ValidationError(
        `"${String(input.merchantCategory)}" is not a category.`,
      );
    }
    result.merchantCategory = input.merchantCategory;
  }

  if (has('createdAt')) {
    const createdAt = input.createdAt;
    if (
      typeof createdAt !== 'string' ||
      Number.isNaN(new Date(createdAt).getTime())
    ) {
      throw new ValidationError('"createdAt" must be an ISO 8601 timestamp.');
    }
    result.createdAt = new Date(createdAt).toISOString();
  }

  return result;
}

/**
 * Cross-field validation, run against the finished row. A PATCH can change the
 * type, the amount, or just one of them, so this can only be checked after the
 * patch is merged onto the existing transaction.
 */
function assertRules(transaction: Omit<Transaction, 'id'>): void {
  const signError = amountSignError(transaction.type, transaction.amountCents);
  if (signError) {
    throw new ValidationError(signError);
  }
}

export function listTransactions(): Transaction[] {
  return transactions;
}

export function createTransaction(body: unknown): Transaction {
  const input = validate(body, { partial: false }) as TransactionInput;
  const created: Transaction = {
    ...input,
    createdAt: input.createdAt ?? new Date().toISOString(),
    id: nextId(),
  };
  assertRules(created);

  transactions = [created, ...transactions].sort(byNewest);
  return created;
}

export function updateTransaction(id: string, body: unknown): Transaction {
  const index = transactions.findIndex((transaction) => transaction.id === id);
  if (index === -1) {
    throw new NotFoundError(`No transaction with id "${id}".`);
  }

  const patch = validate(body, { partial: true });
  const updated: Transaction = { ...transactions[index], ...patch };
  assertRules(updated);

  transactions = transactions
    .map((transaction, i) => (i === index ? updated : transaction))
    .sort(byNewest);

  return updated;
}

export function deleteTransaction(id: string): void {
  const exists = transactions.some((transaction) => transaction.id === id);
  if (!exists) {
    throw new NotFoundError(`No transaction with id "${id}".`);
  }
  transactions = transactions.filter((transaction) => transaction.id !== id);
}
