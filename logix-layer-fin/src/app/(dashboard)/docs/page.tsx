"use client"

/**
 * Documentation Page
 * WAT:    Comprehensive system documentation and API reference
 * WAAROM: Single source of truth for all system features and endpoints
 */

import { Header } from "@/components/dashboard/header"
import {
  LayoutDashboard,
  FileText,
  Calculator,
  Receipt,
  CreditCard,
  Landmark,
  ArrowDownUp,
  Wallet,
  TrendingDown,
  Users,
  Package,
  Bitcoin,
  CalendarDays,
  BarChart3,
  FolderKanban,
  ClipboardList,
  ListTodo,
  Settings,
  BookOpen,
  Code,
  Database,
  Palette,
  GitBranch,
  Server,
} from "lucide-react"

interface ModuleInfo {
  name: string
  icon: React.ReactNode
  description: string
  features: string[]
}

interface ApiEndpoint {
  method: string
  path: string
  description: string
}

const modules: ModuleInfo[] = [
  {
    name: "Dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    description: "Financial overview with KPIs, charts, and real-time insights",
    features: [
      "Revenue & expense tracking",
      "Invoice status dashboard",
      "Proposal conversion rates",
      "Cash position overview",
      "6-month financial trends",
    ],
  },
  {
    name: "CRM",
    icon: <Users className="h-5 w-5" />,
    description: "Client and service/product management",
    features: [
      "Client profiles with detailed history",
      "11-tab client detail view (Profile, Proposals, Estimates, Invoices, Payments, Projects, Work Orders, Tasks, API Keys, AI Tokens, Notes)",
      "Service & product catalog",
      "Item types: SERVICE, PRODUCT, API_COST, AI_TOKEN",
      "Inline item editing",
    ],
  },
  {
    name: "Sales",
    icon: <FileText className="h-5 w-5" />,
    description: "Complete sales pipeline and revenue management",
    features: [
      "Proposals: Create, send, track with line items",
      "Estimates: Create and convert to invoices",
      "Invoices: Full invoicing with partial payments, status tracking",
      "Payments: Record with multiple methods (Bank, Cash, Card, PayPal, Crypto)",
      "Automatic calculations and totals",
    ],
  },
  {
    name: "Project Management",
    icon: <FolderKanban className="h-5 w-5" />,
    description: "Project tracking and team collaboration",
    features: [
      "Projects: Budget tracking, progress monitoring",
      "Work Orders: Linked to projects, hours × rate calculation",
      "Tasks: List, Kanban, and Gantt view options",
      "Priority levels and status tracking",
      "Client assignment and deadline management",
    ],
  },
  {
    name: "Banking",
    icon: <Landmark className="h-5 w-5" />,
    description: "Multi-currency and crypto account management",
    features: [
      "DSB Bank accounts (SRD, USD, EUR)",
      "Crypto wallets (USDT, BTC)",
      "Transaction tracking: Deposit, Withdrawal, Transfer, Fee",
      "Real-time balance tracking",
      "Multi-currency support",
    ],
  },
  {
    name: "Accounting",
    icon: <Calculator className="h-5 w-5" />,
    description: "Double-entry bookkeeping and financial controls",
    features: [
      "Expense tracking with approval workflow",
      "Category-based expense management",
      "Credit note management",
      "Loan tracking with amortization",
      "General Ledger with chart of accounts",
      "Double-entry bookkeeping compliance",
    ],
  },
  {
    name: "Calendar",
    icon: <CalendarDays className="h-5 w-5" />,
    description: "Month view with unified event tracking",
    features: [
      "Events from all modules integrated",
      "Month view calendar",
      "Multi-source event display",
    ],
  },
  {
    name: "Reports",
    icon: <BarChart3 className="h-5 w-5" />,
    description: "Advanced analytics and financial reporting",
    features: [
      "Financial reports with trends",
      "Sales analytics",
      "Client analytics",
      "Interactive charts",
    ],
  },
  {
    name: "User Management",
    icon: <Users className="h-5 w-5" />,
    description: "Team collaboration and access control",
    features: [
      "Role-based access control",
      "Roles: Owner, Admin, Member, Viewer",
      "Team member management",
      "Organization-wide configuration",
    ],
  },
  {
    name: "Settings",
    icon: <Settings className="h-5 w-5" />,
    description: "System configuration and preferences",
    features: [
      "Organization settings",
      "Currency and localization",
      "Integration management",
      "User preferences",
    ],
  },
]

const apiEndpoints: ApiEndpoint[] = [
  { method: "GET", path: "/api/dashboard", description: "Get KPI metrics and dashboard data" },
  { method: "GET", path: "/api/clients", description: "List all clients" },
  { method: "POST", path: "/api/clients", description: "Create a new client" },
  { method: "GET", path: "/api/clients/[id]", description: "Get client details" },
  { method: "PUT", path: "/api/clients/[id]", description: "Update client" },
  { method: "DELETE", path: "/api/clients/[id]", description: "Delete client" },
  { method: "GET", path: "/api/items", description: "List all items" },
  { method: "POST", path: "/api/items", description: "Create item" },
  { method: "GET", path: "/api/items/[id]", description: "Get item details" },
  { method: "PUT", path: "/api/items/[id]", description: "Update item" },
  { method: "DELETE", path: "/api/items/[id]", description: "Delete item" },
  { method: "GET", path: "/api/proposals", description: "List proposals" },
  { method: "POST", path: "/api/proposals", description: "Create proposal" },
  { method: "GET", path: "/api/proposals/[id]", description: "Get proposal details" },
  { method: "PUT", path: "/api/proposals/[id]", description: "Update proposal" },
  { method: "DELETE", path: "/api/proposals/[id]", description: "Delete proposal" },
  { method: "GET", path: "/api/estimates", description: "List estimates" },
  { method: "POST", path: "/api/estimates", description: "Create estimate" },
  { method: "GET", path: "/api/estimates/[id]", description: "Get estimate details" },
  { method: "PUT", path: "/api/estimates/[id]", description: "Update estimate" },
  { method: "GET", path: "/api/invoices", description: "List invoices" },
  { method: "POST", path: "/api/invoices", description: "Create invoice" },
  { method: "GET", path: "/api/invoices/[id]", description: "Get invoice details" },
  { method: "PUT", path: "/api/invoices/[id]", description: "Update invoice" },
  { method: "DELETE", path: "/api/invoices/[id]", description: "Delete invoice" },
  { method: "GET", path: "/api/payments", description: "List payments" },
  { method: "POST", path: "/api/payments", description: "Record payment" },
  { method: "GET", path: "/api/payments/[id]", description: "Get payment details" },
  { method: "GET", path: "/api/banks", description: "List bank accounts" },
  { method: "POST", path: "/api/banks", description: "Create bank account" },
  { method: "GET", path: "/api/banks/[id]", description: "Get account details" },
  { method: "PUT", path: "/api/banks/[id]", description: "Update account" },
  { method: "GET", path: "/api/transactions", description: "List transactions" },
  { method: "POST", path: "/api/transactions", description: "Create transaction" },
  { method: "GET", path: "/api/expenses", description: "List expenses" },
  { method: "POST", path: "/api/expenses", description: "Create expense" },
  { method: "GET", path: "/api/expenses/[id]", description: "Get expense details" },
  { method: "PUT", path: "/api/expenses/[id]", description: "Update expense" },
  { method: "GET", path: "/api/credits", description: "List credits" },
  { method: "POST", path: "/api/credits", description: "Create credit" },
  { method: "GET", path: "/api/loans", description: "List loans" },
  { method: "POST", path: "/api/loans", description: "Create loan" },
  { method: "GET", path: "/api/loans/[id]", description: "Get loan details" },
  { method: "GET", path: "/api/general-ledger", description: "Get ledger entries" },
  { method: "POST", path: "/api/general-ledger", description: "Create ledger entry" },
]

const dbModels = [
  {
    name: "Organization",
    fields: "id, name, website, logo, address, phone, email, taxId, currency",
  },
  {
    name: "Member",
    fields: "id, clerkUserId, email, name, role (OWNER|ADMIN|MEMBER|VIEWER), organizationId",
  },
  {
    name: "Client",
    fields: "id, name, email, phone, company, address, taxId, currency, status (ACTIVE|INACTIVE|LEAD|ARCHIVED)",
  },
  {
    name: "Item",
    fields: "id, name, type (SERVICE|PRODUCT|API_COST|AI_TOKEN), description, unit, rate, isActive",
  },
  {
    name: "Proposal",
    fields: "id, number, title, status (DRAFT|SENT|APPROVED|REJECTED|EXPIRED), clientId, subtotal, taxRate, taxAmount, total, validUntil",
  },
  {
    name: "ProposalItem",
    fields: "id, proposalId, description, hours, rate, amount, sortOrder",
  },
  {
    name: "Estimate",
    fields: "id, number, title, status (DRAFT|SENT|ACCEPTED|REJECTED|CONVERTED), clientId, subtotal, taxRate, total, convertedToInvoiceId",
  },
  {
    name: "EstimateItem",
    fields: "id, estimateId, description, hours, rate, amount, sortOrder",
  },
  {
    name: "Invoice",
    fields: "id, number, title, status (DRAFT|SENT|VIEWED|PARTIAL|PAID|OVERDUE|CANCELLED), clientId, subtotal, taxRate, total, amountPaid, amountDue, issueDate, dueDate",
  },
  {
    name: "InvoiceItem",
    fields: "id, invoiceId, description, hours, rate, amount, sortOrder",
  },
  {
    name: "Payment",
    fields: "id, number, amount, method (BANK_TRANSFER|CASH|CREDIT_CARD|PAYPAL|CRYPTO|CHECK), status (PENDING|COMPLETED|FAILED|REFUNDED), invoiceId, clientId, bankAccountId, receivedAt",
  },
  {
    name: "BankAccount",
    fields: "id, name, bankName, accountNumber, iban, swift, type (CHECKING|SAVINGS|CASH|CRYPTO), currency, balance, isDefault",
  },
  {
    name: "Transaction",
    fields: "id, type (DEPOSIT|WITHDRAWAL|TRANSFER|FEE), amount, description, reference, bankAccountId, date",
  },
  {
    name: "Expense",
    fields: "id, description, amount, category (SOFTWARE|HARDWARE|OFFICE|TRAVEL|MARKETING|SALARY|CONTRACTOR|UTILITIES|INSURANCE|TAX|OTHER), status (PENDING|APPROVED|REJECTED|PAID), date",
  },
  {
    name: "Credit",
    fields: "id, number, description, amount, remaining, status (ACTIVE|USED|EXPIRED|CANCELLED), reason, issuedAt, expiresAt",
  },
  {
    name: "Loan",
    fields: "id, name, lender, amount, remainingBalance, interestRate, monthlyPayment, startDate, endDate, status (ACTIVE|PAID_OFF|DEFAULTED)",
  },
  {
    name: "ChartOfAccount",
    fields: "id, code, name, type (ASSET|LIABILITY|EQUITY|REVENUE|EXPENSE), subtype, description, isActive",
  },
  {
    name: "LedgerEntry",
    fields: "id, date, description, debit, credit, accountId, reference, organizationId",
  },
  {
    name: "Project",
    fields: "id, name, clientId, status (PLANNING|IN_PROGRESS|COMPLETED|ON_HOLD|CANCELLED), priority, progress, budget, spent, startDate, deadline",
  },
  {
    name: "WorkOrder",
    fields: "id, number, title, projectId, status (TODO|IN_PROGRESS|COMPLETED), assignee, hours, rate, date",
  },
  {
    name: "Task",
    fields: "id, title, projectId, workOrderId, status (TODO|IN_PROGRESS|DONE), priority, assignee, dueDate",
  },
]

export default function DocsPage() {
  return (
    <div>
      <Header
        title="Documentation"
        subtitle="Complete reference for Logix Layer Finance Department Dashboard"
      />

      <div className="p-6 space-y-8">
        {/* System Overview */}
        <section className="card p-6 border border-surface-200">
          <div className="flex items-start gap-4 mb-4">
            <div className="rounded-lg bg-brand-50 p-3">
              <BookOpen className="h-6 w-6 text-brand-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-surface-900 mb-2">
                Logix Layer N.V. Finance Department Dashboard
              </h2>
              <p className="text-sm text-surface-600 mb-4">
                A comprehensive internal finance dashboard built with modern web technologies,
                designed for complete financial management across all organizational functions.
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs font-semibold text-surface-500 uppercase mb-1">
                    Platform
                  </p>
                  <p className="text-sm font-medium text-surface-900">Next.js 16 + React 19</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-surface-500 uppercase mb-1">
                    Database
                  </p>
                  <p className="text-sm font-medium text-surface-900">PostgreSQL (Neon)</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-surface-500 uppercase mb-1">
                    Deployment
                  </p>
                  <p className="text-sm font-medium text-surface-900">Vercel</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Modules */}
        <section>
          <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-brand-600" />
            Core Modules
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {modules.map((module) => (
              <div key={module.name} className="card p-5 border border-surface-200">
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-brand-600">{module.icon}</div>
                  <h3 className="font-semibold text-surface-900">{module.name}</h3>
                </div>
                <p className="text-sm text-surface-600 mb-3">{module.description}</p>
                <ul className="space-y-1.5">
                  {module.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-surface-700">
                      <span className="text-brand-500 font-bold mt-0.5">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Tech Stack */}
        <section>
          <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
            <Server className="h-5 w-5 text-brand-600" />
            Technology Stack
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="card p-5 border border-surface-200">
              <h3 className="font-semibold text-surface-900 mb-3 flex items-center gap-2">
                <Code className="h-4 w-4 text-brand-600" />
                Frontend
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="text-surface-700">
                  <span className="font-medium text-surface-900">Next.js</span> 16 - React
                  framework
                </li>
                <li className="text-surface-700">
                  <span className="font-medium text-surface-900">React</span> 19 - UI library
                </li>
                <li className="text-surface-700">
                  <span className="font-medium text-surface-900">TypeScript</span> 5.9 - Type
                  safety
                </li>
                <li className="text-surface-700">
                  <span className="font-medium text-surface-900">Tailwind CSS</span> 3 - Styling
                </li>
                <li className="text-surface-700">
                  <span className="font-medium text-surface-900">Recharts</span> - Charts &
                  visualization
                </li>
                <li className="text-surface-700">
                  <span className="font-medium text-surface-900">Lucide React</span> - Icons
                </li>
              </ul>
            </div>
            <div className="card p-5 border border-surface-200">
              <h3 className="font-semibold text-surface-900 mb-3 flex items-center gap-2">
                <Database className="h-4 w-4 text-brand-600" />
                Backend & Infrastructure
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="text-surface-700">
                  <span className="font-medium text-surface-900">PostgreSQL</span> - Neon
                  serverless
                </li>
                <li className="text-surface-700">
                  <span className="font-medium text-surface-900">Prisma</span> 7 - ORM
                </li>
                <li className="text-surface-700">
                  <span className="font-medium text-surface-900">Clerk</span> - Authentication
                </li>
                <li className="text-surface-700">
                  <span className="font-medium text-surface-900">Vercel</span> - Deployment &
                  hosting
                </li>
                <li className="text-surface-700">
                  <span className="font-medium text-surface-900">Next.js API Routes</span> - Backend
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* API Reference */}
        <section>
          <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-brand-600" />
            API Endpoints Reference
          </h2>
          <div className="card border border-surface-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-200 bg-surface-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-surface-700 w-24">
                      METHOD
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-surface-700">
                      ENDPOINT
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-surface-700">
                      DESCRIPTION
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {apiEndpoints.map((endpoint, idx) => (
                    <tr key={idx} className="hover:bg-surface-50">
                      <td className="px-4 py-3">
                        <span
                          className={`text-2xs font-bold px-2 py-1 rounded ${
                            endpoint.method === "GET"
                              ? "bg-blue-100 text-blue-800"
                              : endpoint.method === "POST"
                                ? "bg-green-100 text-green-800"
                                : endpoint.method === "PUT"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-red-100 text-red-800"
                          }`}
                        >
                          {endpoint.method}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-2xs font-mono bg-surface-100 text-surface-800 px-2 py-1 rounded">
                          {endpoint.path}
                        </code>
                      </td>
                      <td className="px-4 py-3 text-sm text-surface-600">
                        {endpoint.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Database Schema */}
        <section>
          <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
            <Database className="h-5 w-5 text-brand-600" />
            Database Models & Schema
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {dbModels.map((model) => (
              <div key={model.name} className="card p-4 border border-surface-200">
                <h3 className="font-semibold text-surface-900 mb-2 text-sm">{model.name}</h3>
                <code className="text-2xs font-mono text-surface-600 leading-relaxed block p-3 bg-surface-50 rounded overflow-x-auto">
                  {model.fields}
                </code>
              </div>
            ))}
          </div>
        </section>

        {/* Design System */}
        <section>
          <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
            <Palette className="h-5 w-5 text-brand-600" />
            Design System
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="card p-5 border border-surface-200">
              <h3 className="font-semibold text-surface-900 mb-4">Brand Colors</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-[#3B2D8E] border border-surface-200" />
                  <div>
                    <p className="text-sm font-medium text-surface-900">Primary Purple</p>
                    <p className="text-2xs text-surface-500">#3B2D8E</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-[#6DC944] border border-surface-200" />
                  <div>
                    <p className="text-sm font-medium text-surface-900">Accent Green</p>
                    <p className="text-2xs text-surface-500">#6DC944</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="card p-5 border border-surface-200">
              <h3 className="font-semibold text-surface-900 mb-4">CSS Classes</h3>
              <ul className="space-y-2 text-sm">
                <li className="font-mono text-2xs bg-surface-50 text-surface-800 px-2 py-1 rounded">
                  .card
                </li>
                <li className="font-mono text-2xs bg-surface-50 text-surface-800 px-2 py-1 rounded">
                  .btn-primary / .btn-secondary / .btn-ghost
                </li>
                <li className="font-mono text-2xs bg-surface-50 text-surface-800 px-2 py-1 rounded">
                  .input / .label
                </li>
                <li className="font-mono text-2xs bg-surface-50 text-surface-800 px-2 py-1 rounded">
                  .table-compact
                </li>
                <li className="font-mono text-2xs bg-surface-50 text-surface-800 px-2 py-1 rounded">
                  .badge (variants: success, danger, warning, info)
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Data Types & Enums */}
        <section>
          <h2 className="text-lg font-bold text-surface-900 mb-4">Key Enums & Data Types</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="card p-4 border border-surface-200">
              <h4 className="font-semibold text-surface-900 mb-3 text-sm">Invoice Status</h4>
              <div className="space-y-1 text-sm text-surface-700">
                <p>DRAFT, SENT, VIEWED</p>
                <p>PARTIAL, PAID, OVERDUE</p>
                <p>CANCELLED</p>
              </div>
            </div>
            <div className="card p-4 border border-surface-200">
              <h4 className="font-semibold text-surface-900 mb-3 text-sm">Payment Methods</h4>
              <div className="space-y-1 text-sm text-surface-700">
                <p>BANK_TRANSFER, CASH</p>
                <p>CREDIT_CARD, PAYPAL</p>
                <p>CRYPTO, CHECK</p>
              </div>
            </div>
            <div className="card p-4 border border-surface-200">
              <h4 className="font-semibold text-surface-900 mb-3 text-sm">User Roles</h4>
              <div className="space-y-1 text-sm text-surface-700">
                <p>OWNER (Full access)</p>
                <p>ADMIN (Configuration)</p>
                <p>MEMBER (Operations)</p>
                <p>VIEWER (Read-only)</p>
              </div>
            </div>
            <div className="card p-4 border border-surface-200">
              <h4 className="font-semibold text-surface-900 mb-3 text-sm">Expense Category</h4>
              <div className="space-y-1 text-sm text-surface-700">
                <p>SOFTWARE, HARDWARE</p>
                <p>OFFICE, TRAVEL, MARKETING</p>
                <p>SALARY, CONTRACTOR</p>
                <p>UTILITIES, INSURANCE, TAX</p>
              </div>
            </div>
            <div className="card p-4 border border-surface-200">
              <h4 className="font-semibold text-surface-900 mb-3 text-sm">Account Types</h4>
              <div className="space-y-1 text-sm text-surface-700">
                <p>ASSET</p>
                <p>LIABILITY, EQUITY</p>
                <p>REVENUE, EXPENSE</p>
              </div>
            </div>
            <div className="card p-4 border border-surface-200">
              <h4 className="font-semibold text-surface-900 mb-3 text-sm">Project Status</h4>
              <div className="space-y-1 text-sm text-surface-700">
                <p>PLANNING, IN_PROGRESS</p>
                <p>COMPLETED, ON_HOLD</p>
                <p>CANCELLED</p>
              </div>
            </div>
          </div>
        </section>

        {/* Getting Started */}
        <section className="card p-6 border border-surface-200 bg-surface-50">
          <h2 className="text-lg font-bold text-surface-900 mb-4">Quick Start</h2>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-surface-900 mb-2 flex items-center gap-2">
                <span className="inline-block h-6 w-6 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold">
                  1
                </span>
                Access the Dashboard
              </h4>
              <p className="text-sm text-surface-700 ml-8">
                Log in with your Clerk credentials to access the main dashboard view with KPIs
                and financial overview.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-surface-900 mb-2 flex items-center gap-2">
                <span className="inline-block h-6 w-6 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold">
                  2
                </span>
                Navigate Modules
              </h4>
              <p className="text-sm text-surface-700 ml-8">
                Use the left sidebar to navigate between CRM, Sales, Project Management, Banking,
                and Accounting modules.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-surface-900 mb-2 flex items-center gap-2">
                <span className="inline-block h-6 w-6 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold">
                  3
                </span>
                Create & Manage Records
              </h4>
              <p className="text-sm text-surface-700 ml-8">
                Use action buttons to create clients, invoices, proposals, and other financial
                records. Each module supports full CRUD operations.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-surface-900 mb-2 flex items-center gap-2">
                <span className="inline-block h-6 w-6 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold">
                  4
                </span>
                Generate Reports
              </h4>
              <p className="text-sm text-surface-700 ml-8">
                Navigate to Reports for comprehensive financial, sales, and client analytics with
                interactive charts and trends.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center py-8 text-sm text-surface-500">
          <p>
            Logix Layer Finance Department Dashboard | Built with Next.js, TypeScript, and Tailwind
            CSS
          </p>
          <p className="mt-2">Deployed on Vercel | Database: PostgreSQL (Neon)</p>
        </div>
      </div>
    </div>
  )
}
