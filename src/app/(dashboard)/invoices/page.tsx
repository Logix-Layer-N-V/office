"use client"

import { useState } from "react"
import { Header } from "@/components/dashboard/header"
import { DataTable } from "@/components/ui/data-table"
import { useApi } from "@/hooks/use-api"
import type { Invoice, Client } from "@/types"
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils"
import { ListToolbar, applyFilters, type ActiveFilter } from "@/components/ui/list-toolbar"
import { Receipt, DollarSign, Clock, AlertTriangle } from "lucide-react"
import { StatCard } from "@/components/ui/stat-card"

export default function InvoicesPage() {
  const { data: invoices, loading } = useApi<Invoice[]>("/api/invoices", [])
  const { data: clients } = useApi<Client[]>("/api/clients", [])
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState<ActiveFilter[]>([])
  const [activeTab, setActiveTab] = useState("all")

  if (loading) {
    return (
      <div>
        <Header title="Invoices" subtitle="Track and manage all invoices" action={{ label: "New Invoice", href: "/invoices/new" }} />
        <div className="flex items-center justify-center p-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      </div>
    )
  }

  const totalPaid = invoices.filter(i => i.status === "PAID").reduce((s, i) => s + (parseFloat(String(i.total)) || 0), 0)
  const totalDue = invoices.reduce((s, i) => s + (parseFloat(String(i.amountDue)) || 0), 0)
  const overdue = invoices.filter(i => i.status === "OVERDUE").length

  let filtered = applyFilters(
    invoices as unknown as Record<string, unknown>[],
    search,
    filters,
    ["number", "title", "client"]
  ) as unknown as Invoice[]

  if (activeTab !== "all") {
    filtered = filtered.filter(i => i.status === activeTab.toUpperCase())
  }

  const quickFilters = [
    { value: "all", label: "All", count: invoices.length },
    { value: "draft", label: "Draft", count: invoices.filter(i => i.status === "DRAFT").length },
    { value: "sent", label: "Sent", count: invoices.filter(i => i.status === "SENT").length },
    { value: "partial", label: "Partial", count: invoices.filter(i => i.status === "PARTIAL").length },
    { value: "paid", label: "Paid", count: invoices.filter(i => i.status === "PAID").length },
    { value: "overdue", label: "Overdue", count: invoices.filter(i => i.status === "OVERDUE").length },
  ]

  const columns = [
    { key: "number", label: "Invoice", render: (r: Invoice) => (
      <div>
        <a href={`/invoices/${r.id}`} className="font-medium text-brand-600 hover:underline">{r.number}</a>
        <p className="text-2xs text-surface-400">{r.title}</p>
      </div>
    )},
    { key: "client", label: "Client", render: (r: Invoice) => r.client?.name || "-" },
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
      <Header title="Invoices" subtitle="Track and manage all invoices" action={{ label: "New Invoice", href: "/invoices/new" }} />

      <div className="p-4 md:p-6 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard title="Total Invoices" value={String(invoices.length)} icon={Receipt} iconColor="text-surface-500" />
          <StatCard title="Paid" value={formatCurrency(totalPaid)} icon={DollarSign} iconColor="text-emerald-600" />
          <StatCard title="Amount Due" value={formatCurrency(totalDue)} icon={Clock} iconColor="text-amber-600" />
          <StatCard title="Overdue" value={String(overdue)} icon={AlertTriangle} iconColor="text-red-500" />
        </div>

        <div className="card p-4">
          <ListToolbar
            storageKey="invoices"
            searchPlaceholder="Search invoices..."
            filterOptions={[
              { key: "status", label: "Status", type: "select", options: [
                { value: "DRAFT", label: "Draft" }, { value: "SENT", label: "Sent" },
                { value: "PARTIAL", label: "Partial" }, { value: "PAID", label: "Paid" },
                { value: "OVERDUE", label: "Overdue" }, { value: "CANCELLED", label: "Cancelled" },
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
