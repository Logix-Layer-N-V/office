"use client"

import { useState } from "react"
import { Header } from "@/components/dashboard/header"
import { DataTable } from "@/components/ui/data-table"
import { Modal } from "@/components/ui/modal"
import { useApi, apiMutate } from "@/hooks/use-api"
import type { Expense } from "@/types"
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils"
import { ListToolbar, applyFilters, type ActiveFilter } from "@/components/ui/list-toolbar"
import { StatCard } from "@/components/ui/stat-card"
import { TrendingDown } from "lucide-react"

export default function ExpensesPage() {
  const [showCreate, setShowCreate] = useState(false)
  const { data: expenses, loading, refresh } = useApi<Expense[]>("/api/expenses", [])
  const [formDesc, setFormDesc] = useState("")
  const [formAmount, setFormAmount] = useState("")
  const [formCategory, setFormCategory] = useState("SOFTWARE")
  const [formVendor, setFormVendor] = useState("")
  const [formDate, setFormDate] = useState("")
  const [formNotes, setFormNotes] = useState("")
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState("")

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formDesc || !formAmount) { setFormError("Description and Amount are required"); return }
    try {
      setFormError("")
      setFormLoading(true)
      await apiMutate("/api/expenses", "POST", {
        description: formDesc,
        amount: parseFloat(formAmount),
        category: formCategory,
        vendor: formVendor || null,
        date: formDate || undefined,
        notes: formNotes || null,
      })
      setShowCreate(false)
      setFormDesc(""); setFormAmount(""); setFormCategory("SOFTWARE"); setFormVendor(""); setFormDate(""); setFormNotes("")
      refresh()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to create expense")
    } finally {
      setFormLoading(false)
    }
  }
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
        <form className="space-y-4" onSubmit={handleCreateExpense}>
          {formError && <div className="p-2 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">{formError}</div>}
          <div><label className="label">Description *</label><input type="text" className="input" placeholder="What was this expense for?" value={formDesc} onChange={(e) => setFormDesc(e.target.value)} required /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="label">Amount (USD) *</label><input type="number" className="input" step="0.01" min="0" value={formAmount} onChange={(e) => setFormAmount(e.target.value)} required /></div>
            <div><label className="label">Category</label>
              <select className="input" value={formCategory} onChange={(e) => setFormCategory(e.target.value)}>
                <option value="SOFTWARE">Software</option><option value="HARDWARE">Hardware</option><option value="OFFICE">Office</option>
                <option value="TRAVEL">Travel</option><option value="MARKETING">Marketing</option><option value="SALARY">Salary</option>
                <option value="CONTRACTOR">Contractor</option><option value="UTILITIES">Utilities</option><option value="INSURANCE">Insurance</option>
                <option value="TAX">Tax</option><option value="OTHER">Other</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="label">Vendor</label><input type="text" className="input" placeholder="Company name" value={formVendor} onChange={(e) => setFormVendor(e.target.value)} /></div>
            <div><label className="label">Date</label><input type="date" className="input" value={formDate} onChange={(e) => setFormDate(e.target.value)} /></div>
          </div>
          <div><label className="label">Notes</label><textarea className="input" rows={2} placeholder="Additional notes..." value={formNotes} onChange={(e) => setFormNotes(e.target.value)} /></div>
          <div className="flex justify-end gap-2 pt-3 border-t border-surface-200">
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={formLoading} className="btn-primary">{formLoading ? "Saving..." : "Add Expense"}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
