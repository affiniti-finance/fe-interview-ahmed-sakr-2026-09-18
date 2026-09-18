import type { TransactionType } from '../types';

/**
 * Cross-field rules that a single field can't check on its own.
 *
 * Shared by the draft validation and the server store so the form and the API
 * can't drift apart — a client that skips the form still can't write a row the
 * UI would reject.
 */

/**
 * A refund returns money to the customer, so it has to be a credit. Amounts are
 * signed cents, and credits are positive.
 *
 * Purchases and fees lean negative and interest leans positive, but transfers
 * legitimately run both ways, so only refunds are enforced for now.
 *
 * @returns an error message, or `null` when the amount is allowed.
 */
export function amountSignError(
  type: TransactionType,
  amountCents: number,
): string | null {
  if (type === 'refund' && amountCents <= 0) {
    return 'A refund must be a positive amount — the money goes back to the customer.';
  }
  return null;
}
