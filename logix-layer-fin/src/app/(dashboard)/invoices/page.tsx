"use client"

import { useState } from "react"
import { Header } from "@/components/dashboard/header"
import { DataTable } from "@/components/ui/data-table"
import { Modal } from "@/components/ui/modal"
import { useApi } from "@/hooks/use-api"
import type { Invoice, Client } from "@/types"
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils"
import { Receipt, DollarSign, Clock, AlertTriangle } from "lucide-react"

export default function InvoicesPage() {
  const [showCreate, setShowCreate] = useState(false)
  const { data: invoices, loading } = useApi<Invoice[]>("/api/invoices", [])
  const { data: clients } = useApi<Client[]>("/api/clients", [])

  if (loading) {
    return (
      <div>
        <Header title="Invoices" subtitle="Track and manage all invoices" action={{ label: "New Invoice", onClick: () => setShowCreate(true) }} />
        <div className="flex items-center justify-center p-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      </div>
    )
  }

  const mockInvoices = invoices
  const mockClients = clients

  const totalPaid = mockInvoices.filter(i => i.status === "PAID").reduce((s, i) => s + i.total, 0)
  const totalDue = mockInvoices.reduce((s, i) => s + i.amountDue, 0)
  const overdue = mockInvoices.filter(i => i.status === "OVERDUE").length

  const columns = [
    { key: "number", label: "Invoice", render: (r: Invoice) => (
      <div>
        <a href={`/invoices/${r.id}`} className="font-medium text-brand-600 hover:underline">{r.number}</a>
        <p className="text-2xs text-surface-400">{r.title}</p>
      </div>
    )},
    { key: "client", label: "Client" },
    { key: "status", label: "Status", render: (r: Invoice) => (
      <span className={getStatusColor(r.status)}>{r.status}</span>
    )},
    { key: "total", label: "Total", align: "right" as const, render: (r: Invoice) => (
      <span className="font-medium">{formatCurrency(r.total)}</span>
    )},
    { key: "amountDue", label: "Due", align: "right" as const, render: (r: Invoice) => (
      <span className={r.amountDue > 0 ? "font-medium text-amber-600" : "text-surface-400"}>
        {formatCurrency(r.amountDue)}
      </span>
    )},
    { key: "dueDate", label: "Due Date", render: (r: Invoice) => formatDate(r.dueDate) },
  ]

  return (
    <div>
      <Header title="Invoices" subtitle="Track and manage all invoices" action={{ label: "New Invoice", onClick: () => setShowCreate(true) }} />

      <div className="p-6 space-y-4">
        <div className="grid grid-cols-4 gap-3">
          <div className="card flex items-center gap-3 p-3">
            <Receipt className="h-4 w-4 text-surface-500" />
            <div><p className="text-2xs text-surface-400">Total Invoices</p><p className="text-sm font-semibold">{mockInvoices.length}</p></div>
          </div>
          <div className="card flex items-center gap-3 p-3">
            <DollarSign className="h-4 w-4 text-emerald-600" />
            <div><p className="text-2xs text-surface-400">Paid</p><p className="text-sm font-semibold text-emerald-600">{formatCurrency(totalPaid)}</p></div>
          </div>
          <div className="card flex items-center gap-3 p-3">
            <Clock className="h-4 w-4 text-amber-600" />
            <div><p className="text-2xs text-surface-400">Amount Due</p><p className="text-sm font-semibold text-amber-600">{formatCurrency(totalDue)}</p></div>
          </div>
          <div className="card flex items-center gap-3 p-3">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <div><p className="text-2xs text-surface-400">Overdue</p><p className="text-sm font-semibold text-red-600">{overdue}</p></div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between px-4 py-3 border-b border-surface-100">
            <div className="flex gap-1">
              {["All", "Draft", "Sent", "Partial", "Paid", "Overdue"].map((f) => (
                <button key={f} className={`rounded-md px-2.5 py-1 text-2xs font-medium ${f === "All" ? "bg-surface-100 text-surface-700" : "text-surface-400 hover:text-surface-600"}`}>{f}</button>
              ))}
            </div>
          </div>
          <DataTable columns={columns} data={mockInvoices} />
        </div>
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Invoice" size="lg">
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Client</label>
              <select className="input"><option value="">Select client...</option>{mockClients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
            </div>
            <div><label className="label">Due Date</label><input type="date" className="input" /></div>
          </div>
          <div><label className="label">Title</label><input type="text" className="input" placeholder="Invoice title" /></div>
          <div>
            <label className="label">Line Items</label>
            <div className="rounded-md border border-surface-200">
              <table className="table-compact">
                <thead><tr><th>Description</th><th className="w-20">Hours</th><th className="w-24">Rate</th><th className="w-28 text-right">Amount</th></tr></thead>
                <tbody><tr>
                  <td><input type="text" className="input" placeholder="Service" /></td>
                  <td><input type="number" className="input" defaultValue={0} /></td>
                  <td><input type="number" className="input" defaultValue={65} /></td>
                  <td className="text-right font-medium">$0.00</td>
                </tr></tbody>
              </table>
            </div>
            <button type="button" className="btn-ghost mt-2 text-2xs">+ Add line item</button>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-surface-200">
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
            <button type="button" className="btn-secondary">Save Draft</button>
            <button type="submit" className="btn-primary">Create & Send</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
