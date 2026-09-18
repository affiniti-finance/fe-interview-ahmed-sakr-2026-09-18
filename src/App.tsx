import { useState } from 'react';
import { AccountSummary } from './components/AccountSummary';
import { FilterBar } from './components/FilterBar';
import { NewTransactionRow } from './components/NewTransactionRow';
import { SearchBar } from './components/SearchBar';
import { TransactionDetail } from './components/TransactionDetail';
import { TransactionList } from './components/TransactionList';
import { useTransactionFilters } from './hooks/useTransactionFilters';
import { useTransactionSearch } from './hooks/useTransactionSearch';
import { useTransactions } from './hooks/useTransactions';
import type { NewTransaction } from './lib/api';

export default function App() {
  const { transactions, isLoading, error, create, update, remove } =
    useTransactions();
  // Search narrows the account, filters narrow the search results.
  const { results, query, onSearch } = useTransactionSearch(transactions);
  const {
    filtered,
    statuses,
    onStatusesChange,
    types,
    onTypesChange,
    hasActiveFilters,
    onClearFilters,
  } = useTransactionFilters(results);

  // The id, not the row, so the pane always reflects the latest server copy and
  // closes by itself when the transaction is deleted.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const selected =
    transactions.find((transaction) => transaction.id === selectedId) ?? null;
  const isNarrowed = hasActiveFilters || query.trim() !== '';

  const onCreate = async (input: NewTransaction) => {
    const created = await create(input);
    setIsCreating(false);
    setSelectedId(created.id);
    // A new row can land outside the current search or filters, which otherwise
    // looks like the save silently failed.
    setNotice(
      isNarrowed
        ? `Created ${created.id}. It's hidden by the current search or filters.`
        : null,
    );
  };

  const onStartCreate = () => {
    setNotice(null);
    setIsCreating(true);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Account Transactions</h1>
        <p className="account-meta">Account acct_8842 · USD</p>
      </header>

      {/* Summary intentionally reads the unfiltered account: the balance is a
          fact about the account, not about the current view. */}
      <AccountSummary transactions={transactions} />

      <div className="toolbar">
        <SearchBar value={query} onChange={onSearch} />
        <span className="result-count">
          {isNarrowed
            ? `${filtered.length} of ${transactions.length} shown`
            : `${filtered.length} shown`}
        </span>
        <button
          type="button"
          className="button button--primary"
          onClick={onStartCreate}
          disabled={isCreating || isLoading}
        >
          New transaction
        </button>
      </div>

      <FilterBar
        statuses={statuses}
        onStatusesChange={onStatusesChange}
        types={types}
        onTypesChange={onTypesChange}
        hasActiveFilters={hasActiveFilters}
        onClear={onClearFilters}
      />

      {notice && (
        <p className="notice" role="status">
          {notice}
          <button
            type="button"
            className="notice-dismiss"
            onClick={() => setNotice(null)}
          >
            Dismiss
          </button>
        </p>
      )}

      {error && (
        <p className="notice notice--error" role="alert">
          Couldn&apos;t load transactions: {error}
        </p>
      )}

      <div className="content">
        {isLoading ? (
          <p className="empty-state">Loading transactions…</p>
        ) : (
          <TransactionList
            transactions={filtered}
            selectedId={selectedId}
            onSelect={(transaction) => setSelectedId(transaction.id)}
            emptyMessage={
              hasActiveFilters
                ? 'No transactions match your search and filters.'
                : 'No transactions match your search.'
            }
            draftRow={
              isCreating ? (
                <NewTransactionRow
                  onCreate={onCreate}
                  onCancel={() => setIsCreating(false)}
                />
              ) : null
            }
          />
        )}

        {selected && (
          <TransactionDetail
            key={selected.id}
            transaction={selected}
            onClose={() => setSelectedId(null)}
            onUpdate={(patch) => update(selected.id, patch)}
            onDelete={async () => {
              await remove(selected.id);
              setSelectedId(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
