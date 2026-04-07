"use client"

import { useState } from "react"
import { Header } from "@/components/dashboard/header"
import { DataTable } from "@/components/ui/data-table"
import { useApi } from "@/hooks/use-api"
import type { Estimate, Client } from "@/types"
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils"
import { ListToolbar, applyFilters, type ActiveFilter } from "@/components/ui/list-toolbar"
import { ArrowRightLeft } from "lucide-react"

export default function EstimatesPage() {
  const { data: estimates, loading } = useApi<Estimate[]>("/api/estimates", [])
  const { data: clients } = useApi<Client[]>("/api/clients", [])
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState<ActiveFilter[]>([])
  const [activeTab, setActiveTab] = useState("all")

  if (loading) {
    return (
      <div>
        <Header title="Estimates" subtitle="Create estimates and convert to invoices" action={{ label: "New Estimate", href: "/estimates/new" }} />
        <div className="flex items-center justify-center p-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      </div>
    )
  }

  let filtered = applyFilters(
    estimates as unknown as Record<string, unknown>[],
    search,
    filters,
    ["number", "title", "client"]
  ) as unknown as Estimate[]

  if (activeTab !== "all") {
    filtered = filtered.filter(e => e.status === activeTab.toUpperCase())
  }

  const quickFilters = [
    { value: "all", label: "All", count: estimates.length },
    { value: "draft", label: "Draft", count: estimates.filter(e => e.status === "DRAFT").length },
    { value: "sent", label: "Sent", count: estimates.filter(e => e.status === "SENT").length },
    { value: "accepted", label: "Accepted", count: estimates.filter(e => e.status === "ACCEPTED").length },
    { value: "converted", label: "Converted", count: estimates.filter(e => e.status === "CONVERTED").length },
  ]

  const columns = [
    { key: "number", label: "Number", render: (r: Estimate) => (
      <a href={`/estimates/${r.id}`} className="font-medium text-brand-600 hover:underline">{r.number}</a>
    )},
    { key: "title", label: "Title", render: (r: Estimate) => (
      <a href={`/estimates/${r.id}`} className="text-surface-700 hover:text-brand-600">{r.title}</a>
    )},
    { key: "client", label: "Client", render: (r: Estimate) => r.client?.name || "-" },
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
      <Header title="Estimates" subtitle="Create estimates and convert to invoices" action={{ label: "New Estimate", href: "/estimates/new" }} />

      <div className="p-4 md:p-6 space-y-4">
        <div className="card p-4">
          <ListToolbar
            storageKey="estimates"
            searchPlaceholder="Search estimates..."
            filterOptions={[
              { key: "status", label: "Status", type: "select", options: [
                { value: "DRAFT", label: "Draft" }, { value: "SENT", label: "Sent" },
                { value: "ACCEPTED", label: "Accepted" }, { value: "REJECTED", label: "Rejected" },
                { value: "CONVERTED", label: "Converted" },
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
