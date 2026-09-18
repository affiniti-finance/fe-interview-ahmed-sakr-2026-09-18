import { centsToDollarsInput, parseDollarsToCents } from './money';
import { amountSignError } from './transactionRules';
import type { NewTransaction } from './api';
import type {
  MerchantCategory,
  Transaction,
  TransactionStatus,
  TransactionType,
} from '../types';

/**
 * The editable shape of a transaction, with every field held as the string the
 * input actually contains. Create and edit both go through this, so validation
 * and the cents/dollars conversion live in one place instead of in each form.
 */
export interface TransactionDraft {
  description: string;
  /** Dollars, as typed. Negative = charge, positive = credit. */
  amount: string;
  currency: string;
  status: TransactionStatus;
  type: TransactionType;
  merchantCategory: MerchantCategory;
  /** Local `datetime-local` value, i.e. "YYYY-MM-DDTHH:mm". */
  createdAt: string;
}

export type DraftErrors = Partial<Record<keyof TransactionDraft, string>>;

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

/** ISO timestamp → the local value a `datetime-local` input expects. */
export function toDateTimeInput(iso: string): string {
  const date = new Date(iso);
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

export function emptyDraft(): TransactionDraft {
  return {
    description: '',
    amount: '',
    currency: 'USD',
    status: 'pending',
    type: 'purchase',
    merchantCategory: 'shopping',
    createdAt: toDateTimeInput(new Date().toISOString()),
  };
}

export function draftFromTransaction(
  transaction: Transaction,
): TransactionDraft {
  return {
    description: transaction.description,
    amount: centsToDollarsInput(transaction.amountCents),
    currency: transaction.currency,
    status: transaction.status,
    type: transaction.type,
    merchantCategory: transaction.merchantCategory,
    createdAt: toDateTimeInput(transaction.createdAt),
  };
}

export interface DraftValidation {
  errors: DraftErrors;
  /** Present only when `errors` is empty. */
  value?: NewTransaction;
}

/**
 * Validates a draft and converts it to the payload the API takes.
 *
 * The server validates too — this exists to give immediate, per-field feedback,
 * not to be the only line of defence.
 */
export function validateDraft(draft: TransactionDraft): DraftValidation {
  const errors: DraftErrors = {};

  const description = draft.description.trim();
  if (description === '') {
    errors.description = 'Description is required.';
  }

  const amountCents = parseDollarsToCents(draft.amount);
  if (amountCents === null) {
    errors.amount = 'Enter an amount like -12.50 or 320.00.';
  } else {
    // Cross-field rule, so it can only run once the amount itself parses.
    const signError = amountSignError(draft.type, amountCents);
    if (signError) {
      errors.amount = signError;
    }
  }

  const currency = draft.currency.trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) {
    errors.currency = 'Use a 3-letter code, e.g. USD.';
  }

  const createdAt = new Date(draft.createdAt);
  if (Number.isNaN(createdAt.getTime())) {
    errors.createdAt = 'Enter a valid date and time.';
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  return {
    errors,
    value: {
      description,
      amountCents: amountCents as number,
      currency,
      status: draft.status,
      type: draft.type,
      merchantCategory: draft.merchantCategory,
      createdAt: createdAt.toISOString(),
    },
  };
}
