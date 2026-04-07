"use client"

import { useState } from "react"
import { Header } from "@/components/dashboard/header"
import { useApi, apiMutate } from "@/hooks/use-api"
import type { ExpenseCategoryRecord } from "@/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ListToolbar, applyFilters, type ActiveFilter } from "@/components/ui/list-toolbar"
import { StatCard } from "@/components/ui/stat-card"
import { Tags, Pencil, Trash2, X, CheckCircle2, XCircle } from "lucide-react"

const PRESET_COLORS = [
  "#EF4444", "#F97316", "#F59E0B", "#22C55E", "#14B8A6",
  "#3B82F6", "#6366F1", "#8B5CF6", "#EC4899", "#6B7280",
]

export default function ExpenseCategoriesPage() {
  const { data: categories, loading, refresh } = useApi<ExpenseCategoryRecord[]>("/api/expense-categories", [])
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [editingCat, setEditingCat] = useState<ExpenseCategoryRecord | null>(null)
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState<ActiveFilter[]>([])
  const [form, setForm] = useState({ name: "", description: "", color: "#3B82F6", budget: "" })

  if (loading) {
    return (
      <div>
        <Header title="Expense Categories" subtitle="Organize and track expense categories" action={{ label: "Add Category", onClick: () => setShowCreate(true) }} />
        <div className="flex items-center justify-center p-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      </div>
    )
  }

  const activeCategories = categories.filter(c => c.isActive)
  const totalBudget = categories.reduce((s, c) => s + (parseFloat(String(c.budget)) || 0), 0)
  const filtered = applyFilters(
    categories as unknown as Record<string, unknown>[],
    search,
    filters,
    ["name", "description"]
  ) as unknown as ExpenseCategoryRecord[]

  const openCreate = () => {
    setForm({ name: "", description: "", color: "#3B82F6", budget: "" })
    setShowCreate(true)
  }

  const openEdit = (c: ExpenseCategoryRecord) => {
    setEditingCat(c)
    setForm({
      name: c.name,
      description: c.description || "",
      color: c.color,
      budget: c.budget ? String(c.budget) : "",
    })
    setShowEdit(true)
  }

  const saveCreate = async () => {
    if (!form.name.trim()) return
    await apiMutate("/api/expense-categories", "POST", {
      ...form,
      budget: form.budget ? parseFloat(form.budget) : null,
    })
    setShowCreate(false)
    refresh()
  }

  const saveEdit = async () => {
    if (!editingCat || !form.name.trim()) return
    await apiMutate(`/api/expense-categories/${editingCat.id}`, "PUT", {
      ...form,
      budget: form.budget ? parseFloat(form.budget) : null,
    })
    setShowEdit(false)
    setEditingCat(null)
    refresh()
  }

  const deleteCat = async (id: string) => {
    await apiMutate(`/api/expense-categories/${id}`, "DELETE", {})
    refresh()
  }

  const toggleActive = async (c: ExpenseCategoryRecord) => {
    await apiMutate(`/api/expense-categories/${c.id}`, "PUT", { isActive: !c.isActive })
    refresh()
  }

  const formModal = (title: string, onSave: () => void, onClose: () => void) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b border-surface-200">
          <h2 className="text-sm font-semibold text-surface-900">{title}</h2>
          <button onClick={onClose} className="text-surface-400 hover:text-surface-600"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="label">Name *</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Category name" />
          </div>
          <div>
            <label className="label">Description</label>
            <input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What this category covers" />
          </div>
          <div>
            <label className="label">Monthly Budget</label>
            <input className="input" type="number" step="0.01" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="0.00" />
          </div>
          <div>
            <label className="label">Color</label>
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setForm({ ...form, color: c })}
                  className={`h-7 w-7 rounded-full border-2 transition-all ${form.color === c ? "border-surface-800 scale-110" : "border-transparent"}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 p-4 border-t border-surface-200">
          <button onClick={onClose} className="btn-secondary text-sm">Cancel</button>
          <button onClick={onSave} className="btn-primary text-sm">Save</button>
        </div>
      </div>
    </div>
  )

  return (
    <div>
      <Header title="Expense Categories" subtitle="Organize and track expense categories" action={{ label: "Add Category", onClick: openCreate }} />

      <div className="p-4 md:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatCard title="Total Categories" value={String(categories.length)} icon={Tags} iconColor="text-brand-600" />
          <StatCard title="Active" value={String(activeCategories.length)} icon={CheckCircle2} iconColor="text-emerald-600" />
          <StatCard title="Total Budget" value={formatCurrency(totalBudget)} subtitle="Monthly" icon={Tags} iconColor="text-amber-600" />
        </div>

        <div className="card p-4">
          <ListToolbar
            storageKey="expense-categories"
            searchPlaceholder="Search categories..."
            filterOptions={[
              { key: "isActive", label: "Status", type: "select", options: [{ value: "true", label: "Active" }, { value: "false", label: "Inactive" }] },
            ]}
            onChange={(s, f) => { setSearch(s); setFilters(f) }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center py-12 text-surface-400 text-sm">No categories found</div>
          ) : (
            filtered.map((cat) => (
              <div key={cat.id} className="card p-4 group relative">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: cat.color + "20" }}>
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-surface-800 truncate">{cat.name}</h3>
                      <button onClick={() => toggleActive(cat)} className={`text-2xs font-medium px-1.5 py-0.5 rounded-full ${cat.isActive ? "bg-emerald-50 text-emerald-700" : "bg-surface-100 text-surface-500"}`}>
                        {cat.isActive ? "Active" : "Inactive"}
                      </button>
                    </div>
                    {cat.description && <p className="text-2xs text-surface-500 mt-0.5 truncate">{cat.description}</p>}
                    {cat.budget && (
                      <p className="text-xs font-medium text-surface-700 mt-1.5">
                        Budget: {formatCurrency(parseFloat(String(cat.budget)))}
                        <span className="text-2xs text-surface-400"> / month</span>
                      </p>
                    )}
                  </div>
                </div>
                <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(cat)} className="rounded p-1 hover:bg-surface-100" title="Edit">
                    <Pencil className="h-3.5 w-3.5 text-surface-500" />
                  </button>
                  <button onClick={() => deleteCat(cat.id)} className="rounded p-1 hover:bg-red-50" title="Delete">
                    <Trash2 className="h-3.5 w-3.5 text-red-400" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showCreate && formModal("Add Category", saveCreate, () => setShowCreate(false))}
      {showEdit && editingCat && formModal(`Edit — ${editingCat.name}`, saveEdit, () => setShowEdit(false))}
    </div>
  )
}
