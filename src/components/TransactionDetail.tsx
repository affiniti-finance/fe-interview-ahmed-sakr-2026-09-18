import { formatCents } from '../lib/money';
import type { Transaction } from '../types';

interface TransactionDetailProps {
  transaction: Transaction;
  onClose: () => void;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function TransactionDetail({
  transaction,
  onClose,
}: TransactionDetailProps) {
  return (
    <aside className="txn-detail" aria-label="Transaction detail">
      <div className="txn-detail-header">
        <h2>Transaction detail</h2>
        <button type="button" className="close-button" onClick={onClose}>
          Close
        </button>
      </div>

      <dl className="txn-detail-grid">
        <dt>Description</dt>
        <dd>{transaction.description}</dd>

        <dt>Amount</dt>
        <dd>{formatCents(transaction.amountCents, transaction.currency)}</dd>

        <dt>Status</dt>
        <dd>{transaction.status}</dd>

        <dt>Type</dt>
        <dd>{transaction.type}</dd>

        <dt>Category</dt>
        <dd>{transaction.merchantCategory}</dd>

        <dt>Currency</dt>
        <dd>{transaction.currency}</dd>

        <dt>Date</dt>
        <dd>{formatDateTime(transaction.createdAt)}</dd>

        <dt>ID</dt>
        <dd className="txn-detail-id">{transaction.id}</dd>
      </dl>
    </aside>
  );
}
