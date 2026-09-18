export type TransactionStatus = 'pending' | 'posted' | 'declined';

export type TransactionType =
  | 'purchase'
  | 'refund'
  | 'transfer'
  | 'fee'
  | 'interest';

export type MerchantCategory =
  | 'groceries'
  | 'travel'
  | 'dining'
  | 'payroll'
  | 'utilities'
  | 'entertainment'
  | 'shopping'
  | 'health'
  | 'transfer'
  | 'income'
  | 'fees';

export interface Transaction {
  /** Stable identifier, e.g. "txn_1001". */
  id: string;
  /** Merchant or transfer label shown in the list. */
  description: string;
  /** Signed integer cents. Negative = debit/charge, positive = credit/deposit. */
  amountCents: number;
  /** ISO 4217 currency code. All seed rows are USD, but the field is modeled. */
  currency: string;
  status: TransactionStatus;
  type: TransactionType;
  merchantCategory: MerchantCategory;
  /** ISO 8601 timestamp. */
  createdAt: string;
}
