import type { Transaction } from '../types';

/**
 * Newest first, with the id as a tiebreaker so the order is stable.
 *
 * Shared by the server store and the client cache so an edited or created row
 * lands in the same position on both sides without a refetch.
 */
export function byNewest(a: Transaction, b: Transaction): number {
  return b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id);
}
