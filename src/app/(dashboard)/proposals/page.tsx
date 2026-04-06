"use client"

import { Header } from "@/components/dashboard/header"
import { DataTable } from "@/components/ui/data-table"
import { useApi } from "@/hooks/use-api"
import type { Proposal, Client } from "@/types"
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils"
import { FileText, Send, Check, X, Clock } from "lucide-react"

export default function ProposalsPage() {
  const { data: proposals, loading } = useApi<Proposal[]>("/api/proposals", [])
  const { data: clients } = useApi<Client[]>("/api/clients", [])

  if (loading) {
    return (
      <div>
        <Header title="Proposals" subtitle="Create and manage client proposals" action={{ label: "New Proposal", href: "/proposals/new" }} />
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
      <Header title="Proposals" subtitle="Create and manage client proposals" action={{ label: "New Proposal", href: "/proposals/new" }} />

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

    </div>
  )
}
