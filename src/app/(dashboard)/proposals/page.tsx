"use client"

import { Header } from "@/components/dashboard/header"
import { DataTable } from "@/components/ui/data-table"
import { useApi } from "@/hooks/use-api"
import type { Proposal, Client } from "@/types"
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils"
import { FileText, Send, Check, X, Clock } from "lucide-react"
import { StatCard } from "@/components/ui/stat-card"

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
    { key: "client", label: "Client", render: (r: Proposal) => r.client?.name || "-" },
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
    value: mockProposals.reduce((s, p) => s + parseFloat(String(p.total) || "0"), 0),
  }

  return (
    <div>
      <Header title="Proposals" subtitle="Create and manage client proposals" action={{ label: "New Proposal", href: "/proposals/new" }} />

      <div className="p-4 md:p-6 space-y-4">
        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard title="Total" value={String(stats.total)} icon={FileText} iconColor="text-surface-600" />
          <StatCard title="Approved" value={String(stats.approved)} icon={Check} iconColor="text-emerald-600" />
          <StatCard title="Pending" value={String(stats.pending)} icon={Clock} iconColor="text-amber-600" />
          <StatCard title="Total Value" value={formatCurrency(stats.value)} icon={FileText} iconColor="text-brand-600" />
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
