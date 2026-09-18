import type { Transaction } from '../types';

/** Fields the client sends when creating. The server assigns `id`. */
export type NewTransaction = Omit<Transaction, 'id'>;

/** Any subset of the editable fields. */
export type TransactionPatch = Partial<NewTransaction>;

/**
 * Unwraps a response, turning a non-2xx into a thrown `Error` carrying the
 * server's message so the UI has something specific to show.
 */
async function unwrap<T>(response: Response): Promise<T> {
  if (response.ok) {
    return response.status === 204
      ? (undefined as T)
      : ((await response.json()) as T);
  }

  const message = await response
    .json()
    .then((body: { error?: string }) => body.error)
    .catch(() => undefined);

  throw new Error(message ?? `Request failed (${response.status}).`);
}

const JSON_HEADERS = { 'Content-Type': 'application/json' };

export function fetchTransactions(signal?: AbortSignal): Promise<Transaction[]> {
  return fetch('/api/transactions', { signal }).then(unwrap<Transaction[]>);
}

export function createTransaction(
  transaction: NewTransaction,
): Promise<Transaction> {
  return fetch('/api/transactions', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(transaction),
  }).then(unwrap<Transaction>);
}

export function updateTransaction(
  id: string,
  patch: TransactionPatch,
): Promise<Transaction> {
  return fetch(`/api/transactions/${id}`, {
    method: 'PATCH',
    headers: JSON_HEADERS,
    body: JSON.stringify(patch),
  }).then(unwrap<Transaction>);
}

export function deleteTransaction(id: string): Promise<void> {
  return fetch(`/api/transactions/${id}`, { method: 'DELETE' }).then(
    unwrap<void>,
  );
}
