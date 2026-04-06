"use client"

import { useState } from "react"
import { Header } from "@/components/dashboard/header"
import { DataTable } from "@/components/ui/data-table"
import { Modal } from "@/components/ui/modal"
import { useApi } from "@/hooks/use-api"
import type { Estimate, Client } from "@/types"
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils"
import { ArrowRightLeft } from "lucide-react"

export default function EstimatesPage() {
  const [showCreate, setShowCreate] = useState(false)
  const { data: estimates, loading } = useApi<Estimate[]>("/api/estimates", [])
  const { data: clients } = useApi<Client[]>("/api/clients", [])

  if (loading) {
    return (
      <div>
        <Header title="Estimates" subtitle="Create estimates and convert to invoices" action={{ label: "New Estimate", onClick: () => setShowCreate(true) }} />
        <div className="flex items-center justify-center p-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      </div>
    )
  }

  const mockEstimates = estimates
  const mockClients = clients

  const columns = [
    { key: "number", label: "Number", render: (r: Estimate) => (
      <a href={`/estimates/${r.id}`} className="font-medium text-brand-600 hover:underline">{r.number}</a>
    )},
    { key: "title", label: "Title", render: (r: Estimate) => (
      <a href={`/estimates/${r.id}`} className="text-surface-700 hover:text-brand-600">{r.title}</a>
    )},
    { key: "client", label: "Client" },
    { key: "status", label: "Status", render: (r: Estimate) => (
      <span className={getStatusColor(r.status)}>{r.status}</span>
    )},
    { key: "total", label: "Amount", align: "right" as const, render: (r: Estimate) => (
      <span className="font-medium">{formatCurrency(r.total)}</span>
    )},
    { key: "createdAt", label: "Date", render: (r: Estimate) => formatDate(r.createdAt) },
    { key: "actions", label: "", align: "right" as const, render: (r: Estimate) => (
      r.status === "ACCEPTED" ? (
        <button className="btn-ghost text-2xs text-brand-600">
          <ArrowRightLeft className="h-3 w-3" /> Convert to Invoice
        </button>
      ) : null
    )},
  ]

  return (
    <div>
      <Header title="Estimates" subtitle="Create estimates and convert to invoices" action={{ label: "New Estimate", onClick: () => setShowCreate(true) }} />

      <div className="p-6 space-y-4">
        <div className="card">
          <div className="flex items-center justify-between px-4 py-3 border-b border-surface-100">
            <div className="flex gap-1">
              {["All", "Draft", "Sent", "Accepted", "Converted"].map((f) => (
                <button key={f} className={`rounded-md px-2.5 py-1 text-2xs font-medium ${f === "All" ? "bg-surface-100 text-surface-700" : "text-surface-400 hover:text-surface-600"}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <DataTable columns={columns} data={mockEstimates} />
        </div>
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Estimate" size="lg">
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Client</label>
              <select className="input">
                <option value="">Select client...</option>
                {mockClients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Valid Until</label>
              <input type="date" className="input" />
            </div>
          </div>
          <div>
            <label className="label">Title</label>
            <input type="text" className="input" placeholder="e.g. E-commerce Platform Development" />
          </div>
          <div>
            <label className="label">Line Items</label>
            <div className="rounded-md border border-surface-200">
              <table className="table-compact">
                <thead><tr><th>Description</th><th className="w-20">Hours</th><th className="w-24">Rate</th><th className="w-28 text-right">Amount</th></tr></thead>
                <tbody>
                  <tr>
                    <td><input type="text" className="input" placeholder="Service description" /></td>
                    <td><input type="number" className="input" defaultValue={0} /></td>
                    <td><input type="number" className="input" defaultValue={65} /></td>
                    <td className="text-right font-medium">$0.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <button type="button" className="btn-ghost mt-2 text-2xs">+ Add line item</button>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-surface-200">
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Create Estimate</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
