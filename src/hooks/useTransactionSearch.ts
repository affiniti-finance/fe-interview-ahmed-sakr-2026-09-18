import { useEffect, useMemo, useState } from 'react';
import type { Transaction } from '../types';

const SEARCH_DEBOUNCE_MS = 250;

export interface UseTransactionSearch {
  /** The input rows narrowed by the current search term. */
  results: Transaction[];
  /** Current value of the search box. */
  query: string;
  /** Update the search query. */
  onSearch: (value: string) => void;
}

/**
 * Owns the description search over whatever rows it is given.
 *
 * The term is debounced so we don't re-filter on every keystroke, and `results`
 * is derived rather than stored so it can't fall out of step with the list.
 */
export function useTransactionSearch(
  transactions: Transaction[],
): UseTransactionSearch {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // The cleanup cancels the pending timer on every keystroke and on unmount.
  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedQuery(query),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [query]);

  const results = useMemo(() => {
    const term = debouncedQuery.trim().toLowerCase();
    if (!term) return transactions;
    return transactions.filter((transaction) =>
      transaction.description.toLowerCase().includes(term),
    );
  }, [transactions, debouncedQuery]);

  return { results, query, onSearch: setQuery };
}
