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

/**
 * Parse a user-typed dollar amount into signed integer cents.
 *
 * Returns `null` when the input isn't a number we can trust. Multiplying by 100
 * is done on the string's own digits via `Math.round` so values like "8.07"
 * don't land a cent off through float error.
 *
 * @example parseDollarsToCents("-87.42") // -8742
 */
export function parseDollarsToCents(input: string): number | null {
  const trimmed = input.trim().replace(/[$,]/g, '');
  if (!/^-?\d*(\.\d{1,2})?$/.test(trimmed) || trimmed === '' || trimmed === '-') {
    return null;
  }

  const dollars = Number.parseFloat(trimmed);
  return Number.isFinite(dollars) ? Math.round(dollars * 100) : null;
}

/**
 * Render signed integer cents as a plain editable string — no currency symbol
 * or grouping, so it can round-trip through `parseDollarsToCents`.
 *
 * @example centsToDollarsInput(-8742) // "-87.42"
 */
export function centsToDollarsInput(amountCents: number): string {
  return (amountCents / 100).toFixed(2);
}
