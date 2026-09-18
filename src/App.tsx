import { useState } from 'react';
import { AccountSummary } from './components/AccountSummary';
import { SearchBar } from './components/SearchBar';
import { TransactionDetail } from './components/TransactionDetail';
import { TransactionList } from './components/TransactionList';
import { useTransactions } from './hooks/useTransactions';
import type { Transaction } from './types';

export default function App() {
  const { transactions, results, query, onSearch } = useTransactions();
  const [selected, setSelected] = useState<Transaction | null>(null);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Account Transactions</h1>
        <p className="account-meta">Account acct_8842 · USD</p>
      </header>

      <AccountSummary transactions={transactions} />

      <div className="toolbar">
        <SearchBar value={query} onChange={onSearch} />
        <span className="result-count">{results.length} shown</span>
      </div>

      <div className="content">
        <TransactionList
          transactions={results}
          selectedId={selected?.id ?? null}
          onSelect={setSelected}
        />
        {selected && (
          <TransactionDetail
            transaction={selected}
            onClose={() => setSelected(null)}
          />
        )}
      </div>
    </div>
  );
}
