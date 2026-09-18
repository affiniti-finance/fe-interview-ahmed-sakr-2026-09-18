import type {
  MerchantCategory,
  TransactionStatus,
  TransactionType,
} from '../types';

/**
 * Display labels for the enum-ish fields, plus the runtime option lists derived
 * from them.
 *
 * These are keyed `Record`s so TypeScript fails the build if a value is added
 * to a union in `types.ts` without a label here — the dropdowns and the server's
 * validation can't silently fall behind the domain model.
 */
export const STATUS_LABELS: Record<TransactionStatus, string> = {
  pending: 'Pending',
  posted: 'Posted',
  declined: 'Declined',
};

export const TYPE_LABELS: Record<TransactionType, string> = {
  purchase: 'Purchase',
  refund: 'Refund',
  transfer: 'Transfer',
  fee: 'Fee',
  interest: 'Interest',
};

export const CATEGORY_LABELS: Record<MerchantCategory, string> = {
  groceries: 'Groceries',
  travel: 'Travel',
  dining: 'Dining',
  payroll: 'Payroll',
  utilities: 'Utilities',
  entertainment: 'Entertainment',
  shopping: 'Shopping',
  health: 'Health',
  transfer: 'Transfer',
  income: 'Income',
  fees: 'Fees',
};

export const STATUS_OPTIONS = Object.keys(STATUS_LABELS) as TransactionStatus[];
export const TYPE_OPTIONS = Object.keys(TYPE_LABELS) as TransactionType[];
export const CATEGORY_OPTIONS = Object.keys(
  CATEGORY_LABELS,
) as MerchantCategory[];

export function isStatus(value: unknown): value is TransactionStatus {
  return typeof value === 'string' && value in STATUS_LABELS;
}

export function isType(value: unknown): value is TransactionType {
  return typeof value === 'string' && value in TYPE_LABELS;
}

export function isCategory(value: unknown): value is MerchantCategory {
  return typeof value === 'string' && value in CATEGORY_LABELS;
}
