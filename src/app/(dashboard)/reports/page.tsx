"use client"

import { Header } from "@/components/dashboard/header"
import { useApi } from "@/hooks/use-api"
import type { Invoice, Payment, Proposal, Client, Expense } from "@/types"
import { formatCurrency } from "@/lib/utils"
import { ArrowRight } from "lucide-react"

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

  const mockInvoices = invoices
  const mockPayments = payments
  const mockProposals = proposals
  const mockClients = clients
  const mockExpenses = expenses

  // Financial metrics
  const totalRevenue = mockInvoices.reduce((sum, inv) => sum + inv.total, 0)
  const totalExpenses = mockExpenses.reduce((sum, exp) => sum + exp.amount, 0)
  const netIncome = totalRevenue - totalExpenses
  const marginPercentage = totalRevenue > 0 ? ((netIncome / totalRevenue) * 100).toFixed(1) : "0"

  const paidInvoices = mockInvoices.filter((inv) => inv.status === "PAID").length
  const unpaidInvoices = mockInvoices.filter((inv) => inv.status === "SENT" || inv.status === "PARTIAL").length
  const overdueInvoices = mockInvoices.filter((inv) => inv.status === "OVERDUE").length

  const totalPayments = mockPayments.reduce((sum, pay) => sum + pay.amount, 0)

  const totalProposals = mockProposals.length
  const wonProposals = mockProposals.filter((p) => p.status === "APPROVED").length
  const winRate = totalProposals > 0 ? ((wonProposals / totalProposals) * 100).toFixed(0) : "0"
  const pipelineValue = mockProposals.reduce((sum, p) => sum + p.total, 0)
  const avgProposalValue = totalProposals > 0 ? Math.round(pipelineValue / totalProposals) : 0

  // Revenue by client
  const revenueByClient = mockClients
    .map((c) => ({
      name: c.name,
      revenue: mockInvoices.filter((i) => i.client?.id === c.id).reduce((s, i) => s + (parseFloat(String(i.total)) || 0), 0),
    }))
    .filter((c) => c.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue)

  const maxClientRevenue = Math.max(...revenueByClient.map((c) => c.revenue), 1)

  // Expenses by category
  const expenseMap: Record<string, number> = {}
  mockExpenses.forEach((exp) => { expenseMap[exp.category] = (expenseMap[exp.category] || 0) + exp.amount })
  const expensesByCategory = Object.entries(expenseMap).map(([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount)
  const maxExpense = Math.max(...expensesByCategory.map((e) => e.amount), 1)

  // Payment methods
  const methodMap: Record<string, number> = {}
  mockPayments.forEach((pay) => { methodMap[pay.method] = (methodMap[pay.method] || 0) + pay.amount })

  // Client activity
  const clientActivity = mockClients.map((c) => ({
    name: c.name,
    proposals: mockProposals.filter((p) => p.client?.id === c.id).length,
    invoices: mockInvoices.filter((i) => i.client?.id === c.id).length,
    payments: mockPayments.filter((p) => p.client?.id === c.id).length,
    revenue: mockInvoices.filter((i) => i.client?.id === c.id).reduce((s, i) => s + (parseFloat(String(i.total)) || 0), 0),
  }))

  // Token usage (placeholder if no dedicated endpoint)
  const totalTokenCost = 0
  const totalInputTokens = 0
  const totalOutputTokens = 0
  const totalApiRequests = 0

  // Token usage per client (placeholder)
  const tokenByClient: { name: string; inputTokens: number; outputTokens: number; cost: number }[] = []

  return (
    <div>
      <Header title="Reports" subtitle="Financial reports and analytics" />

      <div className="p-4 md:p-6 space-y-6">
        {/* Financial Reports */}
        <div>
          <h2 className="text-sm font-semibold text-surface-800 mb-3">Financial Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Revenue */}
            <div className="card p-5">
              <h3 className="text-xs font-semibold text-surface-700 mb-1">Revenue Report</h3>
              <p className="text-2xs text-surface-400 mb-4">Total and by client</p>
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
            </div>

            {/* Expenses */}
            <div className="card p-5">
              <h3 className="text-xs font-semibold text-surface-700 mb-1">Expense Report</h3>
              <p className="text-2xs text-surface-400 mb-4">By category</p>
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
            </div>

            {/* P&L */}
            <div className="card p-5">
              <h3 className="text-xs font-semibold text-surface-700 mb-1">Profit & Loss</h3>
              <p className="text-2xs text-surface-400 mb-4">Net income analysis</p>
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
                    <p className="text-lg font-bold text-brand-600">{formatCurrency(netIncome)}</p>
                    <p className="text-2xs text-brand-500">{marginPercentage}% margin</p>
                  </div>
                </div>
              </div>
              <button className="btn-secondary w-full text-2xs">View Full Report <ArrowRight className="h-3 w-3" /></button>
            </div>

            {/* Cash Flow */}
            <div className="card p-5">
              <h3 className="text-xs font-semibold text-surface-700 mb-1">Cash Flow</h3>
              <p className="text-2xs text-surface-400 mb-4">Inflows vs outflows</p>
              <div className="space-y-3 mb-4">
                <div>
                  <div className="flex justify-between text-2xs mb-1">
                    <span className="text-surface-500">Inflows</span>
                    <span className="font-bold text-emerald-600">{formatCurrency(totalPayments)}</span>
                  </div>
                  <div className="w-full bg-surface-100 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${(totalPayments / (totalPayments + totalExpenses)) * 100}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-2xs mb-1">
                    <span className="text-surface-500">Outflows</span>
                    <span className="font-bold text-red-600">{formatCurrency(totalExpenses)}</span>
                  </div>
                  <div className="w-full bg-surface-100 rounded-full h-2">
                    <div className="bg-red-400 h-2 rounded-full" style={{ width: `${(totalExpenses / (totalPayments + totalExpenses)) * 100}%` }} />
                  </div>
                </div>
                <div className="bg-surface-50 rounded-md p-3">
                  <p className="text-2xs text-surface-500">Net Cash Position</p>
                  <p className="text-lg font-bold text-surface-800">{formatCurrency(totalPayments - totalExpenses)}</p>
                </div>
              </div>
              <button className="btn-secondary w-full text-2xs">View Full Report <ArrowRight className="h-3 w-3" /></button>
            </div>
          </div>
        </div>

        {/* Sales Reports */}
        <div>
          <h2 className="text-sm font-semibold text-surface-800 mb-3">Sales Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Proposals */}
            <div className="card p-5">
              <h3 className="text-xs font-semibold text-surface-700 mb-1">Proposals</h3>
              <p className="text-2xs text-surface-400 mb-4">Win rate and value</p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-brand-50 rounded-md p-2"><p className="text-2xs text-surface-500">Total</p><p className="text-lg font-bold text-brand-600">{totalProposals}</p></div>
                <div className="bg-emerald-50 rounded-md p-2"><p className="text-2xs text-surface-500">Win Rate</p><p className="text-lg font-bold text-emerald-600">{winRate}%</p></div>
                <div className="bg-blue-50 rounded-md p-2"><p className="text-2xs text-surface-500">Avg Value</p><p className="text-sm font-bold text-blue-600">{formatCurrency(avgProposalValue)}</p></div>
                <div className="bg-purple-50 rounded-md p-2"><p className="text-2xs text-surface-500">Pipeline</p><p className="text-sm font-bold text-purple-600">{formatCurrency(pipelineValue)}</p></div>
              </div>
              <button className="btn-secondary w-full text-2xs">View Full Report <ArrowRight className="h-3 w-3" /></button>
            </div>

            {/* Invoices */}
            <div className="card p-5">
              <h3 className="text-xs font-semibold text-surface-700 mb-1">Invoices</h3>
              <p className="text-2xs text-surface-400 mb-4">Status breakdown</p>
              <div className="flex justify-between items-center mb-3">
                <span className="text-2xs text-surface-500">Total Invoices</span>
                <span className="text-lg font-bold text-surface-800">{mockInvoices.length}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-emerald-50 rounded-md p-2 text-center"><p className="text-2xs text-surface-500">Paid</p><p className="text-lg font-bold text-emerald-600">{paidInvoices}</p></div>
                <div className="bg-amber-50 rounded-md p-2 text-center"><p className="text-2xs text-surface-500">Pending</p><p className="text-lg font-bold text-amber-600">{unpaidInvoices}</p></div>
                <div className="bg-red-50 rounded-md p-2 text-center"><p className="text-2xs text-surface-500">Overdue</p><p className="text-lg font-bold text-red-600">{overdueInvoices}</p></div>
              </div>
              <button className="btn-secondary w-full text-2xs">View Full Report <ArrowRight className="h-3 w-3" /></button>
            </div>

            {/* Payments */}
            <div className="card p-5">
              <h3 className="text-xs font-semibold text-surface-700 mb-1">Payments</h3>
              <p className="text-2xs text-surface-400 mb-4">By method</p>
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
                      <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${(amount / totalPayments) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <button className="btn-secondary w-full text-2xs">View Full Report <ArrowRight className="h-3 w-3" /></button>
            </div>
          </div>
        </div>

        {/* Client Reports */}
        <div>
          <h2 className="text-sm font-semibold text-surface-800 mb-3">Client Reports</h2>

          {/* Client Activity Table */}
          <div className="card mb-4">
            <div className="px-4 py-3 border-b border-surface-100">
              <h3 className="text-xs font-semibold text-surface-700">Client Activity</h3>
              <p className="text-2xs text-surface-400">Proposals, invoices, and payments per client</p>
            </div>
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
          </div>

          {/* AI/API Usage */}
          <div className="card">
            <div className="px-4 py-3 border-b border-surface-100">
              <h3 className="text-xs font-semibold text-surface-700">AI & API Usage</h3>
              <p className="text-2xs text-surface-400">Per-client consumption metrics</p>
            </div>
            <div className="grid grid-cols-4 gap-3 p-4">
              <div className="bg-brand-50 rounded-md p-3"><p className="text-2xs text-surface-500">Total Token Cost</p><p className="text-lg font-bold text-brand-600">{formatCurrency(totalTokenCost)}</p></div>
              <div className="bg-blue-50 rounded-md p-3"><p className="text-2xs text-surface-500">Input Tokens</p><p className="text-lg font-bold text-blue-600">{(totalInputTokens / 1_000_000).toFixed(1)}M</p></div>
              <div className="bg-purple-50 rounded-md p-3"><p className="text-2xs text-surface-500">Output Tokens</p><p className="text-lg font-bold text-purple-600">{(totalOutputTokens / 1_000_000).toFixed(1)}M</p></div>
              <div className="bg-amber-50 rounded-md p-3"><p className="text-2xs text-surface-500">API Requests</p><p className="text-lg font-bold text-amber-600">{(totalApiRequests / 1000).toFixed(0)}K</p></div>
            </div>
            <div className="overflow-x-auto">
            <table className="table-compact">
              <thead>
                <tr><th>Client</th><th className="text-right">Input Tokens</th><th className="text-right">Output Tokens</th><th className="text-right">Cost</th></tr>
              </thead>
              <tbody>
                {tokenByClient.map((c) => (
                  <tr key={c.name}>
                    <td className="font-medium text-surface-800">{c.name}</td>
                    <td className="text-right">{(c.inputTokens / 1_000_000).toFixed(1)}M</td>
                    <td className="text-right">{(c.outputTokens / 1_000_000).toFixed(1)}M</td>
                    <td className="text-right font-semibold">{formatCurrency(c.cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
