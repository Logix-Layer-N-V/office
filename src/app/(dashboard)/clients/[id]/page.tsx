"use client"

/**
 * clients/[id]/page.tsx
 * WAT:    Client detail page dengan left sidebar navigation
 * WAAROM: Full-page client CRM view met alle relatie data
 * GEBRUIK: /clients/c1 route
 */

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { useApi } from "@/hooks/use-api"
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils"
import {
  ArrowLeft,
  User,
  FileText,
  Calculator,
  Receipt,
  CreditCard,
  Briefcase,
  ClipboardList,
  Zap,
  Key,
  MessageSquare,
  ChevronRight,
  ChevronDown,
  Check,
  AlertCircle,
  TrendingUp,
  Mail,
  X,
  Send,
} from "lucide-react"
import type { Client, Proposal, Estimate, Invoice, Payment, Project, WorkOrder, Task, ClientApiKey, ClientTokenUsage } from "@/types"

type TabKey = "profile" | "proposals" | "estimates" | "invoices" | "payments" | "projects" | "workorders" | "tasks" | "apikeys" | "aitokens" | "notes"

const sidebarItems: Array<{ key: TabKey; label: string; icon: React.ReactNode }> = [
  { key: "profile", label: "Profile", icon: <User className="h-4 w-4" /> },
  { key: "proposals", label: "Proposals", icon: <FileText className="h-4 w-4" /> },
  { key: "estimates", label: "Estimates", icon: <Calculator className="h-4 w-4" /> },
  { key: "invoices", label: "Invoices", icon: <Receipt className="h-4 w-4" /> },
  { key: "payments", label: "Payments", icon: <CreditCard className="h-4 w-4" /> },
  { key: "projects", label: "Projects", icon: <Briefcase className="h-4 w-4" /> },
  { key: "workorders", label: "Work Orders", icon: <ClipboardList className="h-4 w-4" /> },
  { key: "tasks", label: "Tasks", icon: <Zap className="h-4 w-4" /> },
  { key: "apikeys", label: "API Keys", icon: <Key className="h-4 w-4" /> },
  { key: "aitokens", label: "AI Tokens", icon: <TrendingUp className="h-4 w-4" /> },
  { key: "notes", label: "Notes", icon: <MessageSquare className="h-4 w-4" /> },
]

function EmailModal({ client, onClose }: { client: Client; onClose: () => void }) {
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle")

  async function handleSend() {
    if (!subject || !message) return
    setStatus("sending")
    try {
      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: client.email, subject, message }),
      })
      setStatus(res.ok ? "sent" : "error")
    } catch {
      setStatus("error")
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between p-4 border-b border-surface-200">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-brand-600" />
            <h2 className="text-sm font-semibold text-surface-900">Send Email</h2>
          </div>
          <button onClick={onClose} className="text-surface-400 hover:text-surface-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div>
            <p className="label mb-1">To</p>
            <p className="text-sm font-mono text-surface-700 bg-surface-50 rounded-lg px-3 py-2 border border-surface-200">
              {client.name} &lt;{client.email}&gt;
            </p>
          </div>
          <div>
            <p className="label mb-1">Subject</p>
            <input
              className="input w-full"
              placeholder="e.g. Invoice reminder — INV-2025-002"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div>
            <p className="label mb-1">Message</p>
            <textarea
              className="input w-full resize-none"
              rows={6}
              placeholder={`Hi ${client.name.split(" ")[0]},\n\n`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          {status === "sent" && (
            <p className="text-sm text-emerald-600 flex items-center gap-2">
              <Check className="h-4 w-4" /> Email sent to {client.email}
            </p>
          )}
          {status === "error" && (
            <p className="text-sm text-red-600 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" /> Failed to send — check RESEND_API_KEY
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-surface-200">
          <button onClick={onClose} className="btn-secondary text-sm">Cancel</button>
          <button
            onClick={handleSend}
            disabled={!subject || !message || status === "sending" || status === "sent"}
            className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
            {status === "sending" ? "Sending…" : status === "sent" ? "Sent!" : "Send Email"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ClientDetailPage() {
  const params = useParams()
  const clientId = params.id as string
  const [activeTab, setActiveTab] = useState<TabKey>("profile")
  const [showEmailModal, setShowEmailModal] = useState(false)

  const { data: client, loading: clientLoading } = useApi<Client | null>(`/api/clients/${clientId}`, null)
  const { data: proposals = [] } = useApi<Proposal[]>("/api/proposals", [])
  const { data: estimates = [] } = useApi<Estimate[]>("/api/estimates", [])
  const { data: invoices = [] } = useApi<Invoice[]>("/api/invoices", [])
  const { data: payments = [] } = useApi<Payment[]>("/api/payments", [])
  const { data: projects = [] } = useApi<Project[]>("/api/projects", [])
  const { data: workOrders = [] } = useApi<WorkOrder[]>("/api/workorders", [])
  const { data: tasks = [] } = useApi<Task[]>("/api/tasks", [])
  const { data: apiKeys = [] } = useApi<ClientApiKey[]>("/api/client-api-keys", [])
  const { data: tokenUsage = [] } = useApi<ClientTokenUsage[]>("/api/client-token-usage", [])

  if (clientLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    )
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-surface-400">
        <p>The requested client was not found.</p>
        <a href="/clients" className="mt-2 text-brand-600 hover:underline">Back to clients</a>
      </div>
    )
  }

  // Filter related data by client ID
  const clientProposals = proposals.filter((p) => p.clientId === client.id)
  const clientEstimates = estimates.filter((e) => e.clientId === client.id)
  const clientInvoices = invoices.filter((i) => i.clientId === client.id)
  const clientPayments = payments.filter((p) => p.clientId === client.id)
  const clientProjects = projects.filter((p) => p.clientId === client.id)
  const clientWorkOrders = workOrders.filter((w) => w.clientId === client.id)
  const clientTasks = tasks.filter((t) => t.clientId === client.id)
  const clientApiKeys = apiKeys.filter((k) => k.clientId === client.id)
  const clientTokenUsage = tokenUsage.filter((t) => t.clientId === client.id)

  const totalInvoiced = clientInvoices.reduce((sum, i) => sum + (parseFloat(String(i.total)) || 0), 0)
  const totalPaid = clientInvoices.reduce((sum, i) => sum + (parseFloat(String(i.amountPaid)) || 0), 0)
  const totalDue = clientInvoices.reduce((sum, i) => sum + (parseFloat(String(i.amountDue)) || 0), 0)

  const initials = (client?.name || "")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)

  return (
    <>
    {showEmailModal && <EmailModal client={client} onClose={() => setShowEmailModal(false)} />}
    <div className="flex h-[calc(100vh-3.5rem)] bg-surface-50">
      {/* Left Sidebar — desktop only */}
      <div className="hidden md:block w-52 border-r border-surface-200 bg-white overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-surface-200 p-4">
          <Link href="/clients" className="flex items-center gap-2 text-sm text-surface-600 hover:text-surface-800 mb-4">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-semibold text-sm">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-surface-800 truncate">{client?.name}</p>
              <p className="text-2xs text-surface-500 truncate">{client?.company}</p>
            </div>
          </div>

          <span className={`inline-block ${getStatusColor(client?.status || "ACTIVE")} text-2xs`}>{client?.status}</span>
        </div>

        <nav className="p-2 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                activeTab === item.key
                  ? "bg-brand-50 text-brand-700"
                  : "text-surface-700 hover:bg-surface-50"
              }`}
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
              {activeTab === item.key && <ChevronRight className="h-4 w-4 ml-auto" />}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6 max-w-6xl">
          <div className="mb-4 md:mb-6">
            <Link href="/clients" className="flex items-center gap-2 text-sm text-surface-500 hover:text-surface-700 mb-3">
              <ArrowLeft className="h-4 w-4" /> Clients
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-surface-900">{client?.name}</h1>
            <p className="text-surface-500 mt-1">{client?.company}</p>
          </div>

          {/* Mobile tab dropdown */}
          <div className="md:hidden mb-4 relative">
            <div className="flex items-center justify-between rounded-lg border border-surface-200 bg-white px-3 py-2 shadow-sm">
              <div className="flex items-center gap-2">
                {sidebarItems.find(i => i.key === activeTab)?.icon}
                <span className="text-sm font-medium text-surface-800">
                  {sidebarItems.find(i => i.key === activeTab)?.label}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-surface-400" />
            </div>
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as TabKey)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            >
              {sidebarItems.map((item) => (
                <option key={item.key} value={item.key}>{item.label}</option>
              ))}
            </select>
          </div>

          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowEmailModal(true)}
                  className="btn-primary text-sm flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" /> Send Email
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="card p-4">
                  <p className="text-2xs text-surface-500 font-medium">Total Revenue</p>
                  <p className="text-2xl font-bold text-surface-900 mt-1">{formatCurrency(totalInvoiced)}</p>
                  <p className="text-2xs text-surface-400 mt-2">{clientInvoices.length} invoices</p>
                </div>
                <div className="card p-4 border-l-4 border-emerald-500">
                  <p className="text-2xs text-surface-500 font-medium">Amount Paid</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(totalPaid)}</p>
                  <p className="text-2xs text-surface-400 mt-2">
                    {Math.round((totalPaid / (totalInvoiced || 1)) * 100)}% collected
                  </p>
                </div>
                <div className="card p-4 border-l-4 border-orange-500">
                  <p className="text-2xs text-surface-500 font-medium">Outstanding</p>
                  <p className="text-2xl font-bold text-orange-600 mt-1">{formatCurrency(totalDue)}</p>
                  <p className="text-2xs text-surface-400 mt-2">{clientInvoices.filter(i => i.status === "SENT" || i.status === "OVERDUE").length} pending</p>
                </div>
                <div className="card p-4">
                  <p className="text-2xs text-surface-500 font-medium">Active Projects</p>
                  <p className="text-2xl font-bold text-surface-900 mt-1">{clientProjects.filter(p => p.status === "IN_PROGRESS").length}</p>
                  <p className="text-2xs text-surface-400 mt-2">of {clientProjects.length} total</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="card p-6">
                  <h3 className="text-sm font-semibold text-surface-900 mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="label">Contact Name</p>
                      <p className="text-sm text-surface-700">{client?.name}</p>
                    </div>
                    <div>
                      <p className="label">Email</p>
                      <p className="text-sm text-surface-700 font-mono">{client?.email}</p>
                    </div>
                    <div>
                      <p className="label">Phone</p>
                      <p className="text-sm text-surface-700">{client?.phone}</p>
                    </div>
                    <div>
                      <p className="label">Address</p>
                      <p className="text-sm text-surface-700">{client?.address}</p>
                    </div>
                  </div>
                </div>

                <div className="card p-6">
                  <h3 className="text-sm font-semibold text-surface-900 mb-4">Business Details</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="label">Company</p>
                      <p className="text-sm text-surface-700">{client?.company}</p>
                    </div>
                    <div>
                      <p className="label">Tax ID / VAT</p>
                      <p className="text-sm text-surface-700 font-mono">{client?.taxId}</p>
                    </div>
                    <div>
                      <p className="label">Status</p>
                      <span className={`inline-block ${getStatusColor(client?.status || "ACTIVE")} text-2xs`}>{client?.status}</span>
                    </div>
                    <div>
                      <p className="label">Last Activity</p>
                      <p className="text-sm text-surface-700">{formatDate(client?.updatedAt || "")}</p>
                    </div>
                  </div>
                </div>
              </div>

              {client?.notes && (
                <div className="card p-6 bg-blue-50 border border-blue-200">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-semibold text-blue-900 mb-1">Internal Notes</h3>
                      <p className="text-sm text-blue-800">{client?.notes}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PROPOSALS TAB */}
          {activeTab === "proposals" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-surface-900">Proposals ({clientProposals.length})</h2>
                <button className="btn-primary text-xs">+ New Proposal</button>
              </div>
              {clientProposals.length === 0 ? (
                <div className="card p-8 text-center">
                  <p className="text-surface-500">No proposals yet</p>
                </div>
              ) : (
                <div className="card">
                  <table className="table-compact">
                    <thead>
                      <tr>
                        <th>Number</th>
                        <th>Title</th>
                        <th>Status</th>
                        <th className="text-right">Amount</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientProposals.map((p) => (
                        <tr key={p.id}>
                          <td className="font-mono text-xs text-surface-600">{p.number}</td>
                          <td className="font-medium text-surface-800">{p.title}</td>
                          <td>
                            <span className={getStatusColor(p.status)}>{p.status}</span>
                          </td>
                          <td className="text-right font-semibold text-surface-800">{formatCurrency(p.total)}</td>
                          <td className="text-surface-600">{formatDate(p.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ESTIMATES TAB */}
          {activeTab === "estimates" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-surface-900">Estimates ({clientEstimates.length})</h2>
                <button className="btn-primary text-xs">+ New Estimate</button>
              </div>
              {clientEstimates.length === 0 ? (
                <div className="card p-8 text-center">
                  <p className="text-surface-500">No estimates yet</p>
                </div>
              ) : (
                <div className="card">
                  <table className="table-compact">
                    <thead>
                      <tr>
                        <th>Number</th>
                        <th>Title</th>
                        <th>Status</th>
                        <th className="text-right">Amount</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientEstimates.map((e) => (
                        <tr key={e.id}>
                          <td className="font-mono text-xs text-surface-600">{e.number}</td>
                          <td className="font-medium text-surface-800">{e.title}</td>
                          <td>
                            <span className={getStatusColor(e.status)}>{e.status}</span>
                          </td>
                          <td className="text-right font-semibold text-surface-800">{formatCurrency(e.total)}</td>
                          <td className="text-surface-600">{formatDate(e.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* INVOICES TAB */}
          {activeTab === "invoices" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-surface-900">Invoices ({clientInvoices.length})</h2>
                <button className="btn-primary text-xs">+ New Invoice</button>
              </div>
              {clientInvoices.length === 0 ? (
                <div className="card p-8 text-center">
                  <p className="text-surface-500">No invoices yet</p>
                </div>
              ) : (
                <div className="card">
                  <table className="table-compact">
                    <thead>
                      <tr>
                        <th>Number</th>
                        <th>Title</th>
                        <th>Status</th>
                        <th className="text-right">Total</th>
                        <th className="text-right">Paid</th>
                        <th className="text-right">Due</th>
                        <th>Due Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientInvoices.map((i) => (
                        <tr key={i.id}>
                          <td className="font-mono text-xs text-surface-600">{i.number}</td>
                          <td className="font-medium text-surface-800">{i.title}</td>
                          <td>
                            <span className={getStatusColor(i.status)}>{i.status}</span>
                          </td>
                          <td className="text-right font-semibold text-surface-800">{formatCurrency(i.total)}</td>
                          <td className="text-right text-emerald-600">{formatCurrency(i.amountPaid)}</td>
                          <td className="text-right text-orange-600">{formatCurrency(i.amountDue)}</td>
                          <td className="text-surface-600">{formatDate(i.dueDate)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* PAYMENTS TAB */}
          {activeTab === "payments" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-surface-900 mb-4">Payment History ({clientPayments.length})</h2>
              {clientPayments.length === 0 ? (
                <div className="card p-8 text-center">
                  <p className="text-surface-500">No payments yet</p>
                </div>
              ) : (
                <div className="card">
                  <table className="table-compact">
                    <thead>
                      <tr>
                        <th>Payment #</th>
                        <th>Invoice</th>
                        <th>Amount</th>
                        <th>Method</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientPayments.map((p) => (
                        <tr key={p.id}>
                          <td className="font-mono text-xs text-surface-600">{p.number}</td>
                          <td className="font-mono text-xs text-surface-600">{p.invoiceId}</td>
                          <td className="font-semibold text-surface-800">{formatCurrency(p.amount)}</td>
                          <td className="text-surface-600">{p.method.replace(/_/g, " ")}</td>
                          <td>
                            <span className={getStatusColor(p.status)}>{p.status}</span>
                          </td>
                          <td className="text-surface-600">{formatDate(p.receivedAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* PROJECTS TAB */}
          {activeTab === "projects" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-surface-900">Projects ({clientProjects.length})</h2>
                <button className="btn-primary text-xs">+ New Project</button>
              </div>
              {clientProjects.length === 0 ? (
                <div className="card p-8 text-center">
                  <p className="text-surface-500">No projects yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {clientProjects.map((proj) => (
                    <div key={proj.id} className="card p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-surface-900">{proj.name}</h3>
                          <p className="text-2xs text-surface-500 mt-1">{proj.description}</p>
                        </div>
                        <span className={getStatusColor(proj.status)}>{proj.status}</span>
                      </div>

                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-2xs font-medium text-surface-600">Progress</p>
                          <p className="text-2xs font-semibold text-surface-700">{proj.progress}%</p>
                        </div>
                        <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-600 transition-all"
                            style={{ width: `${proj.progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-2xs">
                        <div>
                          <p className="text-surface-500">Budget</p>
                          <p className="font-semibold text-surface-800">{formatCurrency(proj.budget)}</p>
                        </div>
                        <div>
                          <p className="text-surface-500">Spent</p>
                          <p className="font-semibold text-surface-800">{formatCurrency(proj.spent)}</p>
                        </div>
                        <div>
                          <p className="text-surface-500">Remaining</p>
                          <p className="font-semibold text-emerald-600">{formatCurrency(Math.max(proj.budget - proj.spent, 0))}</p>
                        </div>
                        <div>
                          <p className="text-surface-500">Deadline</p>
                          <p className="font-semibold text-surface-800">{formatDate(proj.deadline || "")}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* WORK ORDERS TAB */}
          {activeTab === "workorders" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-surface-900">Work Orders ({clientWorkOrders.length})</h2>
                <button className="btn-primary text-xs">+ New Work Order</button>
              </div>
              {clientWorkOrders.length === 0 ? (
                <div className="card p-8 text-center">
                  <p className="text-surface-500">No work orders yet</p>
                </div>
              ) : (
                <div className="card">
                  <table className="table-compact">
                    <thead>
                      <tr>
                        <th>Number</th>
                        <th>Title</th>
                        <th>Project</th>
                        <th>Status</th>
                        <th className="text-right">Hours</th>
                        <th className="text-right">Amount</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientWorkOrders.map((wo) => (
                        <tr key={wo.id}>
                          <td className="font-mono text-xs text-surface-600">{wo.number}</td>
                          <td className="font-medium text-surface-800">{wo.title}</td>
                          <td className="text-surface-600">{wo.projectId}</td>
                          <td>
                            <span className={getStatusColor(wo.status)}>{wo.status}</span>
                          </td>
                          <td className="text-right text-surface-800">{wo.hours}h</td>
                          <td className="text-right font-semibold text-surface-800">{formatCurrency(wo.hours * wo.rate)}</td>
                          <td className="text-surface-600">{formatDate(wo.date)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TASKS TAB */}
          {activeTab === "tasks" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-surface-900">Tasks ({clientTasks.length})</h2>
                <button className="btn-primary text-xs">+ New Task</button>
              </div>
              {clientTasks.length === 0 ? (
                <div className="card p-8 text-center">
                  <p className="text-surface-500">No tasks yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {clientTasks.map((task) => (
                    <div key={task.id} className="card p-3 flex items-start gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        task.status === "DONE" ? "bg-emerald-100 border-emerald-300" : "border-surface-300"
                      }`}>
                        {task.status === "DONE" && <Check className="h-3 w-3 text-emerald-600" />}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${task.status === "DONE" ? "line-through text-surface-400" : "text-surface-800"}`}>
                          {task.title}
                        </p>
                        <p className="text-2xs text-surface-500 mt-1">
                          Due: {formatDate(task.dueDate)} • Priority: <span className={`font-medium ${
                            task.priority === "CRITICAL" ? "text-red-600" :
                            task.priority === "HIGH" ? "text-orange-600" : "text-blue-600"
                          }`}>{task.priority}</span>
                        </p>
                      </div>
                      <span className={getStatusColor(task.status)}>{task.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* API KEYS TAB */}
          {activeTab === "apikeys" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-surface-900">API Keys ({clientApiKeys.length})</h2>
                <button className="btn-primary text-xs">+ Generate Key</button>
              </div>
              {clientApiKeys.length === 0 ? (
                <div className="card p-8 text-center">
                  <p className="text-surface-500">No API keys yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {clientApiKeys.map((key) => (
                    <div key={key.id} className="card p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-surface-900">{key.name}</h3>
                          <p className="text-2xs text-surface-500 font-mono mt-1">{key.key}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="badge-info">{key.environment}</span>
                          <span className={getStatusColor(key.status)}>{key.status}</span>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-2xs font-medium text-surface-600">
                            Requests: {key.requestsMonth.toLocaleString()} / {key.rateLimit.toLocaleString()}
                          </p>
                          <p className="text-2xs font-semibold text-surface-700">
                            {Math.round((key.requestsMonth / key.rateLimit) * 100)}%
                          </p>
                        </div>
                        <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              (key.requestsMonth / key.rateLimit) > 0.8 ? "bg-orange-500" : "bg-brand-600"
                            }`}
                            style={{ width: `${Math.min((key.requestsMonth / key.rateLimit) * 100, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-2xs">
                        <div>
                          <p className="text-surface-500">Today</p>
                          <p className="font-semibold text-surface-800">{key.requestsToday.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-surface-500">This Month</p>
                          <p className="font-semibold text-surface-800">{key.requestsMonth.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-surface-500">Rate Limit</p>
                          <p className="font-semibold text-surface-800">{key.rateLimit.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-surface-500">Last Used</p>
                          <p className="font-semibold text-surface-800">{formatDate(key.lastUsed)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* AI TOKENS TAB */}
          {activeTab === "aitokens" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-surface-900 mb-4">AI Token Usage</h2>

              {clientTokenUsage.length === 0 ? (
                <div className="card p-8 text-center">
                  <p className="text-surface-500">No token usage data yet</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="card p-4">
                      <p className="text-2xs text-surface-500 font-medium">Total Cost (Mar)</p>
                      <p className="text-2xl font-bold text-surface-900 mt-1">
                        {formatCurrency(clientTokenUsage.reduce((sum, t) => sum + t.cost, 0))}
                      </p>
                    </div>
                    <div className="card p-4">
                      <p className="text-2xs text-surface-500 font-medium">Input Tokens</p>
                      <p className="text-2xl font-bold text-surface-900 mt-1">
                        {(clientTokenUsage.reduce((sum, t) => sum + t.inputTokens, 0) / 1000000).toFixed(2)}M
                      </p>
                    </div>
                    <div className="card p-4">
                      <p className="text-2xs text-surface-500 font-medium">Output Tokens</p>
                      <p className="text-2xl font-bold text-surface-900 mt-1">
                        {(clientTokenUsage.reduce((sum, t) => sum + t.outputTokens, 0) / 1000000).toFixed(2)}M
                      </p>
                    </div>
                  </div>

                  <div className="card">
                    <table className="table-compact">
                      <thead>
                        <tr>
                          <th>Model</th>
                          <th className="text-right">Input Tokens</th>
                          <th className="text-right">Output Tokens</th>
                          <th className="text-right">Cost</th>
                          <th>Period</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clientTokenUsage.map((usage) => (
                          <tr key={usage.id}>
                            <td className="font-medium text-surface-800">{usage.model}</td>
                            <td className="text-right font-mono text-sm text-surface-700">
                              {(usage.inputTokens / 1000000).toFixed(2)}M
                            </td>
                            <td className="text-right font-mono text-sm text-surface-700">
                              {(usage.outputTokens / 1000000).toFixed(2)}M
                            </td>
                            <td className="text-right font-semibold text-surface-800">{formatCurrency(usage.cost)}</td>
                            <td className="text-surface-600">{usage.period}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {/* NOTES TAB */}
          {activeTab === "notes" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-surface-900">Internal Notes</h2>
                <button className="btn-primary text-xs">+ Add Note</button>
              </div>
              <div className="card p-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">{client?.notes}</p>
                  <p className="text-2xs text-blue-600 mt-2">Last updated: {formatDate(client?.updatedAt || "")}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  )
}
