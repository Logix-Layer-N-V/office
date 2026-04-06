/**
 * mock-data.ts
 * WAT:    Demo data voor alle modules
 * WAAROM: Maakt de dashboard werkend zonder database
 * GEBRUIK: import { mockProposals } from "@/lib/mock-data"
 */

// --- Clients (CRM) ---
export const mockClients = [
  { id: "c1", name: "TechFlow Solutions", email: "info@techflow.io", company: "TechFlow Solutions B.V.", phone: "+31 20 123 4567", address: "Herengracht 100, Amsterdam", taxId: "NL123456789B01", status: "ACTIVE", totalSpent: 12350.00, invoiceCount: 2, lastActivity: "2026-03-28", notes: "Long-term web development client. Prefers bi-weekly sprints." },
  { id: "c2", name: "Green Digital", email: "contact@greendigital.nl", company: "Green Digital Agency", phone: "+31 10 987 6543", address: "Coolsingel 50, Rotterdam", taxId: "NL987654321B01", status: "ACTIVE", totalSpent: 6500.00, invoiceCount: 1, lastActivity: "2026-03-25", notes: "Agency partner. CRM module project ongoing." },
  { id: "c3", name: "Nova Finance", email: "hello@novafinance.com", company: "Nova Finance Corp", phone: "+1 212 555 0100", address: "350 Fifth Ave, New York", taxId: "US-EIN-12-3456789", status: "ACTIVE", totalSpent: 4225.00, invoiceCount: 1, lastActivity: "2026-04-01", notes: "Fintech client. API integrations. Has overdue invoice." },
  { id: "c4", name: "BlockPay Systems", email: "admin@blockpay.io", company: "BlockPay Systems Ltd", phone: "+44 20 7946 0958", address: "1 Canary Wharf, London", taxId: "GB-VAT-123456789", status: "ACTIVE", totalSpent: 49550.00, invoiceCount: 2, lastActivity: "2026-03-25", notes: "Blockchain payment gateway. High-value client. Pays in crypto." },
  { id: "c5", name: "DataStream Analytics", email: "ops@datastream.co", company: "DataStream Analytics", phone: "+1 415 555 0200", address: "100 Market St, San Francisco", taxId: "US-EIN-98-7654321", status: "INACTIVE", totalSpent: 0, invoiceCount: 0, lastActivity: "2026-02-28", notes: "Proposal rejected. Follow up Q3." },
]

// --- Items Catalog (Products, Services, API Cost, AI Tokens) ---
export type ItemType = "SERVICE" | "PRODUCT" | "API_COST" | "AI_TOKEN"

export const mockItems = [
  // Services
  { id: "item1", name: "Web Development", type: "SERVICE" as ItemType, description: "Full-stack web development (Next.js)", unit: "hour", rate: 65.00, isActive: true },
  { id: "item2", name: "UI/UX Design", type: "SERVICE" as ItemType, description: "Interface design and prototyping", unit: "hour", rate: 55.00, isActive: true },
  { id: "item3", name: "Technical Consultation", type: "SERVICE" as ItemType, description: "Architecture review and tech advisory", unit: "hour", rate: 85.00, isActive: true },
  { id: "item4", name: "Code Review & Audit", type: "SERVICE" as ItemType, description: "Security and performance code audit", unit: "hour", rate: 75.00, isActive: true },
  { id: "item5", name: "DevOps & Deployment", type: "SERVICE" as ItemType, description: "CI/CD setup, Vercel/AWS deployment", unit: "hour", rate: 70.00, isActive: true },
  { id: "item6", name: "Blockchain Development", type: "SERVICE" as ItemType, description: "Smart contracts, DeFi, Web3 integration", unit: "hour", rate: 95.00, isActive: true },
  // Products
  { id: "item7", name: "SaaS Starter Kit", type: "PRODUCT" as ItemType, description: "Next.js boilerplate with auth, payments, DB", unit: "license", rate: 2500.00, isActive: true },
  { id: "item8", name: "LMS Platform License", type: "PRODUCT" as ItemType, description: "White-label learning management system", unit: "license", rate: 5000.00, isActive: true },
  { id: "item9", name: "Trading Bot Framework", type: "PRODUCT" as ItemType, description: "Algorithmic trading base framework", unit: "license", rate: 7500.00, isActive: false },
  // API Costs
  { id: "item10", name: "Vercel API Hosting", type: "API_COST" as ItemType, description: "Serverless function invocations", unit: "month", rate: 20.00, isActive: true },
  { id: "item11", name: "Neon Database", type: "API_COST" as ItemType, description: "PostgreSQL serverless compute hours", unit: "month", rate: 19.00, isActive: true },
  { id: "item12", name: "Stripe Processing", type: "API_COST" as ItemType, description: "Payment processing fees (2.9% + $0.30)", unit: "transaction", rate: 0.30, isActive: true },
  { id: "item13", name: "Resend Email API", type: "API_COST" as ItemType, description: "Transactional email delivery", unit: "month", rate: 20.00, isActive: true },
  { id: "item14", name: "Cloudinary Media", type: "API_COST" as ItemType, description: "Image/video storage and transformations", unit: "month", rate: 89.00, isActive: true },
  // AI Token Costs
  { id: "item15", name: "Claude API (Opus)", type: "AI_TOKEN" as ItemType, description: "Anthropic Claude Opus — $15/1M input, $75/1M output", unit: "1M tokens", rate: 75.00, isActive: true },
  { id: "item16", name: "Claude API (Sonnet)", type: "AI_TOKEN" as ItemType, description: "Anthropic Claude Sonnet — $3/1M input, $15/1M output", unit: "1M tokens", rate: 15.00, isActive: true },
  { id: "item17", name: "OpenAI GPT-4o", type: "AI_TOKEN" as ItemType, description: "OpenAI GPT-4o — $2.50/1M input, $10/1M output", unit: "1M tokens", rate: 10.00, isActive: true },
  { id: "item18", name: "Embedding (text-3-large)", type: "AI_TOKEN" as ItemType, description: "OpenAI text-embedding-3-large", unit: "1M tokens", rate: 0.13, isActive: true },
]

// --- Monthly AI/API Usage ---
export const mockApiUsage = [
  { month: "Jan", claudeOpus: 320.00, claudeSonnet: 85.00, gpt4o: 45.00, embedding: 12.00, hosting: 148.00 },
  { month: "Feb", claudeOpus: 410.00, claudeSonnet: 120.00, gpt4o: 38.00, embedding: 15.00, hosting: 148.00 },
  { month: "Mar", claudeOpus: 525.00, claudeSonnet: 95.00, gpt4o: 52.00, embedding: 18.00, hosting: 148.00 },
]

// --- Proposals ---
export const mockProposals = [
  { id: "p1", number: "PROP-0001", title: "Website Redesign & Development", client: "TechFlow Solutions", status: "APPROVED", total: 12350.00, date: "2026-03-15", validUntil: "2026-04-15" },
  { id: "p2", number: "PROP-0002", title: "Mobile App MVP Development", client: "Green Digital", status: "SENT", total: 28600.00, date: "2026-03-22", validUntil: "2026-04-22" },
  { id: "p3", number: "PROP-0003", title: "API Integration Suite", client: "Nova Finance", status: "DRAFT", total: 8450.00, date: "2026-04-01", validUntil: "2026-05-01" },
  { id: "p4", number: "PROP-0004", title: "Blockchain Payment Gateway", client: "BlockPay Systems", status: "APPROVED", total: 45000.00, date: "2026-03-10", validUntil: "2026-04-10" },
  { id: "p5", number: "PROP-0005", title: "Dashboard Analytics Platform", client: "DataStream Analytics", status: "REJECTED", total: 15600.00, date: "2026-02-28", validUntil: "2026-03-28" },
]

// --- Estimates ---
export const mockEstimates = [
  { id: "e1", number: "EST-0001", title: "E-commerce Platform", client: "TechFlow Solutions", status: "ACCEPTED", total: 18200.00, date: "2026-03-20" },
  { id: "e2", number: "EST-0002", title: "CRM Custom Module", client: "Green Digital", status: "SENT", total: 6500.00, date: "2026-03-25" },
  { id: "e3", number: "EST-0003", title: "Data Pipeline Setup", client: "DataStream Analytics", status: "DRAFT", total: 9750.00, date: "2026-04-02" },
  { id: "e4", number: "EST-0004", title: "Security Audit & Fixes", client: "BlockPay Systems", status: "CONVERTED", total: 4550.00, date: "2026-03-05" },
]

// --- Invoices ---
export const mockInvoices = [
  { id: "i1", number: "INV-0001", title: "Website Redesign - Phase 1", client: "TechFlow Solutions", status: "PAID", total: 6175.00, amountPaid: 6175.00, amountDue: 0, issueDate: "2026-03-01", dueDate: "2026-03-31" },
  { id: "i2", number: "INV-0002", title: "Website Redesign - Phase 2", client: "TechFlow Solutions", status: "SENT", total: 6175.00, amountPaid: 0, amountDue: 6175.00, issueDate: "2026-03-20", dueDate: "2026-04-20" },
  { id: "i3", number: "INV-0003", title: "Blockchain Gateway - Milestone 1", client: "BlockPay Systems", status: "PARTIAL", total: 15000.00, amountPaid: 7500.00, amountDue: 7500.00, issueDate: "2026-03-15", dueDate: "2026-04-15" },
  { id: "i4", number: "INV-0004", title: "Security Audit", client: "BlockPay Systems", status: "PAID", total: 4550.00, amountPaid: 4550.00, amountDue: 0, issueDate: "2026-03-10", dueDate: "2026-04-10" },
  { id: "i5", number: "INV-0005", title: "API Integration - Sprint 1", client: "Nova Finance", status: "OVERDUE", total: 4225.00, amountPaid: 0, amountDue: 4225.00, issueDate: "2026-02-15", dueDate: "2026-03-15" },
  { id: "i6", number: "INV-0006", title: "CRM Module Development", client: "Green Digital", status: "DRAFT", total: 6500.00, amountPaid: 0, amountDue: 6500.00, issueDate: "2026-04-01", dueDate: "2026-05-01" },
]

// --- Payments ---
export const mockPayments = [
  { id: "pay1", number: "PAY-0001", client: "TechFlow Solutions", invoice: "INV-0001", amount: 6175.00, method: "BANK_TRANSFER", status: "COMPLETED", date: "2026-03-28" },
  { id: "pay2", number: "PAY-0002", client: "BlockPay Systems", invoice: "INV-0003", amount: 7500.00, method: "BANK_TRANSFER", status: "COMPLETED", date: "2026-03-25" },
  { id: "pay3", number: "PAY-0003", client: "BlockPay Systems", invoice: "INV-0004", amount: 4550.00, method: "CRYPTO", status: "COMPLETED", date: "2026-03-20" },
  { id: "pay4", number: "PAY-0004", client: "Nova Finance", invoice: "INV-0005", amount: 4225.00, method: "BANK_TRANSFER", status: "PENDING", date: "2026-04-05" },
]

// --- Bank Accounts ---
export const mockBankAccounts = [
  { id: "ba1", name: "Main Business Account", bankName: "Republic Bank", accountNumber: "****4521", type: "CHECKING", currency: "USD", balance: 87450.00, isDefault: true },
  { id: "ba2", name: "Savings Account", bankName: "Republic Bank", accountNumber: "****8834", type: "SAVINGS", currency: "USD", balance: 45000.00, isDefault: false },
  { id: "ba3", name: "Cash on Hand", bankName: "—", accountNumber: "CASH", type: "CASH", currency: "USD", balance: 2350.00, isDefault: false },
  { id: "ba4", name: "USDT Wallet (TRC-20)", bankName: "Tron Network", accountNumber: "TQn9Y...x7Vk", type: "CRYPTO", currency: "USDT", balance: 12800.00, isDefault: false },
  { id: "ba5", name: "USDT Wallet (ERC-20)", bankName: "Ethereum Network", accountNumber: "0x7aB3...9f2E", type: "CRYPTO", currency: "USDT", balance: 4550.00, isDefault: false },
  { id: "ba6", name: "BTC Wallet", bankName: "Bitcoin Network", accountNumber: "bc1qxy...m4g2", type: "CRYPTO", currency: "BTC", balance: 8250.00, isDefault: false },
]

// --- Transactions ---
export const mockTransactions = [
  { id: "t1", type: "DEPOSIT", amount: 6175.00, description: "Payment from TechFlow Solutions - INV-0001", bank: "Main Business Account", date: "2026-03-28" },
  { id: "t2", type: "DEPOSIT", amount: 7500.00, description: "Payment from BlockPay Systems - INV-0003", bank: "Main Business Account", date: "2026-03-25" },
  { id: "t3", type: "WITHDRAWAL", amount: 3200.00, description: "Monthly office rent", bank: "Main Business Account", date: "2026-03-01" },
  { id: "t4", type: "DEPOSIT", amount: 4550.00, description: "Payment from BlockPay Systems - INV-0004", bank: "Main Business Account", date: "2026-03-20" },
  { id: "t5", type: "WITHDRAWAL", amount: 899.00, description: "Software subscriptions", bank: "Main Business Account", date: "2026-03-15" },
  { id: "t6", type: "TRANSFER", amount: 10000.00, description: "Transfer to savings", bank: "Savings Account", date: "2026-03-10" },
  { id: "t7", type: "FEE", amount: 45.00, description: "Bank service fee", bank: "Main Business Account", date: "2026-03-31" },
  { id: "t8", type: "DEPOSIT", amount: 4550.00, description: "Crypto payment - BlockPay INV-0004 (USDT TRC-20)", bank: "USDT Wallet (TRC-20)", date: "2026-03-20" },
  { id: "t9", type: "DEPOSIT", amount: 12800.00, description: "Client advance - BlockPay Gateway project", bank: "USDT Wallet (TRC-20)", date: "2026-03-12" },
  { id: "t10", type: "WITHDRAWAL", amount: 5000.00, description: "USDT → USD conversion via Kraken", bank: "USDT Wallet (ERC-20)", date: "2026-03-18" },
  { id: "t11", type: "FEE", amount: 12.50, description: "Tron network gas fee", bank: "USDT Wallet (TRC-20)", date: "2026-03-20" },
]

// --- Expenses ---
export const mockExpenses = [
  { id: "ex1", description: "Vercel Pro Plan", amount: 240.00, category: "SOFTWARE", vendor: "Vercel", status: "PAID", date: "2026-03-01" },
  { id: "ex2", description: "GitHub Enterprise", amount: 252.00, category: "SOFTWARE", vendor: "GitHub", status: "PAID", date: "2026-03-01" },
  { id: "ex3", description: "Office Space Rent", amount: 3200.00, category: "OFFICE", vendor: "Paradise Realty", status: "PAID", date: "2026-03-01" },
  { id: "ex4", description: "MacBook Pro M4", amount: 3499.00, category: "HARDWARE", vendor: "Apple", status: "APPROVED", date: "2026-03-15" },
  { id: "ex5", description: "Google Ads Campaign", amount: 1500.00, category: "MARKETING", vendor: "Google", status: "PENDING", date: "2026-03-20" },
  { id: "ex6", description: "Contractor - UI Design", amount: 2600.00, category: "CONTRACTOR", vendor: "DesignPro", status: "PAID", date: "2026-03-10" },
]

// --- Credits ---
export const mockCredits = [
  { id: "cr1", number: "CR-0001", description: "Overpayment refund - TechFlow", amount: 500.00, remaining: 500.00, status: "ACTIVE", issuedAt: "2026-03-20" },
  { id: "cr2", number: "CR-0002", description: "Service credit - project scope change", amount: 1200.00, remaining: 0, status: "USED", issuedAt: "2026-02-15" },
]

// --- Loans ---
export const mockLoans = [
  { id: "l1", name: "Business Equipment Loan", lender: "Republic Bank", amount: 25000.00, remainingBalance: 18750.00, interestRate: 5.5, monthlyPayment: 478.00, startDate: "2025-06-01", endDate: "2030-06-01", status: "ACTIVE" },
  { id: "l2", name: "Working Capital Line", lender: "First Citizens Bank", amount: 50000.00, remainingBalance: 35000.00, interestRate: 7.2, monthlyPayment: 990.00, startDate: "2025-09-01", endDate: "2029-09-01", status: "ACTIVE" },
]

// --- Dashboard KPIs ---
export const dashboardKPIs = {
  totalRevenue: 54625.00,
  outstandingInvoices: 17900.00,
  totalExpenses: 11291.00,
  netIncome: 43334.00,
  revenueChange: "+18.3%",
  expenseChange: "+5.2%",
  invoicesPaid: 2,
  invoicesPending: 4,
  cashOnHand: 134800.00,
  proposalsWon: 2,
  proposalsTotal: 5,
}

// --- Monthly Revenue (for chart) ---
export const monthlyRevenue = [
  { month: "Oct", revenue: 28000, expenses: 8500 },
  { month: "Nov", revenue: 32000, expenses: 9200 },
  { month: "Dec", revenue: 25000, expenses: 10100 },
  { month: "Jan", revenue: 38000, expenses: 9800 },
  { month: "Feb", revenue: 42000, expenses: 10500 },
  { month: "Mar", revenue: 54625, expenses: 11291 },
]
