"use client"

import { useState } from "react"
import { Header } from "@/components/dashboard/header"
import { Modal } from "@/components/ui/modal"
import { useApi, apiMutate } from "@/hooks/use-api"
import type { Payment, Invoice, Client, BankAccount } from "@/types"
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils"
import { Pencil, Trash2, MoreHorizontal, Eye } from "lucide-react"

type PaymentData = Payment

export default function PaymentsPage() {
  const { data: payments, loading, refresh } = useApi<PaymentData[]>("/api/payments", [])
  const { data: invoices } = useApi<Invoice[]>("/api/invoices", [])
  const { data: clients } = useApi<Client[]>("/api/clients", [])
  const { data: bankAccounts } = useApi<BankAccount[]>("/api/bank-accounts", [])
  const [showRecord, setShowRecord] = useState(false)
  const [editingPayment, setEditingPayment] = useState<PaymentData | null>(null)
  const [showEdit, setShowEdit] = useState(false)
  const [editValues, setEditValues] = useState({ client: "", invoice: "", amount: 0, method: "BANK_TRANSFER", status: "COMPLETED", date: "" })

  if (loading) {
    return (
      <div>
        <Header title="Payments" subtitle="Payment receivables and transactions" action={{ label: "Record Payment", onClick: () => setShowRecord(true) }} />
        <div className="flex items-center justify-center p-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      </div>
    )
  }

  const mockPayments = payments
  const mockInvoices = invoices
  const mockClients = clients
  const mockBankAccounts = bankAccounts

  const totalReceived = payments.filter(p => p.status === "COMPLETED").reduce((s, p) => s + p.amount, 0)
  const totalPending = payments.filter(p => p.status === "PENDING").reduce((s, p) => s + p.amount, 0)

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
      <Header title="Payments" subtitle="Payment receivables and transactions" action={{ label: "Record Payment", onClick: () => setShowRecord(true) }} />

      <div className="p-6 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="card p-3"><p className="text-2xs text-surface-400">Total Received</p><p className="text-lg font-semibold text-emerald-600">{formatCurrency(totalReceived)}</p></div>
          <div className="card p-3"><p className="text-2xs text-surface-400">Pending</p><p className="text-lg font-semibold text-amber-600">{formatCurrency(totalPending)}</p></div>
          <div className="card p-3"><p className="text-2xs text-surface-400">Transactions</p><p className="text-lg font-semibold">{payments.length}</p></div>
        </div>

        <div className="card">
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
              {payments.map((payment) => (
                <tr key={payment.id} className="group">
                  <td className="font-medium text-surface-800">{payment.number}</td>
                  <td>{payment.client?.name || "-"}</td>
                  <td><a href={`/invoices/${payment.invoiceId}`} className="text-brand-600 hover:underline">{payment.invoice?.number || "-"}</a></td>
                  <td><span className="badge-neutral">{payment.method.replace("_", " ")}</span></td>
                  <td><span className={getStatusColor(payment.status)}>{payment.status}</span></td>
                  <td className="text-right font-semibold text-emerald-600">{formatCurrency(payment.amount)}</td>
                  <td>{formatDate(payment.receivedAt)}</td>
                  <td>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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

      {/* Record New Payment Modal */}
      <Modal open={showRecord} onClose={() => setShowRecord(false)} title="Record Payment">
        <form className="space-y-4">
          <div><label className="label">Client</label>
            <select className="input"><option value="">Select client...</option>{mockClients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
          </div>
          <div><label className="label">Invoice</label>
            <select className="input"><option value="">Select invoice...</option>{mockInvoices.filter(i => i.amountDue > 0).map(i => <option key={i.id} value={i.id}>{i.number} — {formatCurrency(i.amountDue)} due</option>)}</select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Amount (USD)</label><input type="number" className="input" step="0.01" /></div>
            <div><label className="label">Payment Method</label>
              <select className="input"><option value="BANK_TRANSFER">Bank Transfer</option><option value="CASH">Cash</option><option value="CREDIT_CARD">Credit Card</option><option value="PAYPAL">PayPal</option><option value="CRYPTO">Crypto</option></select>
            </div>
          </div>
          <div><label className="label">Deposit to</label>
            <select className="input">{mockBankAccounts.map(b => <option key={b.id} value={b.id}>{b.name} ({formatCurrency(b.balance)})</option>)}</select>
          </div>
          <div><label className="label">Reference / Notes</label><input type="text" className="input" placeholder="Transaction reference" /></div>
          <div className="flex justify-end gap-2 pt-3 border-t border-surface-200">
            <button type="button" onClick={() => setShowRecord(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Record Payment</button>
          </div>
        </form>
      </Modal>

      {/* Edit Payment Modal */}
      <Modal open={showEdit} onClose={() => { setShowEdit(false); setEditingPayment(null) }} title={`Edit ${editingPayment?.number || "Payment"}`} size="lg">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); saveEdit() }}>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Client</label>
              <select className="input" value={editValues.client} onChange={(e) => setEditValues(v => ({ ...v, client: e.target.value }))}>
                {mockClients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div><label className="label">Invoice</label>
              <select className="input" value={editValues.invoice} onChange={(e) => setEditValues(v => ({ ...v, invoice: e.target.value }))}>
                {mockInvoices.map(i => <option key={i.id} value={i.number}>{i.number} — {i.title}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="label">Amount (USD)</label>
              <input type="number" step="0.01" className="input" value={editValues.amount} onChange={(e) => setEditValues(v => ({ ...v, amount: parseFloat(e.target.value) || 0 }))} />
            </div>
            <div><label className="label">Payment Method</label>
              <select className="input" value={editValues.method} onChange={(e) => setEditValues(v => ({ ...v, method: e.target.value }))}>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CASH">Cash</option>
                <option value="CREDIT_CARD">Credit Card</option>
                <option value="PAYPAL">PayPal</option>
                <option value="CRYPTO">Crypto</option>
              </select>
            </div>
            <div><label className="label">Status</label>
              <select className="input" value={editValues.status} onChange={(e) => setEditValues(v => ({ ...v, status: e.target.value }))}>
                <option value="COMPLETED">Completed</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Date</label>
              <input type="date" className="input" value={editValues.date} onChange={(e) => setEditValues(v => ({ ...v, date: e.target.value }))} />
            </div>
            <div><label className="label">Deposit Account</label>
              <select className="input">{mockBankAccounts.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-surface-200">
            <button type="button" onClick={() => { setShowEdit(false); setEditingPayment(null) }} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save Changes</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
