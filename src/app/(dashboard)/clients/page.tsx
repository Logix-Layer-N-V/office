"use client"

import { useState } from "react"
import { Header } from "@/components/dashboard/header"
import { useApi } from "@/hooks/use-api"
import type { Client, Invoice } from "@/types"
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils"
import { Mail, Phone, MapPin, Search, Plus, Users } from "lucide-react"

export default function ClientsPage() {
  const [view, setView] = useState<"grid" | "list">("grid")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const { data: clients, loading } = useApi<Client[]>("/api/clients", [])
  const { data: invoices } = useApi<Invoice[]>("/api/invoices", [])

  if (loading) {
    return (
      <div>
        <Header title="Clients" subtitle="Manage your client relationships" action={{ label: "Add Client", href: "/clients/new" }} />
        <div className="flex items-center justify-center p-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      </div>
    )
  }

  const activeClients = clients.filter(c => c.status === "ACTIVE").length
  const totalRevenue = invoices.reduce((s, inv) => s + Number(inv.total || 0), 0)

  const enrichedClients = clients.map(c => ({
    ...c,
    totalSpent: invoices.filter(inv => inv.clientId === c.id).reduce((s, inv) => s + Number(inv.total || 0), 0),
    invoiceCount: invoices.filter(inv => inv.clientId === c.id).length,
    lastActivity: invoices.filter(inv => inv.clientId === c.id).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0]?.updatedAt || c.updatedAt,
  }))

  const filtered = enrichedClients.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || (c.company?.toLowerCase().includes(search.toLowerCase()) ?? false)
    const matchStatus = statusFilter === "All" || c.status === statusFilter.toUpperCase()
    return matchSearch && matchStatus
  })

  return (
    <div>
      <Header title="Clients" subtitle="Manage your client relationships" action={{ label: "Add Client", href: "/clients/new" }} />

      <div className="p-6 space-y-4">
        <div className="grid grid-cols-4 gap-3">
          <div className="card p-3">
            <p className="text-2xs text-surface-400">Total Clients</p>
            <p className="text-lg font-semibold text-surface-800">{clients.length}</p>
          </div>
          <div className="card p-3">
            <p className="text-2xs text-surface-400">Active</p>
            <p className="text-lg font-semibold text-emerald-600">{activeClients}</p>
          </div>
          <div className="card p-3">
            <p className="text-2xs text-surface-400">Total Revenue</p>
            <p className="text-lg font-semibold text-surface-800">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="card p-3">
            <p className="text-2xs text-surface-400">Avg. per Client</p>
            <p className="text-lg font-semibold text-surface-800">{formatCurrency(totalRevenue / (activeClients || 1))}</p>
          </div>
        </div>

        {/* Search + filter + view toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-surface-400" />
              <input type="text" placeholder="Search clients..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="input pl-8 w-56 text-xs" />
            </div>
            <div className="flex gap-1">
              {["All", "Active", "Inactive"].map((f) => (
                <button key={f} onClick={() => setStatusFilter(f)}
                  className={`rounded-md px-2.5 py-1 text-2xs font-medium ${statusFilter === f ? "bg-surface-100 text-surface-700" : "text-surface-400 hover:text-surface-600"}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-1">
            {(["grid", "list"] as const).map((v) => (
              <button key={v} onClick={() => setView(v)} className={`rounded-md px-2.5 py-1 text-2xs font-medium ${view === v ? "bg-surface-100 text-surface-700" : "text-surface-400"}`}>
                {v === "grid" ? "Cards" : "List"}
              </button>
            ))}
          </div>
        </div>

        {/* Empty state */}
        {filtered.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-brand-50 p-4 mb-4">
              <Users className="h-8 w-8 text-brand-400" />
            </div>
            <h3 className="text-sm font-semibold text-surface-700 mb-1">No clients yet</h3>
            <p className="text-xs text-surface-400 mb-4 text-center max-w-xs">
              {clients.length === 0
                ? "Add your first client to start managing relationships, sending proposals and invoices."
                : "No clients match your current filters."}
            </p>
            {clients.length === 0 && (
              <a href="/clients/new" className="btn-primary inline-flex items-center gap-2">
                <Plus className="h-3.5 w-3.5" /> Add First Client
              </a>
            )}
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((client) => (
              <a key={client.id} href={`/clients/${client.id}`} className="card p-4 hover:border-brand-200 transition-colors block">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-700 text-xs font-bold">
                      {client.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-surface-800">{client.name}</p>
                      <p className="text-2xs text-surface-400">{client.company}</p>
                    </div>
                  </div>
                  <span className={getStatusColor(client.status)}>{client.status}</span>
                </div>
                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center gap-2 text-2xs text-surface-500"><Mail className="h-3 w-3" /> {client.email}</div>
                  {client.phone && <div className="flex items-center gap-2 text-2xs text-surface-500"><Phone className="h-3 w-3" /> {client.phone}</div>}
                  {client.address && <div className="flex items-center gap-2 text-2xs text-surface-500"><MapPin className="h-3 w-3" /> {client.address}</div>}
                </div>
                <div className="flex items-center justify-between border-t border-surface-100 pt-2">
                  <div className="flex gap-4">
                    <div><p className="text-2xs text-surface-400">Revenue</p><p className="text-xs font-semibold text-surface-700">{formatCurrency(client.totalSpent)}</p></div>
                    <div><p className="text-2xs text-surface-400">Invoices</p><p className="text-xs font-semibold text-surface-700">{client.invoiceCount}</p></div>
                  </div>
                  <p className="text-2xs text-surface-400">Last: {formatDate(client.lastActivity)}</p>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="card">
            <table className="table-compact">
              <thead>
                <tr><th>Client</th><th>Company</th><th>Email</th><th>Status</th><th className="text-right">Revenue</th><th>Last Activity</th></tr>
              </thead>
              <tbody>
                {filtered.map((client) => (
                  <tr key={client.id} className="cursor-pointer hover:bg-surface-50" onClick={() => window.location.href = `/clients/${client.id}`}>
                    <td><a href={`/clients/${client.id}`} className="font-medium text-brand-600 hover:underline">{client.name}</a></td>
                    <td>{client.company}</td>
                    <td>{client.email}</td>
                    <td><span className={getStatusColor(client.status)}>{client.status}</span></td>
                    <td className="text-right font-medium">{formatCurrency(client.totalSpent)}</td>
                    <td>{formatDate(client.lastActivity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}
