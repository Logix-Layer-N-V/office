"use client"

import { useState } from "react"
import { Header } from "@/components/dashboard/header"
import { DataTable } from "@/components/ui/data-table"
import type { Column } from "@/components/ui/data-table"
import { Modal } from "@/components/ui/modal"
import { useApi, apiMutate } from "@/hooks/use-api"
import type { Credit } from "@/types"
import { formatCurrency, formatDate, getStatusColor, toNum } from "@/lib/utils"
import { ListToolbar, applyFilters, type ActiveFilter } from "@/components/ui/list-toolbar"

export default function CreditsPage() {
  const [showCreate, setShowCreate] = useState(false)
  const { data: credits, loading, refresh } = useApi<Credit[]>("/api/credits", [])
  const [creditDesc, setCreditDesc] = useState("")
  const [creditAmount, setCreditAmount] = useState("")
  const [creditExpires, setCreditExpires] = useState("")
  const [creditReason, setCreditReason] = useState("")
  const [creditLoading, setCreditLoading] = useState(false)
  const [creditError, setCreditError] = useState("")

  const handleCreateCredit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!creditDesc || !creditAmount) { setCreditError("Description and Amount are required"); return }
    try {
      setCreditError("")
      setCreditLoading(true)
      const amt = parseFloat(creditAmount)
      await apiMutate("/api/credits", "POST", {
        number: `CR-${Date.now().toString(36).toUpperCase()}`,
        description: creditDesc,
        amount: amt,
        remaining: amt,
        reason: creditReason || null,
        expiresAt: creditExpires || null,
      })
      setShowCreate(false)
      setCreditDesc(""); setCreditAmount(""); setCreditExpires(""); setCreditReason("")
      refresh()
    } catch (err) {
      setCreditError(err instanceof Error ? err.message : "Failed to create credit")
    } finally {
      setCreditLoading(false)
    }
  }
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState<ActiveFilter[]>([])
  const [activeTab, setActiveTab] = useState("all")

  if (loading) {
    return (
      <div>
        <Header title="Credits" subtitle="Manage credit notes and refunds" action={{ label: "New Credit", onClick: () => setShowCreate(true) }} />
        <div className="flex items-center justify-center p-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      </div>
    )
  }

  let filtered = applyFilters(
    credits as unknown as Record<string, unknown>[],
    search,
    filters,
    ["number", "description", "reason"]
  ) as unknown as Credit[]

  if (activeTab !== "all") {
    filtered = filtered.filter(c => c.status === activeTab.toUpperCase())
  }

  const quickFilters = [
    { value: "all", label: "All", count: credits.length },
    { value: "active", label: "Active", count: credits.filter(c => c.status === "ACTIVE").length },
    { value: "used", label: "Used", count: credits.filter(c => c.status === "USED").length },
    { value: "expired", label: "Expired", count: credits.filter(c => c.status === "EXPIRED").length },
  ]

  const columns: Column<Credit>[] = [
    { key: "number", label: "Number", render: (r: Credit) => <span className="font-medium text-surface-800">{r.number}</span> },
    { key: "description", label: "Description" },
    { key: "status", label: "Status", render: (r: Credit) => <span className={getStatusColor(r.status)}>{r.status}</span> },
    { key: "amount", label: "Amount", align: "right" as const, render: (r: Credit) => <span className="font-medium">{formatCurrency(r.amount)}</span> },
    { key: "remaining", label: "Remaining", align: "right" as const, render: (r: Credit) => <span className={`font-medium ${toNum(r.remaining) > 0 ? "text-emerald-600" : "text-surface-400"}`}>{formatCurrency(r.remaining)}</span> },
    { key: "issuedAt", label: "Issued", render: (r: Credit) => formatDate(r.issuedAt) },
  ]

  return (
    <div>
      <Header title="Credits" subtitle="Manage credit notes and refunds" action={{ label: "New Credit", onClick: () => setShowCreate(true) }} />
      <div className="p-4 md:p-6 space-y-4">
        <div className="card p-4">
          <ListToolbar
            storageKey="credits"
            searchPlaceholder="Search credits..."
            filterOptions={[
              { key: "status", label: "Status", type: "select", options: [
                { value: "ACTIVE", label: "Active" }, { value: "USED", label: "Used" },
                { value: "EXPIRED", label: "Expired" }, { value: "CANCELLED", label: "Cancelled" },
              ]},
            ]}
            quickFilters={quickFilters}
            activeQuickFilter={activeTab}
            onQuickFilterChange={setActiveTab}
            onChange={(s, f) => { setSearch(s); setFilters(f) }}
          />
        </div>
        <div className="card"><DataTable<Credit> columns={columns} data={filtered} /></div>
      </div>
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Credit Note">
        <form className="space-y-4" onSubmit={handleCreateCredit}>
          {creditError && <div className="p-2 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">{creditError}</div>}
          <div><label className="label">Description *</label><input type="text" className="input" placeholder="Reason for credit" value={creditDesc} onChange={(e) => setCreditDesc(e.target.value)} required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Amount (USD) *</label><input type="number" className="input" step="0.01" min="0" value={creditAmount} onChange={(e) => setCreditAmount(e.target.value)} required /></div>
            <div><label className="label">Expires</label><input type="date" className="input" value={creditExpires} onChange={(e) => setCreditExpires(e.target.value)} /></div>
          </div>
          <div><label className="label">Reason</label><textarea className="input" rows={2} value={creditReason} onChange={(e) => setCreditReason(e.target.value)} /></div>
          <div className="flex justify-end gap-2 pt-3 border-t border-surface-200">
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={creditLoading} className="btn-primary">{creditLoading ? "Saving..." : "Create Credit"}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
