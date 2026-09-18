import { TransactionRow } from './TransactionRow';
import type { Transaction } from '../types';

interface TransactionListProps {
  transactions: Transaction[];
  selectedId: string | null;
  onSelect: (transaction: Transaction) => void;
}

export function TransactionList({
  transactions,
  selectedId,
  onSelect,
}: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <p className="empty-state">No transactions match your search.</p>
    );
  }

  return (
    <table className="txn-table">
      <thead>
        <tr>
          <th>Description</th>
          <th>Status</th>
          <th>Date</th>
          <th className="txn-amount">Amount</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((transaction) => (
          <TransactionRow
            key={transaction.id}
            transaction={transaction}
            isSelected={transaction.id === selectedId}
            onSelect={onSelect}
          />
        ))}
      </tbody>
    </table>
  );
}
