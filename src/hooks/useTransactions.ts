import { useCallback, useEffect, useState } from 'react';
import * as api from '../lib/api';
import type { NewTransaction, TransactionPatch } from '../lib/api';
import { byNewest } from '../lib/sortTransactions';
import type { Transaction } from '../types';

export interface UseTransactions {
  /** The full account, unfiltered. */
  transactions: Transaction[];
  /** True until the initial load settles. */
  isLoading: boolean;
  /** Set when the initial load failed. */
  error: string | null;
  /** Create a transaction and fold the server's row into the cache. */
  create: (input: NewTransaction) => Promise<Transaction>;
  /** Patch a transaction and fold the server's row into the cache. */
  update: (id: string, patch: TransactionPatch) => Promise<Transaction>;
  /** Delete a transaction and drop it from the cache. */
  remove: (id: string) => Promise<void>;
}

/**
 * Owns the account's transactions and the writes against them.
 *
 * Every mutation applies the server's response rather than the local guess, so
 * server-assigned fields (the id, a normalized currency) can't drift from what
 * the list shows. The cache is re-sorted on write so a row with an edited date
 * moves to where a refetch would have put it.
 */
export function useTransactions(): UseTransactions {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    api
      .fetchTransactions(controller.signal)
      .then((data) => {
        setTransactions([...data].sort(byNewest));
        setError(null);
      })
      .catch((cause: Error) => {
        if (controller.signal.aborted) return;
        setError(cause.message);
      })
      .finally(() => {
        if (controller.signal.aborted) return;
        setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

  const create = useCallback(async (input: NewTransaction) => {
    const created = await api.createTransaction(input);
    setTransactions((current) => [created, ...current].sort(byNewest));
    return created;
  }, []);

  const update = useCallback(async (id: string, patch: TransactionPatch) => {
    const updated = await api.updateTransaction(id, patch);
    setTransactions((current) =>
      current
        .map((transaction) => (transaction.id === id ? updated : transaction))
        .sort(byNewest),
    );
    return updated;
  }, []);

  const remove = useCallback(async (id: string) => {
    await api.deleteTransaction(id);
    setTransactions((current) =>
      current.filter((transaction) => transaction.id !== id),
    );
  }, []);

  return { transactions, isLoading, error, create, update, remove };
}
