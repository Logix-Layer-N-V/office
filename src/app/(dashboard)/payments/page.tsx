"use client"

import { useState } from "react"
import { Header } from "@/components/dashboard/header"
import { useApi, apiMutate } from "@/hooks/use-api"
import type { Payment, Invoice, Client, BankAccount } from "@/types"
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils"
import { Pencil, Trash2, MoreHorizontal, Eye, ArrowDownLeft, Clock, CreditCard } from "lucide-react"
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

  const totalReceived = mockPayments.filter(p => p.status === "COMPLETED").reduce((s, p) => s + (parseFloat(String(p.amount)) || 0), 0)
  const totalPending = mockPayments.filter(p => p.status === "PENDING").reduce((s, p) => s + (parseFloat(String(p.amount)) || 0), 0)

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

    </div>
  )
}
