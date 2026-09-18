import { formatCents } from '../lib/money';
import type { Transaction } from '../types';

interface AccountSummaryProps {
  transactions: Transaction[];
}

export function AccountSummary({ transactions }: AccountSummaryProps) {
  const balanceCents = transactions
    .filter((t) => t.status === 'posted')
    .reduce((sum, t) => sum + Math.abs(t.amountCents), 0);

  const pendingAuthCents = transactions
    .filter((t) => t.status === 'pending' && t.amountCents < 0)
    .reduce((sum, t) => sum + Math.abs(t.amountCents), 0);

  return (
    <section className="account-summary" aria-label="Account summary">
      <div className="summary-card">
        <span className="summary-label">Current balance</span>
        <span className="summary-value">{formatCents(balanceCents)}</span>
      </div>
      <div className="summary-card">
        <span className="summary-label">Pending authorizations</span>
        <span className="summary-value">{formatCents(pendingAuthCents)}</span>
      </div>
    </section>
  );
}
