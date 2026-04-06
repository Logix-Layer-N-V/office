"use client"

import { useState } from "react"
import { Header } from "@/components/dashboard/header"
import { DataTable } from "@/components/ui/data-table"
import type { Column } from "@/components/ui/data-table"
import { Modal } from "@/components/ui/modal"
import { useApi } from "@/hooks/use-api"
import type { Credit } from "@/types"
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils"

export default function CreditsPage() {
  const [showCreate, setShowCreate] = useState(false)
  const { data: credits, loading } = useApi<Credit[]>("/api/credits", [])

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

  const mockCredits = credits

  const columns: Column<Credit>[] = [
    { key: "number", label: "Number", render: (r: Credit) => <span className="font-medium text-surface-800">{r.number}</span> },
    { key: "description", label: "Description" },
    { key: "status", label: "Status", render: (r: Credit) => <span className={getStatusColor(r.status)}>{r.status}</span> },
    { key: "amount", label: "Amount", align: "right" as const, render: (r: Credit) => <span className="font-medium">{formatCurrency(r.amount)}</span> },
    { key: "remaining", label: "Remaining", align: "right" as const, render: (r: Credit) => <span className={`font-medium ${r.remaining > 0 ? "text-emerald-600" : "text-surface-400"}`}>{formatCurrency(r.remaining)}</span> },
    { key: "issuedAt", label: "Issued", render: (r: Credit) => formatDate(r.issuedAt) },
  ]

  return (
    <div>
      <Header title="Credits" subtitle="Manage credit notes and refunds" action={{ label: "New Credit", onClick: () => setShowCreate(true) }} />
      <div className="p-6">
        <div className="card"><DataTable<Credit> columns={columns} data={mockCredits} /></div>
      </div>
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Credit Note">
        <form className="space-y-4">
          <div><label className="label">Description</label><input type="text" className="input" placeholder="Reason for credit" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Amount (USD)</label><input type="number" className="input" step="0.01" /></div>
            <div><label className="label">Expires</label><input type="date" className="input" /></div>
          </div>
          <div><label className="label">Reason</label><textarea className="input" rows={2} /></div>
          <div className="flex justify-end gap-2 pt-3 border-t border-surface-200">
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Create Credit</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
