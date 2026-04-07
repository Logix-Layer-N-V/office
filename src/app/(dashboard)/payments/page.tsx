"use client"

import { useState } from "react"
import { Header } from "@/components/dashboard/header"
import { useApi, apiMutate } from "@/hooks/use-api"
import type { Payment, Invoice, Client, BankAccount } from "@/types"
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils"
import { ListToolbar, applyFilters, type ActiveFilter } from "@/components/ui/list-toolbar"
import { Pencil, Trash2, ArrowDownLeft, Clock, CreditCard, X } from "lucide-react"
import { StatCard } from "@/components/ui/stat-card"

type PaymentData = Payment

export default function PaymentsPage() {
  const { data: payments, loading, refresh } = useApi<PaymentData[]>("/api/payments", [])
  const { data: invoices } = useApi<Invoice[]>("/api/invoices", [])
  const { data: clients } = useApi<Client[]>("/api/clients", [])
  const { data: bankAccounts } = useApi<BankAccount[]>("/api/bank-accounts", [])
  const [editingPayment, setEditingPayment] = useState<PaymentData | null>(null)
  const [showEdit, setShowEdit] = useState(false)
  const [editValues, setEditValues] = useState({ client: "", invoice: "", amount: 0, method: "BANK_TRANSFER", status: "COMPLETED", date: "" })
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState<ActiveFilter[]>([])
  const [activeTab, setActiveTab] = useState("all")

  if (loading) {
    return (
      <div>
        <Header title="Payments" subtitle="Payment receivables and transactions" action={{ label: "Record Payment", href: "/payments/new" }} />
        <div className="flex items-center justify-center p-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      </div>
    )
  }

  const totalReceived = payments.filter(p => p.status === "COMPLETED").reduce((s, p) => s + (parseFloat(String(p.amount)) || 0), 0)
  const totalPending = payments.filter(p => p.status === "PENDING").reduce((s, p) => s + (parseFloat(String(p.amount)) || 0), 0)

  const openEdit = (payment: PaymentData) => {
    setEditingPayment(payment)
    setEditValues({
      client: payment.clientId || "",
      invoice: payment.invoiceId || "",
      amount: payment.amount,
      method: payment.method,
      status: payment.status,
      date: payment.receivedAt,
    })
    setShowEdit(true)
  }

  const saveEdit = async () => {
    if (!editingPayment) return
    await apiMutate(`/api/payments/${editingPayment.id}`, "PUT", editValues)
    setShowEdit(false)
    setEditingPayment(null)
    refresh()
  }

  const deletePayment = async (id: string) => {
    await apiMutate(`/api/payments/${id}`, "DELETE", {})
    refresh()
  }

  return (
    <div>
      <Header title="Payments" subtitle="Payment receivables and transactions" action={{ label: "Record Payment", href: "/payments/new" }} />

      <div className="p-4 md:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatCard title="Total Received" value={formatCurrency(totalReceived)} icon={ArrowDownLeft} iconColor="text-emerald-600" />
          <StatCard title="Pending" value={formatCurrency(totalPending)} icon={Clock} iconColor="text-amber-600" />
          <StatCard title="Transactions" value={String(payments.length)} icon={CreditCard} iconColor="text-brand-600" />
        </div>

        <div className="card p-4">
          <ListToolbar
            storageKey="payments"
            searchPlaceholder="Search payments..."
            filterOptions={[
              { key: "status", label: "Status", type: "select", options: [
                { value: "PENDING", label: "Pending" }, { value: "COMPLETED", label: "Completed" },
                { value: "FAILED", label: "Failed" }, { value: "REFUNDED", label: "Refunded" },
              ]},
              { key: "method", label: "Method", type: "select", options: [
                { value: "BANK_TRANSFER", label: "Bank Transfer" }, { value: "CASH", label: "Cash" },
                { value: "CREDIT_CARD", label: "Credit Card" }, { value: "PAYPAL", label: "PayPal" },
                { value: "CRYPTO", label: "Crypto" },
              ]},
            ]}
            quickFilters={[
              { value: "all", label: "All", count: payments.length },
              { value: "pending", label: "Pending", count: payments.filter(p => p.status === "PENDING").length },
              { value: "completed", label: "Completed", count: payments.filter(p => p.status === "COMPLETED").length },
            ]}
            activeQuickFilter={activeTab}
            onQuickFilterChange={setActiveTab}
            onChange={(s, f) => { setSearch(s); setFilters(f) }}
          />
        </div>

        <div className="card">
          <div className="overflow-x-auto">
          <table className="table-compact">
            <thead>
              <tr>
                <th>Payment</th>
                <th>Client</th>
                <th>Invoice</th>
                <th>Method</th>
                <th>Status</th>
                <th className="text-right">Amount</th>
                <th>Date</th>
                <th className="w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                let filteredPayments = applyFilters(
                  payments as unknown as Record<string, unknown>[],
                  search,
                  filters,
                  ["number", "client", "method"]
                ) as unknown as PaymentData[]
                if (activeTab !== "all") {
                  filteredPayments = filteredPayments.filter(p => p.status === activeTab.toUpperCase())
                }
                return filteredPayments
              })().map((payment) => (
                <tr key={payment.id} className="group">
                  <td className="font-medium text-surface-800">{payment.number}</td>
                  <td>{payment.client?.name || "-"}</td>
                  <td><a href={`/invoices/${payment.invoiceId}`} className="text-brand-600 hover:underline">{payment.invoice?.number || "-"}</a></td>
                  <td><span className="badge-neutral">{payment.method.replace("_", " ")}</span></td>
                  <td><span className={getStatusColor(payment.status)}>{payment.status}</span></td>
                  <td className="text-right font-semibold text-emerald-600">{formatCurrency(payment.amount)}</td>
                  <td>{formatDate(payment.receivedAt)}</td>
                  <td>
                    <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(payment)} className="rounded p-1 hover:bg-surface-100" title="Edit">
                        <Pencil className="h-3.5 w-3.5 text-surface-500" />
                      </button>
                      <button onClick={() => deletePayment(payment.id)} className="rounded p-1 hover:bg-red-50" title="Delete">
                        <Trash2 className="h-3.5 w-3.5 text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      {/* Edit Payment Modal */}
      {showEdit && editingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-4 border-b border-surface-200">
              <h2 className="text-sm font-semibold text-surface-900">Edit Payment — {editingPayment.number}</h2>
              <button onClick={() => setShowEdit(false)} className="text-surface-400 hover:text-surface-600"><X className="h-4 w-4" /></button>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Client</label>
                  <select className="input" value={editValues.client} onChange={(e) => setEditValues({ ...editValues, client: e.target.value })}>
                    <option value="">Select client</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Invoice</label>
                  <select className="input" value={editValues.invoice} onChange={(e) => setEditValues({ ...editValues, invoice: e.target.value })}>
                    <option value="">Select invoice</option>
                    {invoices.map((inv) => (
                      <option key={inv.id} value={inv.id}>{inv.number} — {formatCurrency(inv.total)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Amount</label>
                  <input
                    type="number"
                    className="input"
                    value={editValues.amount}
                    onChange={(e) => setEditValues({ ...editValues, amount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="label">Date</label>
                  <input
                    type="date"
                    className="input"
                    value={editValues.date ? new Date(editValues.date).toISOString().split("T")[0] : ""}
                    onChange={(e) => setEditValues({ ...editValues, date: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Method</label>
                  <select className="input" value={editValues.method} onChange={(e) => setEditValues({ ...editValues, method: e.target.value })}>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CASH">Cash</option>
                    <option value="CREDIT_CARD">Credit Card</option>
                    <option value="PAYPAL">PayPal</option>
                    <option value="CRYPTO">Crypto</option>
                    <option value="CHECK">Check</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="label">Status</label>
                  <select className="input" value={editValues.status} onChange={(e) => setEditValues({ ...editValues, status: e.target.value })}>
                    <option value="PENDING">Pending</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="FAILED">Failed</option>
                    <option value="REFUNDED">Refunded</option>
                  </select>
                </div>
              </div>

              {editValues.invoice && (
                <div className="bg-surface-50 rounded-lg p-3 text-xs text-surface-600">
                  <p className="font-medium text-surface-700 mb-1">Linked Invoice</p>
                  {(() => {
                    const inv = invoices.find((i) => i.id === editValues.invoice)
                    return inv ? (
                      <div className="flex justify-between">
                        <span>{inv.number} — {inv.client?.name || "Unknown"}</span>
                        <span className="font-semibold">Total: {formatCurrency(inv.total)} · Due: {formatCurrency(inv.amountDue)}</span>
                      </div>
                    ) : null
                  })()}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 p-4 border-t border-surface-200">
              <button onClick={() => setShowEdit(false)} className="btn-secondary text-sm">Cancel</button>
              <button onClick={saveEdit} className="btn-primary text-sm">Save Payment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
