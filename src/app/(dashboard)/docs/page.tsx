"use client"

/**
 * User-Friendly Documentation Page
 * For end-users of the Logix Layer Finance Dashboard
 */

import { useState } from "react"
import { Header } from "@/components/dashboard/header"
import {
  LayoutDashboard,
  FileText,
  Calculator,
  Receipt,
  CreditCard,
  Landmark,
  Wallet,
  Users,
  Package,
  CalendarDays,
  BarChart3,
  FolderKanban,
  ListTodo,
  Settings,
  BookOpen,
  ChevronDown,
  Search,
  Zap,
  HelpCircle,
  MessageCircle,
  Mail,
  Phone,
} from "lucide-react"

interface AccordionItem {
  id: string
  title: string
  icon: React.ReactNode
  content: React.ReactNode
}

interface FAQItem {
  question: string
  answer: string
}

const AccordionSection = ({
  item,
  isOpen,
  onToggle,
}: {
  item: AccordionItem
  isOpen: boolean
  onToggle: () => void
}) => (
  <div className="card border border-surface-200 mb-3">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-4 hover:bg-surface-50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="text-brand-600">{item.icon}</div>
        <h3 className="font-semibold text-surface-900 text-left">{item.title}</h3>
      </div>
      <ChevronDown
        className={`h-5 w-5 text-surface-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
      />
    </button>
    {isOpen && <div className="px-4 pb-4 border-t border-surface-100 text-sm text-surface-700">{item.content}</div>}
  </div>
)

export default function DocsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [openAccordions, setOpenAccordions] = useState<string[]>([])

  const toggleAccordion = (id: string) => {
    setOpenAccordions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const faqItems: FAQItem[] = [
    {
      question: "How do I create an invoice from an estimate?",
      answer:
        "Navigate to your estimate in the Sales section. Click the Convert button at the top of the estimate. The system will create a new invoice with the same line items and amounts. You can then send it to your client.",
    },
    {
      question: "How do I add a new team member?",
      answer:
        "Go to Settings and find the Team or Users section. Click Add Team Member and enter their email address. Select their role (Owner, Admin, Member, or Viewer) based on what access they need. They will receive an invitation email.",
    },
    {
      question: "What do the different invoice statuses mean?",
      answer:
        "Draft = Not sent yet. Sent = Delivered to client. Viewed = Client has opened it. Partial = Client paid part of the amount. Paid = Fully paid. Overdue = Payment deadline passed. Cancelled = Invoice no longer valid.",
    },
    {
      question: "How do I export my data?",
      answer:
        "Look for the Export button in your module (usually near the top right). You can export to CSV or PDF format. Your data will download to your computer where you can open it in Excel or view as a PDF.",
    },
    {
      question: "How do I use the Scrum board for projects?",
      answer:
        "In Project Management, click the Scrum Board view. You'll see Backlog, Current Sprint, and Completed sections. Drag tasks between sections, assign team members, and set story points. Use Sprints to organize work into time-boxed iterations.",
    },
    {
      question: "How do I import clients in bulk?",
      answer:
        "In CRM, look for the Import button. Prepare a CSV file with client details (name, email, phone, etc.). Upload your file and map the columns to match your data. Review and confirm the import.",
    },
    {
      question: "What are the different user roles and what can each do?",
      answer:
        "Owner: Full access to all features and settings. Admin: Can manage team, settings, and all data. Member: Can create and manage records in assigned areas. Viewer: Read-only access, cannot make changes.",
    },
    {
      question: "How do I record a payment from a client?",
      answer:
        "Open the invoice from Sales. Click Record Payment at the bottom. Enter the amount received, select the payment method (Bank Transfer, Cash, Card, PayPal, or Crypto), and click Save. The invoice status will update automatically.",
    },
    {
      question: "Can I see all my financial data in one place?",
      answer:
        "Yes! The Dashboard shows your KPIs, revenue, expenses, cash position, and 6-month trends at a glance. For more detail, go to Reports to see financial statements, sales analytics, and client performance.",
    },
  ]

  const moduleGuides: AccordionItem[] = [
    {
      id: "dashboard",
      title: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      content: (
        <div className="space-y-3">
          <p>
            Your Dashboard is your financial command center. It shows you the most important numbers at a glance.
          </p>
          <div className="bg-surface-50 p-3 rounded space-y-2">
            <p className="font-semibold text-surface-900">Key metrics you'll see:</p>
            <ul className="space-y-1 ml-4">
              <li>• <strong>Total Revenue:</strong> How much money came in</li>
              <li>• <strong>Total Expenses:</strong> How much you spent</li>
              <li>• <strong>Cash Position:</strong> Money in your bank accounts</li>
              <li>• <strong>Invoices by Status:</strong> How many are paid, pending, overdue</li>
              <li>• <strong>6-Month Trend:</strong> Visual chart showing your financial direction</li>
            </ul>
          </div>
          <p>
            Click on any card to drill down into details. Use the date range picker at the top to see data for specific periods.
          </p>
        </div>
      ),
    },
    {
      id: "crm",
      title: "CRM - Managing Clients",
      icon: <Users className="h-5 w-5" />,
      content: (
        <div className="space-y-3">
          <p>
            Keep track of all your clients in one place. Your client data is the foundation of your business.
          </p>
          <div className="bg-surface-50 p-3 rounded space-y-2">
            <p className="font-semibold text-surface-900">What you can do:</p>
            <ul className="space-y-1 ml-4">
              <li>• <strong>Add a Client:</strong> Click the + button and fill in their details (name, email, phone, company)</li>
              <li>• <strong>View Client History:</strong> Click on a client to see all their proposals, estimates, invoices, payments, and projects</li>
              <li>• <strong>Manage Items/Services:</strong> Create a catalog of services or products you sell. Set prices here once, reuse them across proposals and invoices</li>
              <li>• <strong>Track Client Status:</strong> Mark clients as Active, Inactive, Lead, or Archived</li>
            </ul>
          </div>
          <p className="text-xs text-surface-600 mt-3">
            Pro tip: Keep client information updated. Accurate contact details make it easier to send invoices and proposals.
          </p>
        </div>
      ),
    },
    {
      id: "sales",
      title: "Sales - Proposals, Estimates & Invoices",
      icon: <FileText className="h-5 w-5" />,
      content: (
        <div className="space-y-3">
          <p>
            Manage your complete sales workflow from proposal to payment. This is where your revenue comes from.
          </p>
          <div className="bg-surface-50 p-3 rounded space-y-3">
            <div>
              <p className="font-semibold text-surface-900">The Sales Workflow:</p>
              <div className="ml-4 mt-2 space-y-2 text-sm">
                <p><strong>1. Create Proposal:</strong> Present your idea or approach to the client. Add line items with descriptions and rates.</p>
                <p><strong>2. Create Estimate:</strong> Give a detailed quote with costs. Client can accept or reject.</p>
                <p><strong>3. Convert to Invoice:</strong> Once client approves the estimate, convert it to an invoice to request payment.</p>
                <p><strong>4. Record Payment:</strong> Track when payment arrives. System tracks partial and full payments.</p>
              </div>
            </div>
            <div>
              <p className="font-semibold text-surface-900">Payment Methods:</p>
              <p className="text-sm ml-4">Bank Transfer, Cash, Credit Card, PayPal, Cryptocurrency, Check</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "projects",
      title: "Project Management - Teams & Tasks",
      icon: <FolderKanban className="h-5 w-5" />,
      content: (
        <div className="space-y-3">
          <p>
            Organize and track projects, assign tasks to team members, and monitor progress and budget.
          </p>
          <div className="bg-surface-50 p-3 rounded space-y-3">
            <div>
              <p className="font-semibold text-surface-900">Key Features:</p>
              <ul className="space-y-1 ml-4 text-sm">
                <li>• <strong>Create a Project:</strong> Set budget, deadline, and assign a client</li>
                <li>• <strong>Create Tasks:</strong> Break work into smaller pieces. Assign to team members, set priority and due date</li>
                <li>• <strong>Multiple Views:</strong> Choose List (simple), Kanban (drag/drop columns), Gantt (timeline), or Timeline</li>
                <li>• <strong>Work Orders:</strong> Track billable hours. System calculates hours × rate automatically</li>
                <li>• <strong>Scrum Board:</strong> Sprint-based agile workflow. Organize backlog, plan sprints, track burndown</li>
              </ul>
            </div>
          </div>
          <p className="text-xs text-surface-600 mt-3">
            Pro tip: Use Kanban view for quick status updates. Use Gantt to see timeline dependencies.
          </p>
        </div>
      ),
    },
    {
      id: "banking",
      title: "Banking - Accounts & Transactions",
      icon: <Landmark className="h-5 w-5" />,
      content: (
        <div className="space-y-3">
          <p>
            Track all your money across multiple bank accounts and even cryptocurrency wallets.
          </p>
          <div className="bg-surface-50 p-3 rounded space-y-2">
            <p className="font-semibold text-surface-900">What you can track:</p>
            <ul className="space-y-1 ml-4">
              <li>• <strong>Bank Accounts:</strong> DSB Bank accounts in SRD, USD, or EUR currencies</li>
              <li>• <strong>Crypto Wallets:</strong> USDT and Bitcoin wallets</li>
              <li>• <strong>Transactions:</strong> Deposits (money in), Withdrawals (money out), Transfers (between accounts), Fees (bank charges)</li>
              <li>• <strong>Real-Time Balances:</strong> See how much is in each account</li>
            </ul>
          </div>
          <p className="text-sm text-surface-600 mt-3">
            The system keeps a complete history. You can see every transaction and reconcile your accounts.
          </p>
        </div>
      ),
    },
    {
      id: "accounting",
      title: "Accounting - Expenses & Ledger",
      icon: <Calculator className="h-5 w-5" />,
      content: (
        <div className="space-y-3">
          <p>
            Track business expenses and understand your complete financial picture with the General Ledger.
          </p>
          <div className="bg-surface-50 p-3 rounded space-y-3">
            <div>
              <p className="font-semibold text-surface-900">Expense Tracking:</p>
              <ul className="space-y-1 ml-4 text-sm">
                <li>• Categorize expenses: Software, Hardware, Office, Travel, Marketing, Salary, Contractor, Utilities, Insurance, Tax, Other</li>
                <li>• Track approval status: Pending, Approved, Rejected, Paid</li>
                <li>• Expenses reduce your profit and are critical for tax purposes</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-surface-900">Other Features:</p>
              <ul className="space-y-1 ml-4 text-sm">
                <li>• <strong>Credits:</strong> Track credit notes issued or received</li>
                <li>• <strong>Loans:</strong> Record business loans with interest and payment schedules</li>
                <li>• <strong>General Ledger:</strong> The complete record of all financial transactions in double-entry format</li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "calendar",
      title: "Calendar - Events & Scheduling",
      icon: <CalendarDays className="h-5 w-5" />,
      content: (
        <div className="space-y-3">
          <p>
            See all important dates and events in one calendar. Events are automatically pulled in from all other modules.
          </p>
          <div className="bg-surface-50 p-3 rounded space-y-2">
            <p className="font-semibold text-surface-900">Calendar Features:</p>
            <ul className="space-y-1 ml-4">
              <li>• <strong>Month View:</strong> See overview of the entire month</li>
              <li>• <strong>Week View:</strong> Detailed week with time slots</li>
              <li>• <strong>Day View:</strong> Focus on one day</li>
              <li>• <strong>Year View:</strong> Yearly overview</li>
              <li>• <strong>Create Events:</strong> Add meetings, deadlines, milestones</li>
              <li>• <strong>Auto-Sync:</strong> Invoice due dates, project deadlines, payment dates automatically appear</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "reports",
      title: "Reports - Analytics & Insights",
      icon: <BarChart3 className="h-5 w-5" />,
      content: (
        <div className="space-y-3">
          <p>
            Get deep insights into your business with reports. Make data-driven decisions.
          </p>
          <div className="bg-surface-50 p-3 rounded space-y-2">
            <p className="font-semibold text-surface-900">Available Reports:</p>
            <ul className="space-y-1 ml-4">
              <li>• <strong>Financial Reports:</strong> Income statement, balance sheet, cash flow</li>
              <li>• <strong>Sales Analytics:</strong> Revenue by client, proposal success rate, payment trends</li>
              <li>• <strong>Client Analytics:</strong> Top clients, profitability by client, client health</li>
              <li>• <strong>Project Analytics:</strong> Budget vs actual, timeline performance, team utilization</li>
              <li>• <strong>Interactive Charts:</strong> Click to drill down into details</li>
            </ul>
          </div>
          <p className="text-xs text-surface-600 mt-3">
            Use these reports to understand trends and plan for growth.
          </p>
        </div>
      ),
    },
    {
      id: "settings",
      title: "Settings - Configuration & Users",
      icon: <Settings className="h-5 w-5" />,
      content: (
        <div className="space-y-3">
          <p>
            Customize your dashboard, manage your team, and set up integrations.
          </p>
          <div className="bg-surface-50 p-3 rounded space-y-2">
            <p className="font-semibold text-surface-900">What you can configure:</p>
            <ul className="space-y-1 ml-4">
              <li>• <strong>Organization Settings:</strong> Company name, logo, currency, tax settings</li>
              <li>• <strong>User Management:</strong> Add/remove team members, assign roles, manage permissions</li>
              <li>• <strong>User Roles:</strong> Owner (full access), Admin (config), Member (operations), Viewer (read-only)</li>
              <li>• <strong>Import/Export:</strong> Backup your data or move to another system</li>
              <li>• <strong>Integrations:</strong> Connect external tools and services</li>
            </ul>
          </div>
        </div>
      ),
    },
  ]

  return (
    <div>
      <Header
        title="Help & Documentation"
        subtitle="Everything you need to know about using the Logix Layer Finance Dashboard"
      />

      <div className="p-6 space-y-8">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search documentation... (e.g., 'invoice', 'payment', 'export')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input w-full pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-surface-400" />
        </div>

        {/* Quick Tips Banner */}
        <div className="card border border-brand-200 bg-brand-50 p-4">
          <div className="flex items-start gap-3">
            <Zap className="h-5 w-5 text-brand-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-brand-900 mb-1">Quick Tips</h3>
              <ul className="text-sm text-brand-800 space-y-1">
                <li>• Press <kbd className="bg-white px-2 py-1 rounded text-xs border border-brand-200">Ctrl+K</kbd> anytime to search across your data</li>
                <li>• Click the <strong>+</strong> button in the header to quickly create new records</li>
                <li>• Use the bell icon to check notifications and updates</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Getting Started Section */}
        <section>
          <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-brand-600" />
            Getting Started
          </h2>

          <div className="space-y-3">
            <div className="card border border-surface-200 p-4">
              <h4 className="font-semibold text-surface-900 mb-2 flex items-center gap-2">
                <span className="inline-block h-5 w-5 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold">
                  1
                </span>
                Welcome to Your Dashboard
              </h4>
              <p className="text-sm text-surface-700 ml-7">
                Log in with your email and password. You'll see your financial overview immediately on the Dashboard.
              </p>
            </div>

            <div className="card border border-surface-200 p-4">
              <h4 className="font-semibold text-surface-900 mb-2 flex items-center gap-2">
                <span className="inline-block h-5 w-5 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold">
                  2
                </span>
                Navigate Using the Sidebar
              </h4>
              <p className="text-sm text-surface-700 ml-7">
                The left sidebar shows all modules: Dashboard, CRM, Sales, Projects, Banking, Accounting, Calendar, Reports, and Settings. Click any module to explore.
              </p>
            </div>

            <div className="card border border-surface-200 p-4">
              <h4 className="font-semibold text-surface-900 mb-2 flex items-center gap-2">
                <span className="inline-block h-5 w-5 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold">
                  3
                </span>
                Create Your First Record
              </h4>
              <p className="text-sm text-surface-700 ml-7">
                Click the <strong>+</strong> button in the top right to create a new client, invoice, or project. Start with adding a client in CRM.
              </p>
            </div>

            <div className="card border border-surface-200 p-4">
              <h4 className="font-semibold text-surface-900 mb-2 flex items-center gap-2">
                <span className="inline-block h-5 w-5 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold">
                  4
                </span>
                Use Global Search
              </h4>
              <p className="text-sm text-surface-700 ml-7">
                Press <kbd className="bg-surface-100 px-1.5 py-0.5 rounded text-xs border border-surface-300">Ctrl+K</kbd> (or <kbd className="bg-surface-100 px-1.5 py-0.5 rounded text-xs border border-surface-300">Cmd+K</kbd> on Mac) to search for clients, invoices, projects—anything in the system.
              </p>
            </div>
          </div>
        </section>

        {/* Module Guides */}
        <section>
          <h2 className="text-lg font-bold text-surface-900 mb-4">Module Guides</h2>
          <p className="text-sm text-surface-600 mb-4">
            Click any section below to learn how to use each part of the dashboard.
          </p>
          {moduleGuides.map((item) => (
            <AccordionSection
              key={item.id}
              item={item}
              isOpen={openAccordions.includes(item.id)}
              onToggle={() => toggleAccordion(item.id)}
            />
          ))}
        </section>

        {/* FAQ Section */}
        <section>
          <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-brand-600" />
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {faqItems.map((item, idx) => (
              <div key={idx} className="card border border-surface-200">
                <button
                  onClick={() => toggleAccordion(`faq-${idx}`)}
                  className="w-full flex items-start justify-between p-4 hover:bg-surface-50 transition-colors text-left"
                >
                  <span className="font-medium text-surface-900 pr-4">{item.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-surface-400 flex-shrink-0 transition-transform ${
                      openAccordions.includes(`faq-${idx}`) ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openAccordions.includes(`faq-${idx}`) && (
                  <div className="px-4 pb-4 border-t border-surface-100 text-sm text-surface-700">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Keyboard Shortcuts */}
        <section className="card border border-surface-200 p-6">
          <h2 className="text-lg font-bold text-surface-900 mb-4">Keyboard Shortcuts</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold text-surface-900 mb-2">Navigation</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-surface-700">Global Search</span>
                  <kbd className="bg-surface-100 px-2 py-1 rounded text-xs border border-surface-300 font-mono">
                    Ctrl+K
                  </kbd>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-surface-900 mb-2">Common Actions</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-surface-700">Create New Record</span>
                  <kbd className="bg-surface-100 px-2 py-1 rounded text-xs border border-surface-300 font-mono">
                    Ctrl++
                  </kbd>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact & Support */}
        <section className="card border border-surface-200 p-6 bg-surface-50">
          <h2 className="text-lg font-bold text-surface-900 mb-4">Need Help?</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-start gap-2">
              <MessageCircle className="h-5 w-5 text-brand-600" />
              <h4 className="font-semibold text-surface-900 text-sm">In-App Chat</h4>
              <p className="text-xs text-surface-600">
                Look for the chat icon in the corner of your screen to reach support.
              </p>
            </div>
            <div className="flex flex-col items-start gap-2">
              <Mail className="h-5 w-5 text-brand-600" />
              <h4 className="font-semibold text-surface-900 text-sm">Email Support</h4>
              <p className="text-xs text-surface-600">
                Email <strong>support@logixlayer.com</strong> with questions or issues.
              </p>
            </div>
            <div className="flex flex-col items-start gap-2">
              <Phone className="h-5 w-5 text-brand-600" />
              <h4 className="font-semibold text-surface-900 text-sm">Phone Support</h4>
              <p className="text-xs text-surface-600">
                Call us during business hours for urgent issues.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center py-8 text-sm text-surface-500">
          <p>Logix Layer Finance Dashboard - Comprehensive financial management for your business</p>
          <p className="mt-2">
            Last updated: {new Date().toLocaleDateString()} | Version 1.0
          </p>
        </div>
      </div>
    </div>
  )
}
