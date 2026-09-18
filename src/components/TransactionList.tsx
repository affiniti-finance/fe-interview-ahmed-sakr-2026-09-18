import type { ReactNode } from 'react';
import { TransactionRow } from './TransactionRow';
import type { Transaction } from '../types';

/** Kept next to the header cells so `colSpan` users can't drift out of sync. */
export const TXN_COLUMN_COUNT = 5;

interface TransactionListProps {
  transactions: Transaction[];
  selectedId: string | null;
  onSelect: (transaction: Transaction) => void;
  /** Shown when nothing matches; the caller knows which filters are applied. */
  emptyMessage?: string;
  /** Inline draft row, rendered above the results. */
  draftRow?: ReactNode;
}

export function TransactionList({
  transactions,
  selectedId,
  onSelect,
  emptyMessage = 'No transactions match your search.',
  draftRow,
}: TransactionListProps) {
  // The draft row still needs a table to live in, so it wins over the empty state.
  if (transactions.length === 0 && !draftRow) {
    return <p className="empty-state">{emptyMessage}</p>;
  }

  return (
    <table className="txn-table">
      <thead>
        <tr>
          <th>Description</th>
          <th>Status</th>
          <th>Type</th>
          <th>Date</th>
          <th className="txn-amount">Amount</th>
        </tr>
      </thead>
      <tbody>
        {draftRow}
        {transactions.map((transaction) => (
          <TransactionRow
            key={transaction.id}
            transaction={transaction}
            isSelected={transaction.id === selectedId}
            onSelect={onSelect}
          />
        ))}
        {transactions.length === 0 && (
          <tr>
            <td colSpan={TXN_COLUMN_COUNT} className="txn-empty-cell">
              {emptyMessage}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
