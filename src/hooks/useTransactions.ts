import { useEffect, useMemo, useState } from 'react';
import { debounce } from '../lib/debounce';
import type { Transaction } from '../types';

export interface UseTransactions {
  /** The full account, unfiltered. */
  transactions: Transaction[];
  /** The rows that match the current search query. */
  results: Transaction[];
  /** Current value of the search box. */
  query: string;
  /** Update the search query. */
  onSearch: (value: string) => void;
}

/**
 * Owns the account's transactions and the description search.
 *
 * Searching is debounced so we don't re-filter on every keystroke.
 */
export function useTransactions(): UseTransactions {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Transaction[]>([]);

  useEffect(() => {
    let active = true;
    fetch('/api/transactions')
      .then((res) => res.json())
      .then((data: Transaction[]) => {
        if (!active) return;
        setTransactions(data);
        setResults(data);
      });
    return () => {
      active = false;
    };
  }, []);

  const debouncedSearch = useMemo(
    () =>
      debounce((q: string) => {
        const term = q.trim().toLowerCase();
        const next = term
          ? transactions.filter((t) =>
              t.description.toLowerCase().includes(term),
            )
          : transactions;
        setResults(next);
      }, 250),
    [transactions],
  );

  const onSearch = (value: string) => {
    setQuery(value);
    debouncedSearch(query);
  };

  return { transactions, results, query, onSearch };
}
