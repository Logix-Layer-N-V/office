"use client"

import { useState } from "react"
import { Header } from "@/components/dashboard/header"
import { DataTable } from "@/components/ui/data-table"
import { Modal } from "@/components/ui/modal"
import { useApi } from "@/hooks/use-api"
import type { Proposal, Client } from "@/types"
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils"
import { FileText, Send, Check, X, Clock } from "lucide-react"

export default function ProposalsPage() {
  const [showCreate, setShowCreate] = useState(false)
  const { data: proposals, loading } = useApi<Proposal[]>("/api/proposals", [])
  const { data: clients } = useApi<Client[]>("/api/clients", [])

  if (loading) {
    return (
      <div>
        <Header title="Proposals" subtitle="Create and manage client proposals" action={{ label: "New Proposal", onClick: () => setShowCreate(true) }} />
        <div className="flex items-center justify-center p-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      </div>
    )
  }

  const mockProposals = proposals
  const mockClients = clients

  const columns = [
    { key: "number", label: "Number", render: (r: Proposal) => (
      <a href={`/proposals/${r.id}`} className="font-medium text-brand-600 hover:underline">{r.number}</a>
    )},
    { key: "title", label: "Title", render: (r: Proposal) => (
      <a href={`/proposals/${r.id}`} className="text-surface-700 hover:text-brand-600">{r.title}</a>
    )},
    { key: "client", label: "Client" },
    { key: "status", label: "Status", render: (r: Proposal) => (
      <span className={getStatusColor(r.status)}>{r.status}</span>
    )},
    { key: "total", label: "Amount", align: "right" as const, render: (r: Proposal) => (
      <span className="font-medium">{formatCurrency(r.total)}</span>
    )},
    { key: "createdAt", label: "Date", render: (r: Proposal) => formatDate(r.createdAt) },
    { key: "validUntil", label: "Valid Until", render: (r: Proposal) => formatDate(r.validUntil || "") },
  ]

  const stats = {
    total: mockProposals.length,
    approved: mockProposals.filter(p => p.status === "APPROVED").length,
    pending: mockProposals.filter(p => p.status === "SENT").length,
    value: mockProposals.reduce((s, p) => s + p.total, 0),
  }

  return (
    <div>
      <Header title="Proposals" subtitle="Create and manage client proposals" action={{ label: "New Proposal", onClick: () => setShowCreate(true) }} />

      <div className="p-6 space-y-4">
        {/* Quick stats */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Total", value: stats.total, icon: FileText, color: "text-surface-600" },
            { label: "Approved", value: stats.approved, icon: Check, color: "text-emerald-600" },
            { label: "Pending", value: stats.pending, icon: Clock, color: "text-amber-600" },
            { label: "Total Value", value: formatCurrency(stats.value), icon: FileText, color: "text-brand-600" },
          ].map((s) => (
            <div key={s.label} className="card flex items-center gap-3 p-3">
              <s.icon className={`h-4 w-4 ${s.color}`} />
              <div>
                <p className="text-2xs text-surface-400">{s.label}</p>
                <p className="text-sm font-semibold text-surface-800">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="card">
          <div className="flex items-center justify-between px-4 py-3 border-b border-surface-100">
            <div className="flex gap-1">
              {["All", "Draft", "Sent", "Approved"].map((f) => (
                <button key={f} className={`rounded-md px-2.5 py-1 text-2xs font-medium ${f === "All" ? "bg-surface-100 text-surface-700" : "text-surface-400 hover:text-surface-600"}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <DataTable columns={columns} data={mockProposals} />
        </div>
      </div>

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Proposal" size="lg">
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
            <input type="text" className="input" placeholder="e.g. Website Redesign & Development" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={3} placeholder="Project description..." />
          </div>

          {/* Line items */}
          <div>
            <label className="label">Line Items</label>
            <div className="rounded-md border border-surface-200">
              <table className="table-compact">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th className="w-20">Hours</th>
                    <th className="w-24">Rate (USD)</th>
                    <th className="w-28 text-right">Amount</th>
                  </tr>
                </thead>
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

          <div className="flex items-center justify-between pt-3 border-t border-surface-200">
            <div className="text-right">
              <p className="text-2xs text-surface-400">Total</p>
              <p className="text-lg font-semibold text-surface-800">$0.00</p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
              <button type="button" className="btn-secondary">Save Draft</button>
              <button type="submit" className="btn-primary">
                <Send className="h-3.5 w-3.5" /> Send Proposal
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  )
}
