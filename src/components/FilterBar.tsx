import type { TransactionStatus, TransactionType } from '../types';

/**
 * Option lists for the two filters. They're keyed `Record`s so TypeScript fails
 * the build if a status or type is ever added to the union without getting a
 * label here — the dropdowns can't silently fall behind the domain model.
 */
const STATUS_LABELS: Record<TransactionStatus, string> = {
  pending: 'Pending',
  posted: 'Posted',
  declined: 'Declined',
};

const TYPE_LABELS: Record<TransactionType, string> = {
  purchase: 'Purchase',
  refund: 'Refund',
  transfer: 'Transfer',
  fee: 'Fee',
  interest: 'Interest',
};

const STATUS_OPTIONS = Object.keys(STATUS_LABELS) as TransactionStatus[];
const TYPE_OPTIONS = Object.keys(TYPE_LABELS) as TransactionType[];

interface FilterBarProps {
  statuses: TransactionStatus[];
  onStatusesChange: (next: TransactionStatus[]) => void;
  types: TransactionType[];
  onTypesChange: (next: TransactionType[]) => void;
  hasActiveFilters: boolean;
  onClear: () => void;
}

/** Reads the current selection off a native multi-select. */
function selectedValues<T extends string>(select: HTMLSelectElement): T[] {
  return Array.from(select.selectedOptions, (option) => option.value as T);
}

export function FilterBar({
  statuses,
  onStatusesChange,
  types,
  onTypesChange,
  hasActiveFilters,
  onClear,
}: FilterBarProps) {
  return (
    <section className="filter-bar" aria-label="Filter transactions">
      <div className="filter">
        <label className="filter-label" htmlFor="filter-status">
          Status
        </label>
        <select
          id="filter-status"
          className="filter-select"
          multiple
          size={STATUS_OPTIONS.length}
          value={statuses}
          onChange={(event) =>
            onStatusesChange(selectedValues<TransactionStatus>(event.target))
          }
          aria-describedby="filter-hint"
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </div>

      <div className="filter">
        <label className="filter-label" htmlFor="filter-type">
          Type
        </label>
        <select
          id="filter-type"
          className="filter-select"
          multiple
          size={TYPE_OPTIONS.length}
          value={types}
          onChange={(event) =>
            onTypesChange(selectedValues<TransactionType>(event.target))
          }
          aria-describedby="filter-hint"
        >
          {TYPE_OPTIONS.map((type) => (
            <option key={type} value={type}>
              {TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-actions">
        <p id="filter-hint" className="filter-hint">
          Nothing selected shows everything. Ctrl/⌘-click to select more than
          one.
        </p>
        {hasActiveFilters && (
          <button type="button" className="filter-clear" onClick={onClear}>
            Clear filters
          </button>
        )}
      </div>
    </section>
  );
}
