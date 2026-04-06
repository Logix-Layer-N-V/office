# Logix Layer Finance Dashboard — Developer Documentation

**Version:** 0.1.0
**Last Updated:** 2026-04-06
**Repository:** Internal Finance Department (Logix Layer N.V.)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Getting Started](#2-getting-started-developer-setup)
3. [Project Structure](#3-project-structure)
4. [Design System](#4-design-system)
5. [Data Fetching Pattern](#5-data-fetching-pattern)
6. [API Endpoints](#6-api-endpoints)
7. [Database Schema](#7-database-schema-prisma-models)
8. [TypeScript Types](#8-typescript-types)
9. [Key Components](#9-key-components)
10. [View Modes](#10-view-modes)
11. [Settings Architecture](#11-settings-architecture)
12. [Known Issues & Troubleshooting](#12-known-issues--troubleshooting)

---

## 1. Project Overview

**Logix Layer Finance Dashboard** is the internal finance department application for Logix Layer N.V. It provides comprehensive tools for managing clients, proposals, estimates, invoices, payments, banking, expenses, credits, loans, and double-entry bookkeeping.

### Technology Stack

- **Framework:** Next.js 16 (App Router, Turbopack bundler)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v3
- **Database:** PostgreSQL via Neon (serverless)
- **ORM:** Prisma 7
- **Authentication:** Clerk
- **Deployment:** Vercel
- **Charts/Visualization:** Recharts
- **Icons:** Lucide React

### Key Features

- **CRM:** Client management with status tracking
- **Sales:** Proposals and estimates with templates
- **Billing:** Invoice creation, payment tracking, and outstanding AR
- **Banking:** Multi-account support, balance tracking, cryptocurrency support
- **Expenses:** Category-based tracking with approval workflows
- **Credits:** Credit management with expiration tracking
- **Loans:** Loan tracking with interest calculations
- **General Ledger:** Double-entry bookkeeping with chart of accounts
- **Reports:** Financial reporting and KPI dashboards
- **Projects & Tasks:** Project management (List/Kanban/Gantt/Timeline views)
- **Scrum:** Sprint board, backlog, burndown charts, velocity metrics
- **Work Orders:** Work order management with multiple view modes
- **Calendar:** Multi-view calendar (Month/Week/Day/Year/Custom)
- **Settings:** Role-based access control, import/export, integrations

---

## 2. Getting Started (Developer Setup)

### Prerequisites

- **Node.js:** 20.x or higher
- **npm:** Latest stable version
- **Git:** For version control
- **Database:** PostgreSQL via Neon (connection string required)
- **Auth:** Clerk account and API keys

### Environment Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd "Logix Layer Fin Department"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env.local` file** in the project root with:
   ```env
   DATABASE_URL=postgresql://user:password@host/database
   CLERK_SECRET_KEY=sk_live_...
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/overview
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/overview
   ```

   **Reference:** See `.env.example` in the project root for all available variables.

4. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

5. **Push database schema:**
   ```bash
   npx prisma db push
   ```

   (Skips migrations; useful for development)

6. **Start development server:**
   ```bash
   npm run dev
   ```

   Opens at `http://localhost:3000`

### Development Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Next.js dev server (Turbopack) |
| `npm run build` | Build for production |
| `npm start` | Run production build locally |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push Prisma schema to database |
| `npm run db:seed` | Seed database with test data |
| `npm run db:studio` | Open Prisma Studio GUI |

### Database Access (Development)

- **Prisma Studio:** `npm run db:studio` opens interactive database GUI at `http://localhost:5555`
- **Query builder:** See `/prisma/schema.prisma` for model definitions
- **Seed data:** Run `npm run db:seed` to populate initial data (if `prisma/seed.ts` exists)

### Troubleshooting Initial Setup

**Issue:** Turbopack JSON-RPC error on first run

**Solution:**
```bash
# Delete Next.js cache
rm -rf .next

# On PowerShell:
Remove-Item .next -Recurse -Force

# Restart dev server
npm run dev
```

---

## 3. Project Structure

```
logix-layer-fin/
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx           # Main dashboard layout (sidebar + header)
│   │   │   ├── overview/            # Dashboard KPI page
│   │   │   ├── clients/             # CRM — client list, detail, edit
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   ├── [id]/page.tsx
│   │   │   │   └── [id]/edit/page.tsx
│   │   │   ├── items/               # Service/product catalog
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   ├── [id]/page.tsx
│   │   │   │   └── [id]/edit/page.tsx
│   │   │   ├── proposals/           # Sales proposals
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   ├── [id]/page.tsx
│   │   │   │   ├── [id]/edit/page.tsx
│   │   │   │   └── [id]/preview/page.tsx
│   │   │   ├── estimates/           # Cost estimates
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   ├── [id]/page.tsx
│   │   │   │   ├── [id]/edit/page.tsx
│   │   │   │   └── [id]/preview/page.tsx
│   │   │   ├── invoices/            # Invoice management
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   ├── [id]/page.tsx
│   │   │   │   ├── [id]/edit/page.tsx
│   │   │   │   └── [id]/preview/page.tsx
│   │   │   ├── payments/            # Payment tracking
│   │   │   │   ├── page.tsx
│   │   │   │   └── new/page.tsx
│   │   │   ├── projects/            # Project management
│   │   │   │   ├── page.tsx         # List, Kanban, Gantt, Timeline views
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── sprints/             # Scrum board
│   │   │   │   └── page.tsx         # Sprint Board, Backlog, Burndown, Velocity
│   │   │   ├── work-orders/         # Work order management
│   │   │   │   ├── page.tsx         # List, Kanban, Gantt, Timeline views
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── tasks/               # Task management
│   │   │   │   ├── page.tsx         # List, Kanban, Gantt, Timeline views
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── calendar/            # Calendar
│   │   │   │   └── page.tsx         # Month, Week, Day, Year, Custom views
│   │   │   ├── banks/               # Banking + crypto
│   │   │   │   └── page.tsx
│   │   │   ├── expenses/            # Expense tracking
│   │   │   │   └── page.tsx
│   │   │   ├── credits/             # Credit management
│   │   │   │   └── page.tsx
│   │   │   ├── loans/               # Loan tracking
│   │   │   │   └── page.tsx
│   │   │   ├── general-ledger/      # Double-entry bookkeeping
│   │   │   │   └── page.tsx
│   │   │   ├── reports/             # Financial reports
│   │   │   │   └── page.tsx
│   │   │   ├── settings/            # Settings
│   │   │   │   └── page.tsx         # General, Users & Roles, Documentation
│   │   │   ├── notifications/       # Notification center
│   │   │   │   └── page.tsx
│   │   │   └── docs/                # User documentation
│   │   │       └── page.tsx
│   │   ├── api/
│   │   │   ├── dashboard/route.ts
│   │   │   ├── clients/route.ts
│   │   │   ├── clients/[id]/route.ts
│   │   │   ├── items/route.ts
│   │   │   ├── items/[id]/route.ts
│   │   │   ├── proposals/route.ts
│   │   │   ├── proposals/[id]/route.ts
│   │   │   ├── estimates/route.ts
│   │   │   ├── estimates/[id]/route.ts
│   │   │   ├── invoices/route.ts
│   │   │   ├── invoices/[id]/route.ts
│   │   │   ├── payments/route.ts
│   │   │   ├── payments/[id]/route.ts
│   │   │   ├── bank-accounts/route.ts
│   │   │   ├── bank-accounts/[id]/route.ts
│   │   │   ├── transactions/route.ts
│   │   │   ├── transactions/[id]/route.ts
│   │   │   ├── expenses/route.ts
│   │   │   ├── expenses/[id]/route.ts
│   │   │   ├── credits/route.ts
│   │   │   ├── credits/[id]/route.ts
│   │   │   ├── loans/route.ts
│   │   │   ├── loans/[id]/route.ts
│   │   │   ├── ledger/route.ts
│   │   │   ├── ledger/[id]/route.ts
│   │   │   ├── accounts/route.ts
│   │   │   ├── projects/route.ts
│   │   │   ├── tasks/route.ts
│   │   │   ├── work-orders/route.ts
│   │   │   ├── users/route.ts
│   │   │   └── users/[id]/route.ts
│   │   ├── globals.css              # Global styles & design system
│   │   └── layout.tsx               # Root layout
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── header.tsx           # Header with breadcrumb, search, notifications, profile
│   │   │   └── sidebar.tsx          # Collapsible sidebar navigation
│   │   └── ui/
│   │       ├── client-select.tsx    # Reusable client dropdown + create modal
│   │       ├── global-search.tsx    # Ctrl+K spotlight search
│   │       ├── quick-create.tsx     # Quick creation dropdown (+ button)
│   │       └── ...other components
│   ├── constants/
│   │   └── navigation.ts            # Sidebar nav configuration & routes
│   ├── hooks/
│   │   └── use-api.ts               # useApi<T> and apiMutate helpers
│   ├── lib/
│   │   ├── utils.ts                 # Helper functions (currency, date, status colors)
│   │   ├── prisma.ts                # Prisma client singleton
│   │   ├── mock-data.ts             # Mock data for development
│   │   └── mock-detail.ts           # Mock detail data
│   └── types/
│       └── index.ts                 # All TypeScript types & enums
├── prisma/
│   ├── schema.prisma                # Database schema definition
│   └── seed.ts                      # Database seeding script
├── public/
│   └── ...                          # Static assets
├── .env.example                     # Environment variables template
├── .env.local                       # Local environment (git-ignored)
├── .gitignore                       # Git ignore rules
├── next.config.ts                   # Next.js configuration
├── tailwind.config.ts               # Tailwind CSS configuration
├── tsconfig.json                    # TypeScript configuration
├── package.json                     # Dependencies & scripts
├── postcss.config.js                # PostCSS configuration
├── eslint.config.mjs                # ESLint configuration
└── vercel.json                      # Vercel deployment config
```

---

## 4. Design System

### Colors

The design system uses a carefully chosen color palette:

| Token | Color | Usage |
|-------|-------|-------|
| `brand-600` | `#3B2D8E` | Primary brand color |
| `brand-700` | `#2e2370` | Darker variant for hover states |
| `brand-500` | `#5442a8` | Lighter variant |
| `accent-500` | `#6DC944` | Accent/success color |
| `surface-50` to `surface-900` | Gray scale | Neutral backgrounds & borders |
| `surface-0` | `#ffffff` | Pure white |

### CSS Classes

Core design system classes available in `src/app/globals.css`:

| Class | Purpose |
|-------|---------|
| `.card` | Card container (**NO padding**—add `p-4` or `p-5` explicitly) |
| `.btn-primary` | Primary button (brand color) |
| `.btn-secondary` | Secondary button (outline) |
| `.btn-ghost` | Ghost button (minimal) |
| `.input` | Form input field |
| `.label` | Form label |
| `.table-compact` | Compact table styling |
| `.badge-success` | Success badge (green) |
| `.badge-warning` | Warning badge (yellow) |
| `.badge-danger` | Danger badge (red) |
| `.badge-info` | Info badge (blue) |
| `.badge-neutral` | Neutral badge (gray) |
| `.text-2xs` | Extra-small text (0.625rem) |

### Important Notes

⚠️ **The `.card` class has NO padding!** Always add padding explicitly:

```tsx
<div className="card p-4">
  {/* content */}
</div>
```

Not:
```tsx
<div className="card">
  {/* Looks cramped! */}
</div>
```

### Responsive Design

Tailwind's responsive utilities are used:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* Responsive grid */}
</div>
```

---

## 5. Data Fetching Pattern

### `useApi<T>` Hook

For GET requests in client components:

```tsx
"use client"
import { useApi } from "@/hooks/use-api"
import { Invoice } from "@/types"

export function InvoiceList() {
  const { data, loading, error, refresh } = useApi<Invoice[]>(
    "/api/invoices",
    []
  )

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      {data.map(invoice => (
        <div key={invoice.id}>{invoice.number}</div>
      ))}
      <button onClick={refresh}>Refresh</button>
    </div>
  )
}
```

**Interface:**
```typescript
interface UseApiResult<T> {
  data: T                    // Fetched data (or initialData while loading)
  loading: boolean          // true while fetching
  error: string | null      // null if successful
  refresh: () => void       // Manual refetch function
}
```

### `apiMutate<T>` Function

For POST, PUT, PATCH, DELETE requests:

```tsx
import { apiMutate } from "@/hooks/use-api"
import { Invoice } from "@/types"

async function createInvoice(invoice: Invoice) {
  try {
    const result = await apiMutate<Invoice>(
      "/api/invoices",
      "POST",
      invoice
    )
    console.log("Created:", result)
  } catch (error) {
    console.error("Failed:", error.message)
  }
}
```

**Signature:**
```typescript
apiMutate<T>(
  url: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  body?: unknown
): Promise<T>
```

### Graceful Fallback

If `DATABASE_URL` is not configured, all API routes return empty arrays:

```typescript
// GET /api/invoices
// Returns: [] (empty array)

// POST /api/invoices
// Returns: { id: "mock-id", ... } (mock object)
```

This allows development without a database.

---

## 6. API Endpoints

All endpoints require Clerk authentication and return JSON.

### Dashboard

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/dashboard` | GET | Fetch KPI metrics and dashboard data |

**Response:**
```json
{
  "totalRevenue": 150000,
  "outstandingInvoices": 25000,
  "totalExpenses": 45000,
  "netIncome": 80000,
  "revenueChange": "+12%",
  "expenseChange": "-5%",
  "invoicesPaid": 8,
  "invoicesPending": 3,
  "cashOnHand": 120000,
  "proposalsWon": 5,
  "proposalsTotal": 8
}
```

### Clients (CRM)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/clients` | GET | List all clients |
| `/api/clients` | POST | Create new client |
| `/api/clients/[id]` | GET | Get client details |
| `/api/clients/[id]` | PUT | Update client |
| `/api/clients/[id]` | DELETE | Delete client |

### Items (Catalog)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/items` | GET | List all items |
| `/api/items` | POST | Create new item |
| `/api/items/[id]` | GET | Get item details |
| `/api/items/[id]` | PUT | Update item |
| `/api/items/[id]` | DELETE | Delete item |

### Proposals

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/proposals` | GET | List all proposals |
| `/api/proposals` | POST | Create new proposal |
| `/api/proposals/[id]` | GET | Get proposal details |
| `/api/proposals/[id]` | PUT | Update proposal |
| `/api/proposals/[id]` | DELETE | Delete proposal |

### Estimates

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/estimates` | GET | List all estimates |
| `/api/estimates` | POST | Create new estimate |
| `/api/estimates/[id]` | GET | Get estimate details |
| `/api/estimates/[id]` | PUT | Update estimate |
| `/api/estimates/[id]` | DELETE | Delete estimate |

### Invoices

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/invoices` | GET | List all invoices |
| `/api/invoices` | POST | Create new invoice |
| `/api/invoices/[id]` | GET | Get invoice details |
| `/api/invoices/[id]` | PUT | Update invoice |
| `/api/invoices/[id]` | DELETE | Delete invoice |

### Payments

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/payments` | GET | List all payments |
| `/api/payments` | POST | Create new payment |
| `/api/payments/[id]` | GET | Get payment details |

### Banking

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/bank-accounts` | GET | List all bank accounts |
| `/api/bank-accounts` | POST | Create new bank account |
| `/api/bank-accounts/[id]` | GET | Get bank account details |
| `/api/bank-accounts/[id]` | PUT | Update bank account |
| `/api/transactions` | GET | List all transactions |
| `/api/transactions` | POST | Create new transaction |

### Expenses

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/expenses` | GET | List all expenses |
| `/api/expenses` | POST | Create new expense |
| `/api/expenses/[id]` | GET | Get expense details |
| `/api/expenses/[id]` | PUT | Update expense |

### Credits

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/credits` | GET | List all credits |
| `/api/credits` | POST | Create new credit |
| `/api/credits/[id]` | GET | Get credit details |

### Loans

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/loans` | GET | List all loans |
| `/api/loans` | POST | Create new loan |
| `/api/loans/[id]` | GET | Get loan details |

### General Ledger

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/ledger` | GET | List all ledger entries |
| `/api/ledger` | POST | Create new ledger entry |
| `/api/accounts` | GET | List chart of accounts |

### Projects, Tasks, Work Orders

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/projects` | GET | List projects (mock data) |
| `/api/tasks` | GET | List tasks (mock data) |
| `/api/work-orders` | GET | List work orders (mock data) |

### Users (Admin)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/users` | GET | List all users |
| `/api/users` | POST | Create new user |
| `/api/users/[id]` | GET | Get user details |
| `/api/users/[id]` | PUT | Update user role |

---

## 7. Database Schema (Prisma Models)

All models are defined in `prisma/schema.prisma` and generated into `@prisma/client`.

### Organization & Auth

**Organization**
- `id` (String): Primary key
- `name` (String): Company name
- `website` (String?)
- `logo` (String?)
- `address` (String?)
- `phone` (String?)
- `email` (String?)
- `taxId` (String?)
- `currency` (String): Default "USD"
- `createdAt`, `updatedAt` (DateTime)
- Relations: members, clients, items, proposals, estimates, invoices, payments, bankAccounts, expenses, credits, loans, ledgerEntries, accounts

**Member**
- `id` (String): Primary key
- `clerkUserId` (String): Unique Clerk ID
- `email`, `name` (String)
- `role` (MemberRole): OWNER | ADMIN | MEMBER | VIEWER
- `organizationId` (String): FK to Organization
- `createdAt` (DateTime)

### Clients (CRM)

**Client**
- `id` (String): Primary key
- `name`, `email` (String)
- `phone`, `company`, `address`, `taxId` (String?)
- `currency` (String): Default "USD"
- `status` (ClientStatus): ACTIVE | INACTIVE | LEAD | ARCHIVED
- `notes` (String?)
- `organizationId` (String): FK to Organization
- `createdAt`, `updatedAt` (DateTime)
- Relations: proposals, estimates, invoices, payments

### Items (Catalog)

**Item**
- `id` (String): Primary key
- `name`, `description` (String)
- `type` (ItemType): SERVICE | PRODUCT | API_COST | AI_TOKEN
- `unit` (String): Default "hour"
- `rate` (Decimal): Default 65.00
- `isActive` (Boolean): Default true
- `organizationId` (String): FK to Organization
- `createdAt`, `updatedAt` (DateTime)

### Proposals

**Proposal**
- `id` (String): Primary key
- `number` (String): Unique identifier
- `title`, `description` (String)
- `status` (ProposalStatus): DRAFT | SENT | APPROVED | REJECTED | EXPIRED
- `clientId` (String): FK to Client
- `organizationId` (String): FK to Organization
- `subtotal`, `taxAmount`, `total` (Decimal)
- `taxRate` (Decimal)
- `validUntil`, `approvedAt`, `sentAt` (DateTime?)
- `createdAt`, `updatedAt` (DateTime)
- Relations: items (ProposalItem[])

**ProposalItem**
- `id` (String): Primary key
- `proposalId` (String): FK to Proposal (cascade delete)
- `description` (String)
- `hours`, `rate`, `amount` (Decimal)
- `sortOrder` (Int)

### Estimates

**Estimate**
- `id` (String): Primary key
- `number` (String): Unique identifier
- `title`, `description` (String)
- `status` (EstimateStatus): DRAFT | SENT | ACCEPTED | REJECTED | CONVERTED
- `clientId` (String): FK to Client
- `organizationId` (String): FK to Organization
- `subtotal`, `taxAmount`, `total` (Decimal)
- `taxRate` (Decimal)
- `validUntil` (DateTime?)
- `convertedToInvoiceId` (String?): FK when converted
- `createdAt`, `updatedAt` (DateTime)
- Relations: items (EstimateItem[])

**EstimateItem**
- `id` (String): Primary key
- `estimateId` (String): FK to Estimate (cascade delete)
- `description` (String)
- `hours`, `rate`, `amount` (Decimal)
- `sortOrder` (Int)

### Invoices

**Invoice**
- `id` (String): Primary key
- `number` (String): Unique identifier
- `title`, `description` (String)
- `status` (InvoiceStatus): DRAFT | SENT | VIEWED | PARTIAL | PAID | OVERDUE | CANCELLED
- `clientId` (String): FK to Client
- `organizationId` (String): FK to Organization
- `subtotal`, `taxAmount`, `total` (Decimal)
- `taxRate` (Decimal)
- `amountPaid`, `amountDue` (Decimal)
- `issueDate`, `dueDate` (DateTime)
- `paidAt` (DateTime?)
- `createdAt`, `updatedAt` (DateTime)
- Relations: items (InvoiceItem[]), payments (Payment[])

**InvoiceItem**
- `id` (String): Primary key
- `invoiceId` (String): FK to Invoice (cascade delete)
- `description` (String)
- `hours`, `rate`, `amount` (Decimal)
- `sortOrder` (Int)

### Payments

**Payment**
- `id` (String): Primary key
- `number` (String): Unique identifier
- `amount` (Decimal)
- `method` (PaymentMethod): BANK_TRANSFER | CASH | CREDIT_CARD | PAYPAL | CRYPTO | CHECK | OTHER
- `status` (PaymentStatus): PENDING | COMPLETED | FAILED | REFUNDED
- `reference`, `notes` (String?)
- `invoiceId` (String?): FK to Invoice (optional)
- `clientId` (String): FK to Client
- `bankAccountId` (String?): FK to BankAccount (optional)
- `organizationId` (String): FK to Organization
- `receivedAt`, `createdAt` (DateTime)

### Banking

**BankAccount**
- `id` (String): Primary key
- `name`, `bankName` (String)
- `accountNumber`, `routingNumber` (String)
- `iban`, `swift` (String?)
- `type` (BankAccountType): CHECKING | SAVINGS | CASH | CRYPTO
- `currency` (String): Default "USD"
- `balance` (Decimal): Default 0.00
- `isDefault` (Boolean): Default false
- `organizationId` (String): FK to Organization
- `createdAt`, `updatedAt` (DateTime)
- Relations: payments (Payment[]), transactions (Transaction[])

**Transaction**
- `id` (String): Primary key
- `type` (TransactionType): DEPOSIT | WITHDRAWAL | TRANSFER | FEE
- `amount` (Decimal)
- `description`, `reference` (String)
- `bankAccountId` (String): FK to BankAccount
- `date` (DateTime): Default now()
- `createdAt` (DateTime)

### Expenses

**Expense**
- `id` (String): Primary key
- `description` (String)
- `amount` (Decimal)
- `category` (ExpenseCategory): SOFTWARE | HARDWARE | OFFICE | TRAVEL | MARKETING | SALARY | CONTRACTOR | UTILITIES | INSURANCE | TAX | OTHER
- `vendor` (String?)
- `receipt` (String?)
- `notes` (String?)
- `status` (ExpenseStatus): PENDING | APPROVED | REJECTED | PAID
- `organizationId` (String): FK to Organization
- `date` (DateTime)
- `createdAt`, `updatedAt` (DateTime)

### Credits

**Credit**
- `id` (String): Primary key
- `number` (String): Unique identifier
- `description`, `reason` (String)
- `amount`, `remaining` (Decimal)
- `status` (CreditStatus): ACTIVE | USED | EXPIRED | CANCELLED
- `organizationId` (String): FK to Organization
- `issuedAt` (DateTime)
- `expiresAt` (DateTime?)
- `createdAt` (DateTime)

### Loans

**Loan**
- `id` (String): Primary key
- `name`, `lender` (String)
- `amount`, `remainingBalance` (Decimal)
- `interestRate`, `monthlyPayment` (Decimal)
- `startDate`, `endDate` (DateTime)
- `status` (LoanStatus): ACTIVE | PAID_OFF | DEFAULTED
- `notes` (String?)
- `organizationId` (String): FK to Organization
- `createdAt`, `updatedAt` (DateTime)

### General Ledger

**ChartOfAccount**
- `id` (String): Primary key
- `code` (String): Unique per organization
- `name` (String)
- `type` (AccountType): ASSET | LIABILITY | EQUITY | REVENUE | EXPENSE
- `subtype` (String?)
- `description` (String?)
- `isActive` (Boolean): Default true
- `organizationId` (String): FK to Organization
- Relations: entries (LedgerEntry[])
- **Constraint:** Unique pair (organizationId, code)

**LedgerEntry**
- `id` (String): Primary key
- `date` (DateTime)
- `description` (String)
- `debit`, `credit` (Decimal): Default 0.00
- `accountId` (String): FK to ChartOfAccount
- `reference` (String?)
- `organizationId` (String): FK to Organization
- `createdAt` (DateTime)
- **Constraint:** Debit OR credit must be > 0

---

## 8. TypeScript Types

All types are defined in `/src/types/index.ts` and mirror the Prisma schema.

### Enums

```typescript
type ClientStatus = "ACTIVE" | "INACTIVE" | "LEAD" | "ARCHIVED"
type ItemType = "SERVICE" | "PRODUCT" | "API_COST" | "AI_TOKEN"
type ProposalStatus = "DRAFT" | "SENT" | "APPROVED" | "REJECTED" | "EXPIRED"
type EstimateStatus = "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "CONVERTED"
type InvoiceStatus = "DRAFT" | "SENT" | "VIEWED" | "PARTIAL" | "PAID" | "OVERDUE" | "CANCELLED"
type PaymentMethod = "BANK_TRANSFER" | "CASH" | "CREDIT_CARD" | "PAYPAL" | "CRYPTO" | "CHECK" | "OTHER"
type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED"
type BankAccountType = "CHECKING" | "SAVINGS" | "CASH" | "CRYPTO"
type TransactionType = "DEPOSIT" | "WITHDRAWAL" | "TRANSFER" | "FEE"
type ExpenseCategory = "SOFTWARE" | "HARDWARE" | "OFFICE" | "TRAVEL" | "MARKETING" | "SALARY" | "CONTRACTOR" | "UTILITIES" | "INSURANCE" | "TAX" | "OTHER"
type ExpenseStatus = "PENDING" | "APPROVED" | "REJECTED" | "PAID"
type CreditStatus = "ACTIVE" | "USED" | "EXPIRED" | "CANCELLED"
type LoanStatus = "ACTIVE" | "PAID_OFF" | "DEFAULTED"
type AccountType = "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE"
type MemberRole = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER"
type ProjectStatus = "PLANNING" | "IN_PROGRESS" | "COMPLETED" | "ON_HOLD" | "CANCELLED"
type ProjectPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE"
type WorkOrderStatus = "TODO" | "IN_PROGRESS" | "COMPLETED"
```

### Key Interfaces

```typescript
interface Organization { /* all org data */ }
interface Member { /* user + role */ }
interface Client { /* CRM contact */ }
interface Item { /* service/product */ }
interface Proposal { /* sales proposal */ }
interface Estimate { /* cost estimate */ }
interface Invoice { /* billing */ }
interface Payment { /* payment received */ }
interface BankAccount { /* banking */ }
interface Transaction { /* bank transaction */ }
interface Expense { /* expense tracking */ }
interface Credit { /* credit pool */ }
interface Loan { /* debt tracking */ }
interface ChartOfAccount { /* GL account */ }
interface LedgerEntry { /* GL transaction */ }
```

### Mock Types (Not in Prisma)

```typescript
interface Project {
  id: string
  name: string
  clientId: string
  status: ProjectStatus
  priority: ProjectPriority
  progress: number // 0-100%
  budget: number
  spent: number
  startDate: string
  deadline: string
}

interface WorkOrder {
  id: string
  number: string
  title: string
  projectId: string
  status: WorkOrderStatus
  assignee: string
  hours: number
  rate: number
  date: string
}

interface Task {
  id: string
  title: string
  projectId: string
  workOrderId: string
  status: TaskStatus
  priority: ProjectPriority
  assignee: string
  dueDate: string
}
```

---

## 9. Key Components

### Header (`src/components/dashboard/header.tsx`)

The top navigation bar featuring:
- **Breadcrumbs**: Current page path
- **Global Search**: Ctrl+K to open (Spotlight-style)
- **Quick Create**: + dropdown for entity creation
- **Notifications**: Notification center icon
- **Profile Dropdown**: User menu & sign out

**Usage:**
```tsx
import { Header } from "@/components/dashboard/header"

export default function Layout() {
  return (
    <>
      <Header />
      {/* page content */}
    </>
  )
}
```

### Sidebar (`src/components/dashboard/sidebar.tsx`)

Collapsible navigation featuring:
- **Org Logo**: Branding
- **Nav Groups**: Expandable sections (Sales, Finance, Operations, etc.)
- **Active Route Highlighting**: Current page auto-expands parent
- **Collapse Toggle**: Chevron to minimize
- **Responsive**: Hidden on mobile, visible on desktop

**Configuration:** See `src/constants/navigation.ts`

### ClientSelect (`src/components/ui/client-select.tsx`)

Reusable dropdown component for selecting a client with inline creation:

```tsx
import { ClientSelect } from "@/components/ui/client-select"

export function ProposalForm() {
  const [clientId, setClientId] = useState("")

  return (
    <ClientSelect
      value={clientId}
      onChange={setClientId}
      onClientCreated={(newClient) => setClientId(newClient.id)}
    />
  )
}
```

### GlobalSearch (`src/components/ui/global-search.tsx`)

Ctrl+K keyboard shortcut for app-wide search:
- Spotlight-style UI
- Keyboard navigation (arrow keys, Enter to select)
- Dutch keyword support
- Searches across: clients, invoices, proposals, estimates, items

```tsx
import { GlobalSearch } from "@/components/ui/global-search"

export function Header() {
  return <GlobalSearch />
}
```

### QuickCreate (`src/components/ui/quick-create.tsx`)

Plus (+) button dropdown for rapid entity creation:
- Client
- Proposal
- Estimate
- Invoice
- Payment
- Expense
- Work Order

---

## 10. View Modes

### Multi-View Modules

The following modules support multiple view modes:

#### Projects
- **List**: Traditional table view
- **Kanban**: Drag-drop by status
- **Gantt**: Timeline visualization
- **Timeline**: Horizontal calendar

#### Tasks
- **List**: Traditional table view
- **Kanban**: Drag-drop by status
- **Gantt**: Timeline visualization
- **Timeline**: Horizontal calendar

#### Work Orders
- **List**: Traditional table view
- **Kanban**: Drag-drop by status
- **Gantt**: Timeline visualization
- **Timeline**: Horizontal calendar

#### Calendar
- **Month**: Traditional month grid
- **Week**: 7-day week view
- **Day**: Single-day detail view
- **Year**: 12-month overview
- **Custom**: N-day custom range

**Implementation Pattern:**
```tsx
"use client"
import { useState } from "react"

export default function ProjectsPage() {
  const [view, setView] = useState<"list" | "kanban" | "gantt" | "timeline">("list")

  return (
    <div>
      <ViewSelector value={view} onChange={setView} />
      {view === "list" && <ProjectListView />}
      {view === "kanban" && <ProjectKanbanView />}
      {view === "gantt" && <ProjectGanttView />}
      {view === "timeline" && <ProjectTimelineView />}
    </div>
  )
}
```

### Scrum Board (Sprints)

Multiple tabs for sprint management:

| Tab | Purpose |
|-----|---------|
| **Sprint Board** | Active sprint tasks (kanban) |
| **Backlog** | Upcoming work items |
| **Sprints** | Historical sprints list |
| **Burndown** | Sprint progress chart |
| **Velocity** | Team velocity metrics |

---

## 11. Settings Architecture

The Settings page (`/settings`) is organized into 3 main tabs:

### 1. General Settings

Sub-tabs for organization configuration:

| Tab | Features |
|-----|----------|
| **Company** | Name, logo, address, tax ID |
| **Currency** | Default currency, tax rates |
| **Tax** | Tax configuration |
| **Integrations** | Third-party API connections |
| **Notifications** | Email alerts, preferences |
| **Appearance** | Theme, language, date format |
| **API Keys** | Generate & revoke API keys |
| **Import/Export** | CSV upload, bulk operations |

### 2. Users & Roles

User management with role-based access control:

| Role | Permissions |
|------|-------------|
| **OWNER** | Full access, can invite/remove users, modify org settings |
| **ADMIN** | Full access except org settings |
| **MEMBER** | Read/write own entities, limited reports |
| **VIEWER** | Read-only access |

**Features:**
- Invite users by email
- Change user roles
- Deactivate/reactivate users
- Activity log

### 3. Documentation

User-facing documentation:

| Item | Purpose |
|------|---------|
| **Knowledge Base** | FAQs, how-tos, best practices |
| **API Docs** | API endpoint documentation |
| **Webhooks** | Webhook setup & events |
| **Change Log** | Version history & release notes |

### Import/Export

Bulk data operations:

**Import:**
1. Upload CSV file
2. Preview data with column mapping
3. Validate before import
4. Batch create/update

**Export:**
- Clients
- Items
- Invoices
- Proposals
- Estimates
- Payments
- Expenses
- Loans
- General Ledger

**CSV Template Downloads:**
Each entity type has a downloadable template showing required columns.

---

## 12. Known Issues & Troubleshooting

### Turbopack JSON-RPC Cache Corruption

**Symptom:** Error on startup or after dependency changes, usually mentioning JSON-RPC or bundler issues.

**Solution:**
```bash
# Delete Next.js cache
rm -rf .next

# Or on PowerShell:
Remove-Item .next -Recurse -Force

# Restart dev server
npm run dev
```

### .card CSS Class Has No Padding

**Symptom:** Card content appears cramped or touches edges.

**Cause:** The `.card` class provides only border and background; padding must be added explicitly.

**Solution:**
```tsx
// ✓ Correct
<div className="card p-4">
  {/* content with breathing room */}
</div>

// ✗ Wrong
<div className="card">
  {/* looks cramped! */}
</div>
```

### Missing Environment Variables

**Symptom:** API calls return 401 or empty arrays.

**Solution:**
1. Verify `.env.local` exists in project root
2. Check all required variables are present:
   - `DATABASE_URL`
   - `CLERK_SECRET_KEY`
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
3. Restart dev server after adding variables

### Database Connection Errors

**Symptom:** "Error: P1000" or "connect ECONNREFUSED"

**Solution:**
1. Verify `DATABASE_URL` is correct
2. Check Neon serverless instance is active
3. Test connection: `npx prisma db execute --stdin` then `SELECT 1;`

### Clerk Authentication Not Working

**Symptom:** Redirect loops or "Not Authenticated" errors.

**Solution:**
1. Verify Clerk API keys in `.env.local`
2. Check Clerk dashboard has correct redirect URLs
3. Ensure `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set
4. Clear browser cookies and cache

### API Route Returns Empty Array

**Symptom:** `GET /api/clients` returns `[]` even with data in database.

**Cause:** Usually missing `DATABASE_URL` or Prisma client not initialized.

**Solution:**
1. Verify `DATABASE_URL` in `.env.local`
2. Run `npx prisma generate` to regenerate client
3. Check `src/lib/prisma.ts` exports singleton client
4. Restart dev server

### Build Failures

**Symptom:** `npm run build` fails with TypeScript errors.

**Solution:**
1. Check TypeScript configuration: `npx tsc --noEmit`
2. Verify all imports use `@/` alias correctly
3. Run `npx prisma generate` before build
4. Clear node_modules and reinstall: `rm -rf node_modules && npm install`

### Types Not Recognized

**Symptom:** TypeScript errors like "Type 'X' not found"

**Solution:**
1. Verify type is exported from `src/types/index.ts`
2. Check import path: `import { Type } from "@/types"`
3. Run `npx tsc --noEmit` to check all types
4. Restart VS Code TypeScript server

---

## Contributing Guidelines

### Code Style

- **Naming:** PascalCase for components, camelCase for functions/variables
- **Imports:** Use `@/` alias for imports from `src/`
- **Comments:** Use JSDoc for functions, inline comments for complex logic
- **Formatting:** Prettier (configured via ESLint)

### Before Committing

```bash
# Lint code
npm run lint

# Type check
npx tsc --noEmit

# Test locally
npm run dev
```

### Database Changes

1. Update `prisma/schema.prisma`
2. Generate Prisma types: `npx prisma generate`
3. Push to database: `npx prisma db push`
4. Update types in `src/types/index.ts` if needed
5. Test API routes
6. Update API documentation

---

## Support & Resources

- **Next.js Docs:** https://nextjs.org/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Clerk Docs:** https://clerk.com/docs
- **Vercel Docs:** https://vercel.com/docs

---

**Last Updated:** 2026-04-06
**Maintainer:** Logix Layer Development Team
**Status:** Active Development
