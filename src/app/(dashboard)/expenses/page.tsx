"use client"

import { useState } from "react"
import { Header } from "@/components/dashboard/header"
import { DataTable } from "@/components/ui/data-table"
import { Modal } from "@/components/ui/modal"
import { useApi } from "@/hooks/use-api"
import type { Expense } from "@/types"
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils"
import { ListToolbar, applyFilters, type ActiveFilter } from "@/components/ui/list-toolbar"
import { StatCard } from "@/components/ui/stat-card"
import { TrendingDown } from "lucide-react"

export default function ExpensesPage() {
  const [showCreate, setShowCreate] = useState(false)
  const { data: expenses, loading } = useApi<Expense[]>("/api/expenses", [])
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState<ActiveFilter[]>([])
  const [activeTab, setActiveTab] = useState("all")

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

  const totalExpenses = expenses.reduce((s, e) => s + (parseFloat(String(e.amount)) || 0), 0)
  const byCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + (parseFloat(String(e.amount)) || 0)
    return acc
  }, {} as Record<string, number>)

  let filtered = applyFilters(
    expenses as unknown as Record<string, unknown>[],
    search,
    filters,
    ["description", "vendor", "category"]
  ) as unknown as Expense[]

  if (activeTab !== "all") {
    filtered = filtered.filter(e => e.status === activeTab.toUpperCase())
  }

  const quickFilters = [
    { value: "all", label: "All", count: expenses.length },
    { value: "pending", label: "Pending", count: expenses.filter(e => e.status === "PENDING").length },
    { value: "approved", label: "Approved", count: expenses.filter(e => e.status === "APPROVED").length },
    { value: "paid", label: "Paid", count: expenses.filter(e => e.status === "PAID").length },
  ]

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

      <div className="p-4 md:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard title="Total Expenses" value={formatCurrency(totalExpenses)} subtitle="This period" icon={TrendingDown} iconColor="text-red-500" />
          <div className="card p-4">
            <p className="text-2xs font-medium uppercase tracking-wider text-surface-400 mb-2">By Category</p>
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

        <div className="card p-4">
          <ListToolbar
            storageKey="expenses"
            searchPlaceholder="Search expenses..."
            filterOptions={[
              { key: "status", label: "Status", type: "select", options: [
                { value: "PENDING", label: "Pending" }, { value: "APPROVED", label: "Approved" },
                { value: "REJECTED", label: "Rejected" }, { value: "PAID", label: "Paid" },
              ]},
              { key: "category", label: "Category", type: "select", options: [
                { value: "SOFTWARE", label: "Software" }, { value: "HARDWARE", label: "Hardware" },
                { value: "OFFICE", label: "Office" }, { value: "TRAVEL", label: "Travel" },
                { value: "MARKETING", label: "Marketing" }, { value: "SALARY", label: "Salary" },
                { value: "CONTRACTOR", label: "Contractor" }, { value: "UTILITIES", label: "Utilities" },
                { value: "OTHER", label: "Other" },
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

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Add Expense">
        <form className="space-y-4">
          <div><label className="label">Description</label><input type="text" className="input" placeholder="What was this expense for?" /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="label">Amount (USD)</label><input type="number" className="input" step="0.01" /></div>
            <div><label className="label">Category</label>
              <select className="input"><option>Software</option><option>Hardware</option><option>Office</option><option>Travel</option><option>Marketing</option><option>Salary</option><option>Contractor</option><option>Utilities</option><option>Other</option></select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
