import { useMemo, useState } from 'react';
import type { Transaction, TransactionStatus, TransactionType } from '../types';

export interface UseTransactionFilters {
  /** The input rows narrowed by the current status and type selections. */
  filtered: Transaction[];
  /** Selected statuses. Empty means "any status". */
  statuses: TransactionStatus[];
  /** Replace the selected statuses. */
  onStatusesChange: (next: TransactionStatus[]) => void;
  /** Selected types. Empty means "any type". */
  types: TransactionType[];
  /** Replace the selected types. */
  onTypesChange: (next: TransactionType[]) => void;
  /** True when at least one status or type filter is applied. */
  hasActiveFilters: boolean;
  /** Reset both selections. */
  onClearFilters: () => void;
}

/**
 * Owns the status and type selections and narrows whatever rows it is given.
 *
 * It takes the list as an argument rather than fetching, so it composes with
 * the search in `useTransactions`: search narrows the account, this narrows the
 * search. Filtering is derived, not stored, and applies immediately — picking a
 * filter is a deliberate action, unlike typing.
 */
export function useTransactionFilters(
  transactions: Transaction[],
): UseTransactionFilters {
  const [statuses, setStatuses] = useState<TransactionStatus[]>([]);
  const [types, setTypes] = useState<TransactionType[]>([]);

  const filtered = useMemo(() => {
    // An empty selection is "no filter", not "match nothing".
    if (statuses.length === 0 && types.length === 0) return transactions;

    return transactions.filter(
      (transaction) =>
        (statuses.length === 0 || statuses.includes(transaction.status)) &&
        (types.length === 0 || types.includes(transaction.type)),
    );
  }, [transactions, statuses, types]);

  const onClearFilters = () => {
    setStatuses([]);
    setTypes([]);
  };

  return {
    filtered,
    statuses,
    onStatusesChange: setStatuses,
    types,
    onTypesChange: setTypes,
    hasActiveFilters: statuses.length > 0 || types.length > 0,
    onClearFilters,
  };
}
