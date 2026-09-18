import { formatCents } from '../lib/money';
import type { Transaction } from '../types';

interface TransactionRowProps {
  transaction: Transaction;
  isSelected: boolean;
  onSelect: (transaction: Transaction) => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function TransactionRow({
  transaction,
  isSelected,
  onSelect,
}: TransactionRowProps) {
  const isCredit = transaction.amountCents > 0;

  return (
    <tr
      className={isSelected ? 'txn-row txn-row--selected' : 'txn-row'}
      onClick={() => onSelect(transaction)}
      tabIndex={0}
      role="button"
      aria-pressed={isSelected}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect(transaction);
        }
      }}
    >
      <td className="txn-description">{transaction.description}</td>
      <td>
        <span className={`badge badge--${transaction.status}`}>
          {transaction.status}
        </span>
      </td>
      <td className="txn-date">{formatDate(transaction.createdAt)}</td>
      <td
        className={
          isCredit ? 'txn-amount txn-amount--credit' : 'txn-amount'
        }
      >
        {formatCents(transaction.amountCents, transaction.currency)}
      </td>
    </tr>
  );
}
