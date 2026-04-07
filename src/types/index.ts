/**
 * types/index.ts
 * TypeScript types matching Prisma schema
 * Used throughout the app for type safety
 */

// ─── Enums ──────────────────────────────────────

export type ClientStatus = "ACTIVE" | "INACTIVE" | "LEAD" | "ARCHIVED"
export type ItemType = "SERVICE" | "PRODUCT" | "API_COST" | "AI_TOKEN"
export type ProposalStatus = "DRAFT" | "SENT" | "APPROVED" | "REJECTED" | "EXPIRED"
export type EstimateStatus = "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "CONVERTED"
export type InvoiceStatus = "DRAFT" | "SENT" | "VIEWED" | "PARTIAL" | "PAID" | "OVERDUE" | "CANCELLED"
export type PaymentMethod = "BANK_TRANSFER" | "CASH" | "CREDIT_CARD" | "PAYPAL" | "CRYPTO" | "CHECK" | "OTHER"
export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED"
export type BankAccountType = "CHECKING" | "SAVINGS" | "CASH" | "CRYPTO"
export type TransactionType = "DEPOSIT" | "WITHDRAWAL" | "TRANSFER" | "FEE"
export type ExpenseCategory = "SOFTWARE" | "HARDWARE" | "OFFICE" | "TRAVEL" | "MARKETING" | "SALARY" | "CONTRACTOR" | "UTILITIES" | "INSURANCE" | "TAX" | "OTHER"
export type ExpenseStatus = "PENDING" | "APPROVED" | "REJECTED" | "PAID"
export type CreditStatus = "ACTIVE" | "USED" | "EXPIRED" | "CANCELLED"
export type LoanStatus = "ACTIVE" | "PAID_OFF" | "DEFAULTED"
export type AccountType = "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE"
export type MemberRole = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER"
export type ProjectStatus = "PLANNING" | "IN_PROGRESS" | "COMPLETED" | "ON_HOLD" | "CANCELLED"
export type ProjectPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE"
export type WorkOrderStatus = "TODO" | "IN_PROGRESS" | "COMPLETED"

// ─── Organization & Auth ───────────────────────

export interface Organization {
  id: string
  name: string
  website?: string
  logo?: string
  address?: string
  phone?: string
  email?: string
  taxId?: string
  currency: string
  createdAt: string
  updatedAt: string
  members?: Member[]
  clients?: Client[]
  items?: Item[]
  proposals?: Proposal[]
  estimates?: Estimate[]
  invoices?: Invoice[]
  payments?: Payment[]
  bankAccounts?: BankAccount[]
  expenses?: Expense[]
  credits?: Credit[]
  loans?: Loan[]
  ledgerEntries?: LedgerEntry[]
  accounts?: ChartOfAccount[]
}

export interface Member {
  id: string
  clerkUserId: string
  email: string
  name: string
  role: MemberRole
  organizationId: string
  createdAt: string
  organization?: Organization
}

// ─── Clients (CRM) ─────────────────────────────

export interface Client {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  address?: string
  taxId?: string
  currency: string
  status: ClientStatus
  notes?: string
  organizationId: string
  createdAt: string
  updatedAt: string
  proposals?: Proposal[]
  estimates?: Estimate[]
  invoices?: Invoice[]
  payments?: Payment[]
}

// ─── Items Catalog ─────────────────────────────

export interface Item {
  id: string
  name: string
  type: ItemType
  description?: string
  unit: string
  rate: number
  isActive: boolean
  organizationId: string
  createdAt: string
  updatedAt: string
}

// ─── Proposals ─────────────────────────────────

export interface Proposal {
  id: string
  number: string
  title: string
  description?: string
  status: ProposalStatus
  clientId: string
  client?: Client
  organizationId: string
  items?: ProposalItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  validUntil?: string
  approvedAt?: string
  sentAt?: string
  createdAt: string
  updatedAt: string
}

export interface ProposalItem {
  id: string
  proposalId: string
  proposal?: Proposal
  description: string
  hours: number
  rate: number
  amount: number
  sortOrder: number
}

// ─── Estimates ─────────────────────────────────

export interface Estimate {
  id: string
  number: string
  title: string
  description?: string
  status: EstimateStatus
  clientId: string
  client?: Client
  organizationId: string
  items?: EstimateItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  validUntil?: string
  convertedToInvoiceId?: string
  createdAt: string
  updatedAt: string
}

export interface EstimateItem {
  id: string
  estimateId: string
  estimate?: Estimate
  description: string
  hours: number
  rate: number
  amount: number
  sortOrder: number
}

// ─── Invoices ──────────────────────────────────

export interface Invoice {
  id: string
  number: string
  title: string
  description?: string
  status: InvoiceStatus
  clientId: string
  client?: Client
  organizationId: string
  items?: InvoiceItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  amountPaid: number
  amountDue: number
  issueDate: string
  dueDate: string
  paidAt?: string
  createdAt: string
  updatedAt: string
  payments?: Payment[]
}

export interface InvoiceItem {
  id: string
  invoiceId: string
  invoice?: Invoice
  description: string
  hours: number
  rate: number
  amount: number
  sortOrder: number
}

// ─── Payments ──────────────────────────────────

export interface Payment {
  id: string
  number: string
  amount: number
  method: PaymentMethod
  status: PaymentStatus
  reference?: string
  notes?: string
  invoiceId?: string
  invoice?: Invoice
  clientId: string
  client?: Client
  bankAccountId?: string
  bankAccount?: BankAccount
  organizationId: string
  receivedAt: string
  createdAt: string
}

// ─── Bank Accounts ─────────────────────────────

export interface BankAccount {
  id: string
  name: string
  bankName: string
  accountNumber: string
  routingNumber?: string
  iban?: string
  swift?: string
  type: BankAccountType
  currency: string
  balance: number
  isDefault: boolean
  organizationId: string
  createdAt: string
  updatedAt: string
  payments?: Payment[]
  transactions?: Transaction[]
}

// ─── Transactions ──────────────────────────────

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  description: string
  reference?: string
  bank?: string
  bankAccountId: string
  bankAccount?: BankAccount
  date: string
  createdAt: string
}

// ─── Credits ───────────────────────────────────

export interface Credit {
  id: string
  number: string
  description: string
  amount: number
  remaining: number
  status: CreditStatus
  reason?: string
  organizationId: string
  issuedAt: string
  expiresAt?: string
  createdAt: string
}

// ─── Vendors ──────────────────────────────────

export interface Vendor {
  id: string
  name: string
  email?: string
  phone?: string
  company?: string
  address?: string
  taxId?: string
  website?: string
  notes?: string
  isActive: boolean
  organizationId: string
  createdAt: string
  updatedAt: string
  expenseCount?: number
  totalSpent?: number
}

// ─── Expense Categories ───────────────────────

export interface ExpenseCategoryRecord {
  id: string
  name: string
  description?: string
  color: string
  budget?: number
  isActive: boolean
  organizationId: string
  createdAt: string
  updatedAt: string
  expenseCount?: number
  totalSpent?: number
}

// ─── Expenses ──────────────────────────────────

export interface Expense {
  id: string
  description: string
  amount: number
  category: ExpenseCategory
  vendor?: string
  receipt?: string
  notes?: string
  status: ExpenseStatus
  organizationId: string
  date: string
  createdAt: string
  updatedAt: string
}

// ─── Loans ─────────────────────────────────────

export interface Loan {
  id: string
  name: string
  lender: string
  amount: number
  remainingBalance: number
  interestRate: number
  monthlyPayment: number
  startDate: string
  endDate: string
  status: LoanStatus
  notes?: string
  organizationId: string
  createdAt: string
  updatedAt: string
}

// ─── Chart of Accounts ─────────────────────────

export interface ChartOfAccount {
  id?: string
  code: string
  name: string
  type: AccountType
  subtype?: string
  description?: string
  isActive?: boolean
  organizationId?: string
  entries?: LedgerEntry[]
  balance?: number
}

// ─── Ledger Entries ────────────────────────────

export interface LedgerEntry {
  id: string
  date: string
  description: string
  debit: number
  credit: number
  accountId?: string
  account?: ChartOfAccount | string
  reference?: string
  organizationId?: string
  createdAt?: string
  ref?: string
}

// ─── Projects (Mock data — not in Prisma yet) ─

export interface Project {
  id: string
  name: string
  clientId: string
  client: string
  status: ProjectStatus
  priority: ProjectPriority
  progress: number
  budget: number
  spent: number
  startDate: string
  deadline: string
  description: string
}

// ─── Work Orders (Mock data — not in Prisma yet) ─

export interface WorkOrder {
  id: string
  number: string
  title: string
  projectId: string
  project: string
  clientId: string
  status: WorkOrderStatus
  assignee: string
  hours: number
  rate: number
  date: string
}

// ─── Tasks (Mock data — not in Prisma yet) ────

export interface Task {
  id: string
  title: string
  projectId: string
  workOrderId: string
  clientId: string
  status: TaskStatus
  priority: ProjectPriority
  assignee: string
  dueDate: string
  createdAt: string
}

// ─── Client API Keys (Mock data — not in Prisma yet) ─

export interface ClientApiKey {
  id: string
  clientId: string
  name: string
  key: string
  environment: "production" | "staging" | "test"
  status: "ACTIVE" | "REVOKED" | "EXPIRED"
  createdAt: string
  lastUsed: string
  requestsToday: number
  requestsMonth: number
  rateLimit: number
}

// ─── Client Token Usage (Mock data — not in Prisma yet) ─

export interface ClientTokenUsage {
  id: string
  clientId: string
  model: string
  inputTokens: number
  outputTokens: number
  cost: number
  period: string
}

// ─── Dashboard KPIs ────────────────────────────

export interface DashboardKPIs {
  totalRevenue: number
  outstandingInvoices: number
  totalExpenses: number
  netIncome: number
  revenueChange: string
  expenseChange: string
  invoicesPaid: number
  invoicesPending: number
  cashOnHand: number
  proposalsWon: number
  proposalsTotal: number
}

// ─── Monthly Revenue ───────────────────────────

export interface MonthlyRevenue {
  month: string
  revenue: number
  expenses: number
}

// ─── API Usage ─────────────────────────────────

export interface ApiUsage {
  month: string
  claudeOpus: number
  claudeSonnet: number
  gpt4o: number
  embedding: number
  hosting: number
}
