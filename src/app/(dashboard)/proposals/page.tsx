"use client"

import { useState } from "react"
import { Header } from "@/components/dashboard/header"
import { DataTable } from "@/components/ui/data-table"
import { useApi } from "@/hooks/use-api"
import type { Proposal, Client } from "@/types"
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils"
import { ListToolbar, applyFilters, type ActiveFilter } from "@/components/ui/list-toolbar"
import { FileText, Check, Clock } from "lucide-react"
import { StatCard } from "@/components/ui/stat-card"

export default function ProposalsPage() {
  const { data: proposals, loading } = useApi<Proposal[]>("/api/proposals", [])
  const { data: clients } = useApi<Client[]>("/api/clients", [])
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState<ActiveFilter[]>([])
  const [activeTab, setActiveTab] = useState("all")

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

  // Apply search + filters
  let filtered = applyFilters(
    proposals as unknown as Record<string, unknown>[],
    search,
    filters,
    ["number", "title", "client"]
  ) as unknown as Proposal[]

  // Apply quick filter tab
  if (activeTab !== "all") {
    filtered = filtered.filter(p => p.status === activeTab.toUpperCase())
  }

  const clientOptions = clients.map(c => ({ value: c.id, label: c.name }))

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
    total: proposals.length,
    approved: proposals.filter(p => p.status === "APPROVED").length,
    pending: proposals.filter(p => p.status === "SENT").length,
    value: proposals.reduce((s, p) => s + parseFloat(String(p.total) || "0"), 0),
  }

  const quickFilters = [
    { value: "all", label: "All", count: proposals.length },
    { value: "draft", label: "Draft", count: proposals.filter(p => p.status === "DRAFT").length },
    { value: "sent", label: "Sent", count: proposals.filter(p => p.status === "SENT").length },
    { value: "approved", label: "Approved", count: proposals.filter(p => p.status === "APPROVED").length },
    { value: "rejected", label: "Rejected", count: proposals.filter(p => p.status === "REJECTED").length },
  ]

  return (
    <div>
      <Header title="Proposals" subtitle="Create and manage client proposals" action={{ label: "New Proposal", href: "/proposals/new" }} />

      <div className="p-4 md:p-6 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard title="Total" value={String(stats.total)} icon={FileText} iconColor="text-surface-600" />
          <StatCard title="Approved" value={String(stats.approved)} icon={Check} iconColor="text-emerald-600" />
          <StatCard title="Pending" value={String(stats.pending)} icon={Clock} iconColor="text-amber-600" />
          <StatCard title="Total Value" value={formatCurrency(stats.value)} icon={FileText} iconColor="text-brand-600" />
        </div>

        <div className="card p-4">
          <ListToolbar
            storageKey="proposals"
            searchPlaceholder="Search proposals..."
            filterOptions={[
              { key: "status", label: "Status", type: "select", options: [
                { value: "DRAFT", label: "Draft" }, { value: "SENT", label: "Sent" },
                { value: "APPROVED", label: "Approved" }, { value: "REJECTED", label: "Rejected" },
              ]},
            ]}
            quickFilters={quickFilters}
            activeQuickFilter={activeTab}
            onQuickFilterChange={setActiveTab}
            onChange={(s, f) => { setSearch(s); setFilters(f) }}
          />
        </div>

        <div className="card">
          <DataTable columns={columns} data={filtered} />
        </div>
      </div>
    </div>
  )
}
