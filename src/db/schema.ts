import {
  pgTable,
  pgEnum,
  text,
  timestamp,
  boolean,
  decimal,
  integer,
  uniqueIndex,
} from "drizzle-orm/pg-core"

// ─── Enums ─────────────────────────────────────

export const memberRoleEnum = pgEnum("MemberRole", ["OWNER", "ADMIN", "MEMBER", "VIEWER"])
export const clientStatusEnum = pgEnum("ClientStatus", ["ACTIVE", "INACTIVE", "LEAD", "ARCHIVED"])
export const itemTypeEnum = pgEnum("ItemType", ["SERVICE", "PRODUCT", "API_COST", "AI_TOKEN"])
export const proposalStatusEnum = pgEnum("ProposalStatus", ["DRAFT", "SENT", "APPROVED", "REJECTED", "EXPIRED"])
export const estimateStatusEnum = pgEnum("EstimateStatus", ["DRAFT", "SENT", "ACCEPTED", "REJECTED", "CONVERTED"])
export const invoiceStatusEnum = pgEnum("InvoiceStatus", ["DRAFT", "SENT", "VIEWED", "PARTIAL", "PAID", "OVERDUE", "CANCELLED"])
export const paymentMethodEnum = pgEnum("PaymentMethod", ["BANK_TRANSFER", "CASH", "CREDIT_CARD", "PAYPAL", "CRYPTO", "CHECK", "OTHER"])
export const paymentStatusEnum = pgEnum("PaymentStatus", ["PENDING", "COMPLETED", "FAILED", "REFUNDED"])
export const bankAccountTypeEnum = pgEnum("BankAccountType", ["CHECKING", "SAVINGS", "CASH", "CRYPTO"])
export const transactionTypeEnum = pgEnum("TransactionType", ["DEPOSIT", "WITHDRAWAL", "TRANSFER", "FEE"])
export const creditStatusEnum = pgEnum("CreditStatus", ["ACTIVE", "USED", "EXPIRED", "CANCELLED"])
export const expenseCategoryEnum = pgEnum("ExpenseCategory", ["SOFTWARE", "HARDWARE", "OFFICE", "TRAVEL", "MARKETING", "SALARY", "CONTRACTOR", "UTILITIES", "INSURANCE", "TAX", "OTHER"])
export const expenseStatusEnum = pgEnum("ExpenseStatus", ["PENDING", "APPROVED", "REJECTED", "PAID"])
export const loanStatusEnum = pgEnum("LoanStatus", ["ACTIVE", "PAID_OFF", "DEFAULTED"])
export const accountTypeEnum = pgEnum("AccountType", ["ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE"])
export const projectStatusEnum = pgEnum("ProjectStatus", ["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"])
export const projectPriorityEnum = pgEnum("ProjectPriority", ["LOW", "MEDIUM", "HIGH", "CRITICAL"])
export const workOrderStatusEnum = pgEnum("WorkOrderStatus", ["OPEN", "IN_PROGRESS", "REVIEW", "COMPLETED", "CANCELLED"])
export const taskStatusEnum = pgEnum("TaskStatus", ["TODO", "IN_PROGRESS", "REVIEW", "DONE", "CANCELLED"])
export const taskPriorityEnum = pgEnum("TaskPriority", ["LOW", "MEDIUM", "HIGH", "CRITICAL"])

// ─── Organization ──────────────────────────────

export const organizations = pgTable("organizations", {
  id: text("id").primaryKey(),
  name: text("name").notNull().default("Logix Layer N.V."),
  website: text("website"),
  logo: text("logo"),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  taxId: text("tax_id"),
  currency: text("currency").notNull().default("USD"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const members = pgTable("members", {
  id: text("id").primaryKey(),
  clerkUserId: text("clerk_user_id").notNull().unique(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  role: memberRoleEnum("role").notNull().default("MEMBER"),
  organizationId: text("organization_id").notNull().references(() => organizations.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

// ─── Clients ───────────────────────────────────

export const clients = pgTable("clients", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  company: text("company"),
  address: text("address"),
  taxId: text("tax_id"),
  currency: text("currency").notNull().default("USD"),
  status: clientStatusEnum("status").notNull().default("ACTIVE"),
  notes: text("notes"),
  organizationId: text("organization_id").notNull().references(() => organizations.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// ─── Items ─────────────────────────────────────

export const items = pgTable("items", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: itemTypeEnum("type").notNull(),
  description: text("description"),
  unit: text("unit").notNull().default("hour"),
  rate: decimal("rate", { precision: 10, scale: 2 }).notNull().default("65"),
  isActive: boolean("is_active").notNull().default(true),
  organizationId: text("organization_id").notNull().references(() => organizations.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// ─── Proposals ─────────────────────────────────

export const proposals = pgTable("proposals", {
  id: text("id").primaryKey(),
  number: text("number").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  status: proposalStatusEnum("status").notNull().default("DRAFT"),
  clientId: text("client_id").notNull().references(() => clients.id),
  organizationId: text("organization_id").notNull().references(() => organizations.id),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull().default("0"),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).notNull().default("0"),
  taxAmount: decimal("tax_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  total: decimal("total", { precision: 12, scale: 2 }).notNull().default("0"),
  validUntil: timestamp("valid_until"),
  approvedAt: timestamp("approved_at"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const proposalItems = pgTable("proposal_items", {
  id: text("id").primaryKey(),
  proposalId: text("proposal_id").notNull().references(() => proposals.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  hours: decimal("hours", { precision: 8, scale: 2 }).notNull().default("0"),
  rate: decimal("rate", { precision: 10, scale: 2 }).notNull().default("65"),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull().default("0"),
  sortOrder: integer("sort_order").notNull().default(0),
})

// ─── Estimates ─────────────────────────────────

export const estimates = pgTable("estimates", {
  id: text("id").primaryKey(),
  number: text("number").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  status: estimateStatusEnum("status").notNull().default("DRAFT"),
  clientId: text("client_id").notNull().references(() => clients.id),
  organizationId: text("organization_id").notNull().references(() => organizations.id),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull().default("0"),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).notNull().default("0"),
  taxAmount: decimal("tax_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  total: decimal("total", { precision: 12, scale: 2 }).notNull().default("0"),
  validUntil: timestamp("valid_until"),
  convertedToInvoiceId: text("converted_to_invoice_id").unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const estimateItems = pgTable("estimate_items", {
  id: text("id").primaryKey(),
  estimateId: text("estimate_id").notNull().references(() => estimates.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  hours: decimal("hours", { precision: 8, scale: 2 }).notNull().default("0"),
  rate: decimal("rate", { precision: 10, scale: 2 }).notNull().default("65"),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull().default("0"),
  sortOrder: integer("sort_order").notNull().default(0),
})

// ─── Invoices ──────────────────────────────────

export const invoices = pgTable("invoices", {
  id: text("id").primaryKey(),
  number: text("number").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  status: invoiceStatusEnum("status").notNull().default("DRAFT"),
  clientId: text("client_id").notNull().references(() => clients.id),
  organizationId: text("organization_id").notNull().references(() => organizations.id),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull().default("0"),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).notNull().default("0"),
  taxAmount: decimal("tax_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  total: decimal("total", { precision: 12, scale: 2 }).notNull().default("0"),
  amountPaid: decimal("amount_paid", { precision: 12, scale: 2 }).notNull().default("0"),
  amountDue: decimal("amount_due", { precision: 12, scale: 2 }).notNull().default("0"),
  issueDate: timestamp("issue_date").notNull().defaultNow(),
  dueDate: timestamp("due_date").notNull(),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const invoiceItems = pgTable("invoice_items", {
  id: text("id").primaryKey(),
  invoiceId: text("invoice_id").notNull().references(() => invoices.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  hours: decimal("hours", { precision: 8, scale: 2 }).notNull().default("0"),
  rate: decimal("rate", { precision: 10, scale: 2 }).notNull().default("65"),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull().default("0"),
  sortOrder: integer("sort_order").notNull().default(0),
})

// ─── Bank Accounts ─────────────────────────────

export const bankAccounts = pgTable("bank_accounts", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  bankName: text("bank_name").notNull(),
  accountNumber: text("account_number").notNull(),
  routingNumber: text("routing_number"),
  iban: text("iban"),
  swift: text("swift"),
  type: bankAccountTypeEnum("type").notNull().default("CHECKING"),
  currency: text("currency").notNull().default("USD"),
  balance: decimal("balance", { precision: 14, scale: 2 }).notNull().default("0"),
  isDefault: boolean("is_default").notNull().default(false),
  organizationId: text("organization_id").notNull().references(() => organizations.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const transactions = pgTable("transactions", {
  id: text("id").primaryKey(),
  type: transactionTypeEnum("type").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  description: text("description").notNull(),
  reference: text("reference"),
  bankAccountId: text("bank_account_id").notNull().references(() => bankAccounts.id),
  date: timestamp("date").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

// ─── Payments ──────────────────────────────────

export const payments = pgTable("payments", {
  id: text("id").primaryKey(),
  number: text("number").notNull().unique(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  method: paymentMethodEnum("method").notNull(),
  status: paymentStatusEnum("status").notNull().default("PENDING"),
  reference: text("reference"),
  notes: text("notes"),
  invoiceId: text("invoice_id").references(() => invoices.id),
  clientId: text("client_id").notNull().references(() => clients.id),
  bankAccountId: text("bank_account_id").references(() => bankAccounts.id),
  organizationId: text("organization_id").notNull().references(() => organizations.id),
  receivedAt: timestamp("received_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

// ─── Credits ───────────────────────────────────

export const credits = pgTable("credits", {
  id: text("id").primaryKey(),
  number: text("number").notNull().unique(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  remaining: decimal("remaining", { precision: 12, scale: 2 }).notNull(),
  status: creditStatusEnum("status").notNull().default("ACTIVE"),
  reason: text("reason"),
  organizationId: text("organization_id").notNull().references(() => organizations.id),
  issuedAt: timestamp("issued_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

// ─── Vendors ──────────────────────────────────

export const vendors = pgTable("vendors", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  company: text("company"),
  address: text("address"),
  taxId: text("tax_id"),
  website: text("website"),
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  organizationId: text("organization_id").notNull().references(() => organizations.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// ─── Expense Categories ───────────────────────

export const expenseCategories = pgTable("expense_categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color").notNull().default("#6B7280"),
  budget: decimal("budget", { precision: 12, scale: 2 }),
  isActive: boolean("is_active").notNull().default(true),
  organizationId: text("organization_id").notNull().references(() => organizations.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// ─── Expenses ──────────────────────────────────

export const expenses = pgTable("expenses", {
  id: text("id").primaryKey(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  category: expenseCategoryEnum("category").notNull(),
  vendor: text("vendor"),
  receipt: text("receipt"),
  notes: text("notes"),
  status: expenseStatusEnum("status").notNull().default("PENDING"),
  organizationId: text("organization_id").notNull().references(() => organizations.id),
  date: timestamp("date").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// ─── Loans ─────────────────────────────────────

export const loans = pgTable("loans", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  lender: text("lender").notNull(),
  amount: decimal("amount", { precision: 14, scale: 2 }).notNull(),
  remainingBalance: decimal("remaining_balance", { precision: 14, scale: 2 }).notNull(),
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }).notNull(),
  monthlyPayment: decimal("monthly_payment", { precision: 12, scale: 2 }).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: loanStatusEnum("status").notNull().default("ACTIVE"),
  notes: text("notes"),
  organizationId: text("organization_id").notNull().references(() => organizations.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// ─── Projects ─────────────────────────────────

export const projects = pgTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  status: projectStatusEnum("status").notNull().default("PLANNING"),
  priority: projectPriorityEnum("priority").notNull().default("MEDIUM"),
  clientId: text("client_id").notNull().references(() => clients.id),
  organizationId: text("organization_id").notNull().references(() => organizations.id),
  budget: decimal("budget", { precision: 14, scale: 2 }).default("0"),
  progress: integer("progress").notNull().default(0),
  startDate: timestamp("start_date"),
  deadline: timestamp("deadline"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// ─── Work Orders ──────────────────────────────

export const workOrders = pgTable("work_orders", {
  id: text("id").primaryKey(),
  number: text("number").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: workOrderStatusEnum("status").notNull().default("OPEN"),
  projectId: text("project_id").references(() => projects.id),
  clientId: text("client_id").notNull().references(() => clients.id),
  organizationId: text("organization_id").notNull().references(() => organizations.id),
  assignee: text("assignee"),
  hours: decimal("hours", { precision: 8, scale: 2 }).default("0"),
  rate: decimal("rate", { precision: 10, scale: 2 }).default("0"),
  date: timestamp("date").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// ─── Tasks ────────────────────────────────────

export const tasks = pgTable("tasks", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: taskStatusEnum("status").notNull().default("TODO"),
  priority: taskPriorityEnum("priority").notNull().default("MEDIUM"),
  projectId: text("project_id").references(() => projects.id),
  clientId: text("client_id").references(() => clients.id),
  assigneeId: text("assignee_id").references(() => members.id),
  organizationId: text("organization_id").notNull().references(() => organizations.id),
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// ─── General Ledger ────────────────────────────

export const chartOfAccounts = pgTable("chart_of_accounts", {
  id: text("id").primaryKey(),
  code: text("code").notNull(),
  name: text("name").notNull(),
  type: accountTypeEnum("type").notNull(),
  subtype: text("subtype"),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  organizationId: text("organization_id").notNull().references(() => organizations.id),
}, (table) => ({
  orgCodeUnique: uniqueIndex("chart_of_accounts_org_code_unique").on(table.organizationId, table.code),
}))

export const ledgerEntries = pgTable("ledger_entries", {
  id: text("id").primaryKey(),
  date: timestamp("date").notNull().defaultNow(),
  description: text("description").notNull(),
  debit: decimal("debit", { precision: 14, scale: 2 }).notNull().default("0"),
  credit: decimal("credit", { precision: 14, scale: 2 }).notNull().default("0"),
  accountId: text("account_id").notNull().references(() => chartOfAccounts.id),
  reference: text("reference"),
  organizationId: text("organization_id").notNull().references(() => organizations.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})
