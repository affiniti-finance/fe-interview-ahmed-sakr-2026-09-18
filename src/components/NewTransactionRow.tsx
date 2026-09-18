import { useState } from 'react';
import { EnumSelect } from './EnumSelect';
import { TXN_COLUMN_COUNT } from './TransactionList';
import type { NewTransaction } from '../lib/api';
import {
  emptyDraft,
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

interface NewTransactionRowProps {
  onCreate: (input: NewTransaction) => Promise<unknown>;
  onCancel: () => void;
}

/**
 * The inline "new transaction" row that sits at the top of the table.
 *
 * It renders as two `<tr>`s: the first lines its inputs up with the table's
 * columns, the second carries the fields that have no column of their own plus
 * the actions. A `<form>` can't wrap table rows, so Enter and Escape are
 * handled on the row itself.
 */
export function NewTransactionRow({
  onCreate,
  onCancel,
}: NewTransactionRowProps) {
  const [draft, setDraft] = useState<TransactionDraft>(emptyDraft);
  const [errors, setErrors] = useState<DraftErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const set = <K extends keyof TransactionDraft>(
    field: K,
    value: TransactionDraft[K],
  ) => {
    setDraft((current) => ({ ...current, [field]: value }));
    // Clear the field's error as soon as it's touched; re-validated on save.
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const save = async () => {
    if (isSaving) return;

    const { errors: nextErrors, value } = validateDraft(draft);
    setErrors(nextErrors);
    if (!value) return;

    setIsSaving(true);
    setSubmitError(null);
    try {
      await onCreate(value);
    } catch (cause) {
      setSubmitError((cause as Error).message);
      setIsSaving(false);
    }
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      void save();
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      onCancel();
    }
  };

  return (
    <>
      <tr className="txn-row--draft" onKeyDown={onKeyDown}>
        <td>
          <input
            className="field-control"
            // eslint-disable-next-line jsx-a11y/no-autofocus -- the row only
            // exists once the user has asked to add a transaction.
            autoFocus
            value={draft.description}
            placeholder="Description"
            aria-label="New transaction description"
            aria-invalid={errors.description !== undefined}
            onChange={(event) => set('description', event.target.value)}
          />
        </td>
        <td>
          <EnumSelect
            value={draft.status}
            options={STATUS_OPTIONS}
            labels={STATUS_LABELS}
            onChange={(status) => set('status', status)}
            aria-label="New transaction status"
          />
        </td>
        <td>
          <EnumSelect
            value={draft.type}
            options={TYPE_OPTIONS}
            labels={TYPE_LABELS}
            onChange={(type) => set('type', type)}
            aria-label="New transaction type"
          />
        </td>
        <td>
          <input
            type="datetime-local"
            className="field-control"
            value={draft.createdAt}
            aria-label="New transaction date"
            aria-invalid={errors.createdAt !== undefined}
            onChange={(event) => set('createdAt', event.target.value)}
          />
        </td>
        <td className="txn-amount">
          <input
            className="field-control field-control--amount"
            value={draft.amount}
            placeholder="-12.50"
            inputMode="decimal"
            aria-label="New transaction amount in dollars"
            aria-invalid={errors.amount !== undefined}
            onChange={(event) => set('amount', event.target.value)}
          />
        </td>
      </tr>

      <tr className="txn-row--draft" onKeyDown={onKeyDown}>
        <td colSpan={TXN_COLUMN_COUNT}>
          <div className="draft-extras">
            <label className="draft-field">
              <span className="draft-field-label">Category</span>
              <EnumSelect
                value={draft.merchantCategory}
                options={CATEGORY_OPTIONS}
                labels={CATEGORY_LABELS}
                onChange={(category) => set('merchantCategory', category)}
              />
            </label>

            <label className="draft-field">
              <span className="draft-field-label">Currency</span>
              <input
                className="field-control field-control--currency"
                value={draft.currency}
                maxLength={3}
                aria-invalid={errors.currency !== undefined}
                onChange={(event) => set('currency', event.target.value)}
              />
            </label>

            <p className="draft-hint">
              Negative amounts are charges, positive are credits.
            </p>

            <div className="draft-actions">
              <button
                type="button"
                className="button button--primary"
                onClick={() => void save()}
                disabled={isSaving}
              >
                {isSaving ? 'Saving…' : 'Save'}
              </button>
              <button
                type="button"
                className="button"
                onClick={onCancel}
                disabled={isSaving}
              >
                Cancel
              </button>
            </div>
          </div>

          {(submitError || Object.values(errors).some(Boolean)) && (
            <p className="field-error" role="alert">
              {submitError ??
                Object.values(errors).filter(Boolean).join(' ')}
            </p>
          )}
        </td>
      </tr>
    </>
  );
}
