"use client"

import { useState } from "react"
import { Header } from "@/components/dashboard/header"
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
  const [editingPayment, setEditingPayment] = useState<PaymentData | null>(null)
  const [showEdit, setShowEdit] = useState(false)
  const [editValues, setEditValues] = useState({ client: "", invoice: "", amount: 0, method: "BANK_TRANSFER", status: "COMPLETED", date: "" })

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

  const mockPayments = payments
  const mockInvoices = invoices
  const mockClients = clients
  const mockBankAccounts = bankAccounts

  const totalReceived = mockPayments.filter(p => p.status === "COMPLETED").reduce((s, p) => s + p.amount, 0)
  const totalPending = mockPayments.filter(p => p.status === "PENDING").reduce((s, p) => s + p.amount, 0)

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

    </div>
  )
}
