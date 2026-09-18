/**
 * Money formatting helpers.
 *
 * Values are stored and computed everywhere as signed integer cents. We only
 * convert to a floating-point dollar amount at the very last moment, for
 * display, inside these helpers.
 */

/**
 * Format signed integer cents as a localized currency string.
 *
 * @example formatCents(-8742)  // "-$87.42"
 * @example formatCents(320000) // "$3,200.00"
 */
export function formatCents(amountCents: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amountCents / 100);
}
