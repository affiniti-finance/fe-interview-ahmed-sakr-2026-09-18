import { useState } from 'react';
import { EnumSelect } from './EnumSelect';
import type { TransactionPatch } from '../lib/api';
import { formatCents } from '../lib/money';
import {
  draftFromTransaction,
  validateDraft,
  type DraftErrors,
  type TransactionDraft,
} from '../lib/transactionDraft';
import {
  CATEGORY_LABELS,
  CATEGORY_OPTIONS,
  STATUS_LABELS,
  STATUS_OPTIONS,
  TYPE_LABELS,
  TYPE_OPTIONS,
} from '../lib/transactionOptions';
import type { Transaction } from '../types';

interface TransactionDetailProps {
  transaction: Transaction;
  onClose: () => void;
  onUpdate: (patch: TransactionPatch) => Promise<unknown>;
  onDelete: () => Promise<void>;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

type Mode = 'view' | 'edit' | 'confirm-delete';

/**
 * The detail pane, and the home for the edit and delete actions.
 *
 * The caller gives this a `key` of the transaction id, so selecting a different
 * row remounts it and no draft can survive onto another transaction.
 */
export function TransactionDetail({
  transaction,
  onClose,
  onUpdate,
  onDelete,
}: TransactionDetailProps) {
  const [mode, setMode] = useState<Mode>('view');
  const [draft, setDraft] = useState<TransactionDraft>(() =>
    draftFromTransaction(transaction),
  );
  const [errors, setErrors] = useState<DraftErrors>({});
  const [actionError, setActionError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const set = <K extends keyof TransactionDraft>(
    field: K,
    value: TransactionDraft[K],
  ) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const startEditing = () => {
    setDraft(draftFromTransaction(transaction));
    setErrors({});
    setActionError(null);
    setMode('edit');
  };

  const cancelEditing = () => {
    setErrors({});
    setActionError(null);
    setMode('view');
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isBusy) return;

    const { errors: nextErrors, value } = validateDraft(draft);
    setErrors(nextErrors);
    if (!value) return;

    setIsBusy(true);
    setActionError(null);
    try {
      await onUpdate(value);
      setMode('view');
    } catch (cause) {
      setActionError((cause as Error).message);
    } finally {
      setIsBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (isBusy) return;

    setIsBusy(true);
    setActionError(null);
    try {
      await onDelete();
      // The pane unmounts on success, so there's no state to reset here.
    } catch (cause) {
      setActionError((cause as Error).message);
      setIsBusy(false);
    }
  };

  return (
    <aside className="txn-detail" aria-label="Transaction detail">
      <div className="txn-detail-header">
        <h2>{mode === 'edit' ? 'Edit transaction' : 'Transaction detail'}</h2>
        <button type="button" className="close-button" onClick={onClose}>
          Close
        </button>
      </div>

      {mode === 'edit' ? (
        <form className="txn-detail-form" onSubmit={save}>
          <label className="field">
            <span className="field-label">Description</span>
            <input
              className="field-control"
              value={draft.description}
              aria-invalid={errors.description !== undefined}
              onChange={(event) => set('description', event.target.value)}
            />
            {errors.description && (
              <span className="field-error">{errors.description}</span>
            )}
          </label>

          <label className="field">
            <span className="field-label">Amount</span>
            <input
              className="field-control"
              value={draft.amount}
              inputMode="decimal"
              aria-invalid={errors.amount !== undefined}
              onChange={(event) => set('amount', event.target.value)}
            />
            <span className="field-hint">
              Negative is a charge, positive is a credit.
            </span>
            {errors.amount && (
              <span className="field-error">{errors.amount}</span>
            )}
          </label>

          <label className="field">
            <span className="field-label">Status</span>
            <EnumSelect
              value={draft.status}
              options={STATUS_OPTIONS}
              labels={STATUS_LABELS}
              onChange={(status) => set('status', status)}
            />
          </label>

          <label className="field">
            <span className="field-label">Type</span>
            <EnumSelect
              value={draft.type}
              options={TYPE_OPTIONS}
              labels={TYPE_LABELS}
              onChange={(type) => set('type', type)}
            />
          </label>

          <label className="field">
            <span className="field-label">Category</span>
            <EnumSelect
              value={draft.merchantCategory}
              options={CATEGORY_OPTIONS}
              labels={CATEGORY_LABELS}
              onChange={(category) => set('merchantCategory', category)}
            />
          </label>

          <label className="field">
            <span className="field-label">Currency</span>
            <input
              className="field-control"
              value={draft.currency}
              maxLength={3}
              aria-invalid={errors.currency !== undefined}
              onChange={(event) => set('currency', event.target.value)}
            />
            {errors.currency && (
              <span className="field-error">{errors.currency}</span>
            )}
          </label>

          <label className="field">
            <span className="field-label">Date</span>
            <input
              type="datetime-local"
              className="field-control"
              value={draft.createdAt}
              aria-invalid={errors.createdAt !== undefined}
              onChange={(event) => set('createdAt', event.target.value)}
            />
            {errors.createdAt && (
              <span className="field-error">{errors.createdAt}</span>
            )}
          </label>

          {actionError && (
            <p className="field-error" role="alert">
              {actionError}
            </p>
          )}

          <div className="txn-detail-actions">
            <button
              type="submit"
              className="button button--primary"
              disabled={isBusy}
            >
              {isBusy ? 'Saving…' : 'Save changes'}
            </button>
            <button
              type="button"
              className="button"
              onClick={cancelEditing}
              disabled={isBusy}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <dl className="txn-detail-grid">
            <dt>Description</dt>
            <dd>{transaction.description}</dd>

            <dt>Amount</dt>
            <dd>{formatCents(transaction.amountCents, transaction.currency)}</dd>

            <dt>Status</dt>
            <dd>{STATUS_LABELS[transaction.status]}</dd>

            <dt>Type</dt>
            <dd>{TYPE_LABELS[transaction.type]}</dd>

            <dt>Category</dt>
            <dd>{CATEGORY_LABELS[transaction.merchantCategory]}</dd>

            <dt>Currency</dt>
            <dd>{transaction.currency}</dd>

            <dt>Date</dt>
            <dd>{formatDateTime(transaction.createdAt)}</dd>

            <dt>ID</dt>
            <dd className="txn-detail-id">{transaction.id}</dd>
          </dl>

          {actionError && (
            <p className="field-error" role="alert">
              {actionError}
            </p>
          )}

          {mode === 'confirm-delete' ? (
            <div className="txn-detail-actions txn-detail-actions--danger">
              <p className="confirm-text">Delete this transaction?</p>
              <button
                type="button"
                className="button button--danger"
                onClick={() => void confirmDelete()}
                disabled={isBusy}
              >
                {isBusy ? 'Deleting…' : 'Yes, delete'}
              </button>
              <button
                type="button"
                className="button"
                onClick={() => setMode('view')}
                disabled={isBusy}
              >
                Keep
              </button>
            </div>
          ) : (
            <div className="txn-detail-actions">
              <button
                type="button"
                className="button button--primary"
                onClick={startEditing}
              >
                Edit
              </button>
              <button
                type="button"
                className="button button--danger"
                onClick={() => setMode('confirm-delete')}
              >
                Delete
              </button>
            </div>
          )}
        </>
      )}
    </aside>
  );
}
