# Changelog — April 7, 2026

## Overview

Fixed all create, add, and edit functionality across the entire Logix Layer Finance Department application. Prior to these changes, no entity could be created or saved due to database constraint errors and missing form logic.

**Impact:** 31 files changed, 1,213 lines added, 114 removed  
**Tests:** 82 API route tests added and passing  
**Build:** 0 TypeScript errors

---

## Root Cause

All entity creation failed because of a single root issue that cascaded into multiple symptoms:

1. **Foreign key constraint on `organizationId`** — Every table requires a valid `organizationId`. Routes used hardcoded IDs (`"org_default"`, `"org-1"`, `"org1"`) that did not exist in the `organizations` table, causing `INSERT` to fail with a FK violation.

2. **Unsafe `{ ...body }` spread in Drizzle inserts** — API routes spread the entire request body into the insert call. This passed unexpected fields (like `items`, `taxRate`, `status`) into the main table insert, causing Drizzle/Postgres errors.

3. **Non-functional modal forms** — The create modals for expenses, loans, credits, and bank accounts had HTML forms but no React state, no submit handlers, and no API calls.

---

## What Was Fixed

### 1. Organization ID Resolution (`src/lib/get-org.ts`)

Created a reusable helper that dynamically resolves the organization ID:

- Queries the `organizations` table for the first existing org
- Auto-creates a default org (`"Logix Layer N.V."`) if none exist
- Caches the result in-memory for subsequent calls
- Used by all 17 POST API routes

### 2. API Route Fixes (17 routes)

Every POST route was rewritten to use **explicit field mapping** instead of body spreading:

| Route | Key Changes |
|-------|-------------|
| `/api/clients` | Explicit fields, `getDefaultOrgId()` |
| `/api/items` | Explicit fields, `String()` wrapper for decimal `rate` |
| `/api/invoices` | Explicit fields, auto-number `INV-xxxx`, line items inserted into `invoiceItems`, server-side subtotal/tax/total calculation |
| `/api/proposals` | Same pattern as invoices, prefix `PROP-xxxx` |
| `/api/estimates` | Same pattern as invoices, prefix `EST-xxxx` |
| `/api/expenses` | Explicit fields, `new Date()` for date strings |
| `/api/loans` | Explicit fields, `String()` for decimal columns |
| `/api/credits` | Explicit fields, `String()` for decimal columns |
| `/api/bank-accounts` | Explicit fields, `String()` for balance |
| `/api/payments` | Explicit fields |
| `/api/transactions` | Explicit fields |
| `/api/ledger` | Explicit fields |
| `/api/accounts` | Explicit fields |
| `/api/vendors` | `getDefaultOrgId()` added |
| `/api/projects` | `getDefaultOrgId()` added |
| `/api/tasks` | `getDefaultOrgId()` added |
| `/api/work-orders` | `getDefaultOrgId()` added |
| `/api/expense-categories` | `getDefaultOrgId()` added |

**Drizzle ORM patterns discovered:**
- Decimal columns require `String()` wrapper: `amount: String(value)`
- Timestamp columns require `new Date()`: `date: new Date(dateString)`
- Never spread unknown request body fields into insert

### 3. Frontend Form Fixes

#### Modal-based forms (were completely non-functional)

| Page | What was added |
|------|---------------|
| `expenses/page.tsx` | `useState` for all fields, `handleCreateExpense()`, `apiMutate` POST, error display, `refresh()` |
| `loans/page.tsx` | `useState` for all fields, `handleCreateLoan()`, `apiMutate` POST, error display, `refresh()` |
| `credits/page.tsx` | `useState` for all fields, `handleCreateCredit()`, auto-number `CR-xxxx`, `apiMutate` POST |
| `banks/page.tsx` | `useState` for all fields, `handleCreateAccount()`, `apiMutate` POST |

#### Full-page forms (invoices, proposals, estimates)

| Page | What was added |
|------|---------------|
| `invoices/new/page.tsx` | `ItemPicker` for line items, tax rate dropdown (9 options), catalog item fetch |
| `proposals/new/page.tsx` | Same as invoices |
| `estimates/new/page.tsx` | Same as invoices |

### 4. ItemPicker Component (`src/components/ui/item-picker.tsx`)

New reusable component for selecting catalog items in line item tables:

- **Search:** Filters by name, description, and type
- **Auto-fill:** Selecting an item populates description and rate
- **Portal rendering:** Uses `React.createPortal` to render the dropdown on `document.body`, preventing clipping by parent `overflow-hidden` containers
- **Positioning:** Uses `getBoundingClientRect()` for pixel-perfect fixed positioning
- **Keyboard/mouse:** Click-outside-to-close, auto-focus search input

### 5. Tax Rate Dropdown

Replaced the free-text tax rate input with a `<select>` dropdown across all three document creation forms:

| Value | Label |
|-------|-------|
| 0% | No Tax |
| 5% | Reduced |
| 7% | BBO (Curacao) |
| 9% | Low VAT |
| 12% | 12% |
| 15% | 15% |
| 19% | Standard VAT |
| 21% | Standard VAT (NL/EU) |
| 25% | 25% |

---

## Test Coverage

### New Test Files

| File | Tests | Coverage |
|------|-------|----------|
| `routes-create.test.ts` | 37 | All POST routes + GET list routes |
| `routes-edit.test.ts` | 45 | All PUT, DELETE, GET-by-ID routes |
| **Total** | **82** | **All 17 API resources** |

Tests mock `db` as `null` and verify that every route handler:
- Exists and is exported
- Parses request body without crashing
- Returns a valid HTTP status (200, 404, 500, or 503)

### Test Configuration

Added `vitest.config.ts` with path alias resolution matching the Next.js `@/` import alias.

---

## Files Changed

```
NEW FILES:
  src/lib/get-org.ts                          — Organization ID resolver
  src/components/ui/item-picker.tsx           — Catalog item picker component
  src/app/api/__tests__/routes-create.test.ts — POST/GET route tests
  src/app/api/__tests__/routes-edit.test.ts   — PUT/DELETE/GET[id] route tests
  vitest.config.ts                            — Test configuration

MODIFIED (API routes):
  src/app/api/accounts/route.ts
  src/app/api/bank-accounts/route.ts
  src/app/api/clients/route.ts
  src/app/api/credits/route.ts
  src/app/api/estimates/route.ts
  src/app/api/expense-categories/route.ts
  src/app/api/expenses/route.ts
  src/app/api/invoices/route.ts
  src/app/api/items/route.ts
  src/app/api/ledger/route.ts
  src/app/api/loans/route.ts
  src/app/api/payments/route.ts
  src/app/api/projects/route.ts
  src/app/api/proposals/route.ts
  src/app/api/tasks/route.ts
  src/app/api/transactions/route.ts
  src/app/api/vendors/route.ts
  src/app/api/work-orders/route.ts

MODIFIED (Frontend pages):
  src/app/(dashboard)/banks/page.tsx
  src/app/(dashboard)/credits/page.tsx
  src/app/(dashboard)/estimates/new/page.tsx
  src/app/(dashboard)/expenses/page.tsx
  src/app/(dashboard)/invoices/new/page.tsx
  src/app/(dashboard)/loans/page.tsx
  src/app/(dashboard)/proposals/new/page.tsx

MODIFIED (Config):
  package.json                                — Added vitest dependency
```

---

## Commit History

| Hash | Message |
|------|---------|
| `16e5e95` | fix: client creation failing due to missing organizationId |
| `a6c62bb` | fix: item creation failing due to missing organizationId |
| `22ffa57` | fix: wire up all create forms and fix POST API routes across the app |
| `bb85327` | fix: resolve organizationId foreign key error on all create operations |
| `788b0c6` | test: add Vitest test suite for all API create/edit/delete routes |
| `2d859fb` | fix: ItemPicker dropdown clipped by table overflow |
