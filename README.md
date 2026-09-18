# Account Transactions Dashboard

A small internal admin view for inspecting the transactions on a customer's
card/account — the kind of screen an engineer here works on day to day. It loads
a single account's transactions, shows a current balance and pending
authorizations, and lets you search and inspect individual transactions.

Built with **Vite + React 18 + TypeScript**. No backend — data is seeded from a
local module.

---

## Prerequisites

- **Node 18 or newer** (`node --version` to check)
- Any one of npm, yarn, or pnpm — use whichever you prefer

## Setup

Install dependencies, then start the dev server. Pick the package manager you
like; the commands are equivalent.

```bash
# npm
npm install
npm run dev

# yarn
yarn
yarn dev

# pnpm
pnpm install
pnpm dev
```

Then open the URL Vite prints (usually http://localhost:5173).

Other scripts: `build` (type-check + production build), `preview` (serve the
build), `typecheck` (types only).

---

## A note on tooling

**Using AI assistants is allowed and expected.** Use whatever you'd normally
reach for — editor, docs, search, an AI assistant, all of it. We're interested
in how you actually work, so please **think out loud** as you go.

---

## Your tasks

### Task 1 — Debug

> A customer reported their dashboard is showing the wrong numbers. Walk us
> through how you'd find and fix it. Use whatever tools you normally would,
> including AI — we want to see how you actually work, so please think out loud.

### Task 2 — Extend

> Add the ability to filter transactions by **status** and **type**, working
> alongside the existing search.

### Task 3 — Extend further

> Add the ability to **create**, **edit**, and **delete** transactions. Keep the
> list, search, filters, and the account summary consistent as transactions are
> added, changed, and removed.

---

## Domain model

Each transaction (`src/types.ts`):

| Field              | Notes                                                                 |
| ------------------ | --------------------------------------------------------------------- |
| `id`               | e.g. `txn_1001`                                                       |
| `description`      | merchant or transfer label                                            |
| `amountCents`      | **signed integer cents** — negative = debit/charge, positive = credit |
| `currency`         | ISO code (`USD` for all seed rows)                                    |
| `status`           | `pending` \| `posted` \| `declined`                                   |
| `type`             | `purchase` \| `refund` \| `transfer` \| `fee` \| `interest`           |
| `merchantCategory` | e.g. `groceries`, `travel`, `dining`, `payroll`                       |
| `createdAt`        | ISO 8601 timestamp                                                    |

Money is stored and computed as integer cents, and only formatted to dollars at
display time (`src/lib/money.ts`).

## Project layout

```
src/
  App.tsx                  app shell + layout
  main.tsx                 entry point
  types.ts                 domain types
  data/seed.ts             ~25 seeded transactions
  hooks/useTransactions.ts transactions + search
  lib/money.ts             cents → display formatting
  lib/debounce.ts          debounce utility
  components/
    AccountSummary.tsx     balance + pending authorizations
    SearchBar.tsx          description search input
    TransactionList.tsx    table
    TransactionRow.tsx     a single row
    TransactionDetail.tsx  detail panel
```
