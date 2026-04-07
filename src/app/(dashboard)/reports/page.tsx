"use client"

import { useState } from "react"
import { Header } from "@/components/dashboard/header"
import { useApi } from "@/hooks/use-api"
import type { Invoice, Payment, Proposal, Client, Expense } from "@/types"
import { formatCurrency } from "@/lib/utils"
import { ArrowRight, ChevronDown, ChevronRight } from "lucide-react"

// ─── Collapsible Section ─────────────────────
function CollapsibleCard({ title, subtitle, children, defaultOpen = true }: {
  title: string
  subtitle?: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="card">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-5 py-3 hover:bg-surface-50 transition-colors"
      >
        <div className="text-left">
          <h3 className="text-xs font-semibold text-surface-700">{title}</h3>
          {subtitle && <p className="text-2xs text-surface-400">{subtitle}</p>}
        </div>
        {open ? <ChevronDown className="h-4 w-4 text-surface-400" /> : <ChevronRight className="h-4 w-4 text-surface-400" />}
      </button>
      {open && <div className="px-5 pb-5 pt-1">{children}</div>}
    </div>
  )
}

// ─── Collapsible Section Group ───────────────
function SectionGroup({ title, children, defaultOpen = true }: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 mb-3 group"
      >
        {open ? <ChevronDown className="h-4 w-4 text-surface-400" /> : <ChevronRight className="h-4 w-4 text-surface-400" />}
        <h2 className="text-sm font-semibold text-surface-800 group-hover:text-brand-600 transition-colors">{title}</h2>
      </button>
      {open && children}
    </div>
  )
}

export default function ReportsPage() {
  const { data: invoices, loading: loadingInv } = useApi<Invoice[]>("/api/invoices", [])
  const { data: payments, loading: loadingPay } = useApi<Payment[]>("/api/payments", [])
  const { data: proposals, loading: loadingProp } = useApi<Proposal[]>("/api/proposals", [])
  const { data: clients, loading: loadingClients } = useApi<Client[]>("/api/clients", [])
  const { data: expenses, loading: loadingExp } = useApi<Expense[]>("/api/expenses", [])

  const loading = loadingInv || loadingPay || loadingProp || loadingClients || loadingExp

  if (loading) {
    return (
      <div>
        <Header title="Reports" subtitle="Financial reports and analytics" />
        <div className="flex items-center justify-center p-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      </div>
    )
  }

  // Financial metrics
  const totalRevenue = invoices.reduce((sum, inv) => sum + (parseFloat(String(inv.total)) || 0), 0)
  const totalExpenses = expenses.reduce((sum, exp) => sum + (parseFloat(String(exp.amount)) || 0), 0)
  const netIncome = totalRevenue - totalExpenses
  const marginPercentage = totalRevenue > 0 ? ((netIncome / totalRevenue) * 100).toFixed(1) : "0"

  const paidInvoices = invoices.filter((inv) => inv.status === "PAID").length
  const unpaidInvoices = invoices.filter((inv) => inv.status === "SENT" || inv.status === "PARTIAL").length
  const overdueInvoices = invoices.filter((inv) => inv.status === "OVERDUE").length

  const totalPayments = payments.reduce((sum, pay) => sum + (parseFloat(String(pay.amount)) || 0), 0)

  const totalProposals = proposals.length
  const wonProposals = proposals.filter((p) => p.status === "APPROVED").length
  const winRate = totalProposals > 0 ? ((wonProposals / totalProposals) * 100).toFixed(0) : "0"
  const pipelineValue = proposals.reduce((sum, p) => sum + (parseFloat(String(p.total)) || 0), 0)
  const avgProposalValue = totalProposals > 0 ? Math.round(pipelineValue / totalProposals) : 0

  // Revenue by client
  const revenueByClient = clients
    .map((c) => ({
      name: c.name,
      revenue: invoices.filter((i) => i.client?.id === c.id).reduce((s, i) => s + (parseFloat(String(i.total)) || 0), 0),
    }))
    .filter((c) => c.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue)

  const maxClientRevenue = Math.max(...revenueByClient.map((c) => c.revenue), 1)

  // Expenses by category
  const expenseMap: Record<string, number> = {}
  expenses.forEach((exp) => { expenseMap[exp.category] = (expenseMap[exp.category] || 0) + (parseFloat(String(exp.amount)) || 0) })
  const expensesByCategory = Object.entries(expenseMap).map(([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount)
  const maxExpense = Math.max(...expensesByCategory.map((e) => e.amount), 1)

  // Payment methods
  const methodMap: Record<string, number> = {}
  payments.forEach((pay) => { methodMap[pay.method] = (methodMap[pay.method] || 0) + (parseFloat(String(pay.amount)) || 0) })

  // Client activity
  const clientActivity = clients.map((c) => ({
    name: c.name,
    proposals: proposals.filter((p) => p.client?.id === c.id).length,
    invoices: invoices.filter((i) => i.client?.id === c.id).length,
    payments: payments.filter((p) => p.client?.id === c.id).length,
    revenue: invoices.filter((i) => i.client?.id === c.id).reduce((s, i) => s + (parseFloat(String(i.total)) || 0), 0),
  }))

  // Cash flow safe division
  const cashTotal = totalPayments + totalExpenses
  const inflowPct = cashTotal > 0 ? (totalPayments / cashTotal) * 100 : 50
  const outflowPct = cashTotal > 0 ? (totalExpenses / cashTotal) * 100 : 50

  return (
    <div>
      <Header title="Reports" subtitle="Financial reports and analytics" />

      <div className="p-4 md:p-6 space-y-6">
        {/* Financial Reports */}
        <SectionGroup title="Financial Reports">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CollapsibleCard title="Revenue Report" subtitle="Total and by client">
              <div className="flex justify-between items-center mb-4">
                <span className="text-2xs text-surface-500">Total Revenue</span>
                <span className="text-lg font-bold text-brand-600">{formatCurrency(totalRevenue)}</span>
              </div>
              <p className="text-2xs font-medium text-surface-600 mb-2">Revenue by Client</p>
              <div className="space-y-2 mb-4">
                {revenueByClient.map((item) => (
                  <div key={item.name}>
                    <div className="flex justify-between text-2xs mb-0.5">
                      <span className="text-surface-600">{item.name}</span>
                      <span className="font-semibold text-surface-800">{formatCurrency(item.revenue)}</span>
                    </div>
                    <div className="w-full bg-surface-100 rounded-full h-1.5">
                      <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: `${(item.revenue / maxClientRevenue) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <button className="btn-secondary w-full text-2xs">View Full Report <ArrowRight className="h-3 w-3" /></button>
            </CollapsibleCard>

            <CollapsibleCard title="Expense Report" subtitle="By category">
              <div className="flex justify-between items-center mb-4">
                <span className="text-2xs text-surface-500">Total Expenses</span>
                <span className="text-lg font-bold text-red-600">{formatCurrency(totalExpenses)}</span>
              </div>
              <p className="text-2xs font-medium text-surface-600 mb-2">By Category</p>
              <div className="space-y-2 mb-4">
                {expensesByCategory.map((item) => (
                  <div key={item.category}>
                    <div className="flex justify-between text-2xs mb-0.5">
                      <span className="text-surface-600">{item.category}</span>
                      <span className="font-semibold text-surface-800">{formatCurrency(item.amount)}</span>
                    </div>
                    <div className="w-full bg-surface-100 rounded-full h-1.5">
                      <div className="bg-red-400 h-1.5 rounded-full" style={{ width: `${(item.amount / maxExpense) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <button className="btn-secondary w-full text-2xs">View Full Report <ArrowRight className="h-3 w-3" /></button>
            </CollapsibleCard>

            <CollapsibleCard title="Profit & Loss" subtitle="Net income analysis">
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center py-2 border-b border-surface-100">
                  <span className="text-2xs text-surface-500">Revenue</span>
                  <span className="text-sm font-bold text-emerald-600">{formatCurrency(totalRevenue)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-surface-100">
                  <span className="text-2xs text-surface-500">Expenses</span>
                  <span className="text-sm font-bold text-red-600">-{formatCurrency(totalExpenses)}</span>
                </div>
                <div className="flex justify-between items-center bg-brand-50 rounded-md px-3 py-2">
                  <span className="text-2xs font-semibold text-surface-700">Net Income</span>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${netIncome >= 0 ? "text-emerald-600" : "text-red-600"}`}>{formatCurrency(netIncome)}</p>
                    <p className="text-2xs text-brand-500">{marginPercentage}% margin</p>
                  </div>
                </div>
              </div>
              <button className="btn-secondary w-full text-2xs">View Full Report <ArrowRight className="h-3 w-3" /></button>
            </CollapsibleCard>

            <CollapsibleCard title="Cash Flow" subtitle="Inflows vs outflows">
              <div className="space-y-3 mb-4">
                <div>
                  <div className="flex justify-between text-2xs mb-1">
                    <span className="text-surface-500">Inflows</span>
                    <span className="font-bold text-emerald-600">{formatCurrency(totalPayments)}</span>
                  </div>
                  <div className="w-full bg-surface-100 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${inflowPct}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-2xs mb-1">
                    <span className="text-surface-500">Outflows</span>
                    <span className="font-bold text-red-600">{formatCurrency(totalExpenses)}</span>
                  </div>
                  <div className="w-full bg-surface-100 rounded-full h-2">
                    <div className="bg-red-400 h-2 rounded-full" style={{ width: `${outflowPct}%` }} />
                  </div>
                </div>
                <div className="bg-surface-50 rounded-md p-3">
                  <p className="text-2xs text-surface-500">Net Cash Position</p>
                  <p className={`text-lg font-bold ${totalPayments - totalExpenses >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {formatCurrency(totalPayments - totalExpenses)}
                  </p>
                </div>
              </div>
              <button className="btn-secondary w-full text-2xs">View Full Report <ArrowRight className="h-3 w-3" /></button>
            </CollapsibleCard>
          </div>
        </SectionGroup>

        {/* Sales Reports */}
        <SectionGroup title="Sales Reports">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CollapsibleCard title="Proposals" subtitle="Win rate and value">
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-brand-50 rounded-md p-2"><p className="text-2xs text-surface-500">Total</p><p className="text-lg font-bold text-brand-600">{totalProposals}</p></div>
                <div className="bg-emerald-50 rounded-md p-2"><p className="text-2xs text-surface-500">Win Rate</p><p className="text-lg font-bold text-emerald-600">{winRate}%</p></div>
                <div className="bg-blue-50 rounded-md p-2"><p className="text-2xs text-surface-500">Avg Value</p><p className="text-sm font-bold text-blue-600">{formatCurrency(avgProposalValue)}</p></div>
                <div className="bg-purple-50 rounded-md p-2"><p className="text-2xs text-surface-500">Pipeline</p><p className="text-sm font-bold text-purple-600">{formatCurrency(pipelineValue)}</p></div>
              </div>
              <button className="btn-secondary w-full text-2xs">View Full Report <ArrowRight className="h-3 w-3" /></button>
            </CollapsibleCard>

            <CollapsibleCard title="Invoices" subtitle="Status breakdown">
              <div className="flex justify-between items-center mb-3">
                <span className="text-2xs text-surface-500">Total Invoices</span>
                <span className="text-lg font-bold text-surface-800">{invoices.length}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-emerald-50 rounded-md p-2 text-center"><p className="text-2xs text-surface-500">Paid</p><p className="text-lg font-bold text-emerald-600">{paidInvoices}</p></div>
                <div className="bg-amber-50 rounded-md p-2 text-center"><p className="text-2xs text-surface-500">Pending</p><p className="text-lg font-bold text-amber-600">{unpaidInvoices}</p></div>
                <div className="bg-red-50 rounded-md p-2 text-center"><p className="text-2xs text-surface-500">Overdue</p><p className="text-lg font-bold text-red-600">{overdueInvoices}</p></div>
              </div>
              <button className="btn-secondary w-full text-2xs">View Full Report <ArrowRight className="h-3 w-3" /></button>
            </CollapsibleCard>

            <CollapsibleCard title="Payments" subtitle="By method">
              <div className="flex justify-between items-center mb-3">
                <span className="text-2xs text-surface-500">Total Collected</span>
                <span className="text-lg font-bold text-emerald-600">{formatCurrency(totalPayments)}</span>
              </div>
              <div className="space-y-2 mb-4">
                {Object.entries(methodMap).map(([method, amount]) => (
                  <div key={method}>
                    <div className="flex justify-between text-2xs mb-0.5">
                      <span className="text-surface-600">{method.replace("_", " ")}</span>
                      <span className="font-semibold text-surface-800">{formatCurrency(amount)}</span>
                    </div>
                    <div className="w-full bg-surface-100 rounded-full h-1.5">
                      <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${totalPayments > 0 ? (amount / totalPayments) * 100 : 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <button className="btn-secondary w-full text-2xs">View Full Report <ArrowRight className="h-3 w-3" /></button>
            </CollapsibleCard>
          </div>
        </SectionGroup>

        {/* Client Reports */}
        <SectionGroup title="Client Reports">
          <CollapsibleCard title="Client Activity" subtitle="Proposals, invoices, and payments per client">
            <div className="overflow-x-auto">
              <table className="table-compact">
                <thead>
                  <tr><th>Client</th><th className="text-center">Proposals</th><th className="text-center">Invoices</th><th className="text-center">Payments</th><th className="text-right">Revenue</th></tr>
                </thead>
                <tbody>
                  {clientActivity.map((c) => (
                    <tr key={c.name}>
                      <td className="font-medium text-surface-800">{c.name}</td>
                      <td className="text-center">{c.proposals}</td>
                      <td className="text-center">{c.invoices}</td>
                      <td className="text-center">{c.payments}</td>
                      <td className="text-right font-semibold">{formatCurrency(c.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CollapsibleCard>
        </SectionGroup>
      </div>
    </div>
  )
}
