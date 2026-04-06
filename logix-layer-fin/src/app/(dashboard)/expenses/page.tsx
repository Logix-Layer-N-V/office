"use client"

import { useState } from "react"
import { Header } from "@/components/dashboard/header"
import { DataTable } from "@/components/ui/data-table"
import { Modal } from "@/components/ui/modal"
import { useApi } from "@/hooks/use-api"
import type { Expense } from "@/types"
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils"

export default function ExpensesPage() {
  const [showCreate, setShowCreate] = useState(false)
  const { data: expenses, loading } = useApi<Expense[]>("/api/expenses", [])

  if (loading) {
    return (
      <div>
        <Header title="Expenses" subtitle="Track and categorize expenses" action={{ label: "Add Expense", onClick: () => setShowCreate(true) }} />
        <div className="flex items-center justify-center p-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      </div>
    )
  }

  const mockExpenses = expenses

  const totalExpenses = mockExpenses.reduce((s, e) => s + e.amount, 0)
  const byCategory = mockExpenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount
    return acc
  }, {} as Record<string, number>)

  const columns = [
    { key: "description", label: "Description", render: (r: Expense) => <span className="font-medium text-surface-800">{r.description}</span> },
    { key: "category", label: "Category", render: (r: Expense) => <span className="badge-neutral">{r.category}</span> },
    { key: "vendor", label: "Vendor" },
    { key: "status", label: "Status", render: (r: Expense) => <span className={getStatusColor(r.status)}>{r.status}</span> },
    { key: "amount", label: "Amount", align: "right" as const, render: (r: Expense) => <span className="font-medium text-red-500">{formatCurrency(r.amount)}</span> },
    { key: "date", label: "Date", render: (r: Expense) => formatDate(r.date) },
  ]

  return (
    <div>
      <Header title="Expenses" subtitle="Track and categorize expenses" action={{ label: "Add Expense", onClick: () => setShowCreate(true) }} />

      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="card p-4">
            <p className="text-2xs text-surface-400 uppercase tracking-wider">Total Expenses</p>
            <p className="text-2xl font-bold text-red-500">{formatCurrency(totalExpenses)}</p>
            <p className="text-2xs text-surface-400 mt-1">This period</p>
          </div>
          <div className="card p-4">
            <p className="text-2xs text-surface-400 uppercase tracking-wider mb-2">By Category</p>
            <div className="space-y-1.5">
              {Object.entries(byCategory).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([cat, amt]) => (
                <div key={cat} className="flex items-center justify-between">
                  <span className="text-2xs text-surface-500">{cat}</span>
                  <span className="text-xs font-medium">{formatCurrency(amt)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <DataTable columns={columns} data={mockExpenses} />
        </div>
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Add Expense">
        <form className="space-y-4">
          <div><label className="label">Description</label><input type="text" className="input" placeholder="What was this expense for?" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Amount (USD)</label><input type="number" className="input" step="0.01" /></div>
            <div><label className="label">Category</label>
              <select className="input"><option>Software</option><option>Hardware</option><option>Office</option><option>Travel</option><option>Marketing</option><option>Salary</option><option>Contractor</option><option>Utilities</option><option>Other</option></select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Vendor</label><input type="text" className="input" placeholder="Company name" /></div>
            <div><label className="label">Date</label><input type="date" className="input" /></div>
          </div>
          <div><label className="label">Notes</label><textarea className="input" rows={2} placeholder="Additional notes..." /></div>
          <div className="flex justify-end gap-2 pt-3 border-t border-surface-200">
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Add Expense</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
