"use client"

import { useState } from "react"
import { Header } from "@/components/dashboard/header"
import { Modal } from "@/components/ui/modal"
import { useApi, apiMutate } from "@/hooks/use-api"
import type { Item } from "@/types"
import { formatCurrency } from "@/lib/utils"
import { Wrench, Package, Cloud, Cpu, ToggleLeft, ToggleRight, Pencil, Trash2, X, Check, Plus } from "lucide-react"

type ItemType = "SERVICE" | "PRODUCT" | "API_COST" | "AI_TOKEN"

const typeConfig: Record<ItemType, { label: string; color: string; icon: typeof Wrench }> = {
  SERVICE: { label: "Service", color: "text-brand-600 bg-brand-50", icon: Wrench },
  PRODUCT: { label: "Product", color: "text-purple-600 bg-purple-50", icon: Package },
  API_COST: { label: "API Cost", color: "text-amber-600 bg-amber-50", icon: Cloud },
  AI_TOKEN: { label: "AI Token", color: "text-emerald-600 bg-emerald-50", icon: Cpu },
}

type ItemData = Item

export default function ItemsPage() {
  const { data: items, loading, refresh } = useApi<ItemData[]>("/api/items", [])
  const [filter, setFilter] = useState<ItemType | "ALL">("ALL")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<ItemData>>({})
  const [showCreate, setShowCreate] = useState(false)
  const [newItem, setNewItem] = useState({ name: "", type: "SERVICE" as ItemType, description: "", unit: "hour", rate: 65, isActive: true })

  if (loading) {
    return (
      <div>
        <Header title="Items" subtitle="Products, services, API costs & AI token pricing" action={{ label: "Add Item", onClick: () => setShowCreate(true) }} />
        <div className="flex items-center justify-center p-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      </div>
    )
  }

  const filtered = filter === "ALL" ? items : items.filter(i => i.type === filter)

  const startEdit = (item: ItemData) => {
    setEditingId(item.id)
    setEditValues({ name: item.name, description: item.description, rate: item.rate, unit: item.unit, type: item.type })
  }

  const cancelEdit = () => { setEditingId(null); setEditValues({}) }

  const saveEdit = async (id: string) => {
    await apiMutate(`/api/items/${id}`, "PUT", editValues)
    setEditingId(null)
    setEditValues({})
    refresh()
  }

  const toggleActive = async (id: string) => {
    const item = items.find(i => i.id === id)
    if (item) {
      await apiMutate(`/api/items/${id}`, "PUT", { isActive: !item.isActive })
      refresh()
    }
  }

  const deleteItem = async (id: string) => {
    await apiMutate(`/api/items/${id}`, "DELETE", {})
    refresh()
  }

  const createItem = async () => {
    await apiMutate("/api/items", "POST", newItem)
    setNewItem({ name: "", type: "SERVICE", description: "", unit: "hour", rate: 65, isActive: true })
    setShowCreate(false)
    refresh()
  }

  return (
    <div>
      <Header title="Items" subtitle="Products, services, API costs & AI token pricing" action={{ label: "Add Item", onClick: () => setShowCreate(true) }} />

      <div className="p-6 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="card p-3">
            <p className="text-2xs text-surface-400">Services</p>
            <p className="text-lg font-semibold text-brand-600">{items.filter(i => i.type === "SERVICE").length}</p>
            <p className="text-2xs text-surface-400">Avg. {formatCurrency(items.filter(i => i.type === "SERVICE").reduce((s, i) => s + Number(i.rate), 0) / (items.filter(i => i.type === "SERVICE").length || 1))}/hr</p>
          </div>
          <div className="card p-3">
            <p className="text-2xs text-surface-400">Products</p>
            <p className="text-lg font-semibold text-purple-600">{items.filter(i => i.type === "PRODUCT").length}</p>
          </div>
          <div className="card p-3">
            <p className="text-2xs text-surface-400">API Costs</p>
            <p className="text-lg font-semibold text-amber-600">{items.filter(i => i.type === "API_COST").length}</p>
          </div>
          <div className="card p-3">
            <p className="text-2xs text-surface-400">AI Tokens</p>
            <p className="text-lg font-semibold text-emerald-600">{items.filter(i => i.type === "AI_TOKEN").length}</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1">
          {(["ALL", "SERVICE", "PRODUCT", "API_COST", "AI_TOKEN"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`rounded-md px-2.5 py-1 text-2xs font-medium ${filter === f ? "bg-surface-100 text-surface-700" : "text-surface-400 hover:text-surface-600"}`}>
              {f === "ALL" ? "All Items" : typeConfig[f as ItemType]?.label || f}
            </button>
          ))}
        </div>

        {/* Items list — inline editable */}
        <div className="card divide-y divide-surface-100">
          {filtered.map((item) => {
            const cfg = typeConfig[item.type]
            const Icon = cfg.icon
            const isEditing = editingId === item.id

            if (isEditing) {
              return (
                <div key={item.id} className="px-4 py-3 bg-brand-50/30 space-y-3">
                  <div className="grid grid-cols-4 gap-3">
                    <div className="col-span-2">
                      <label className="label">Name</label>
                      <input type="text" className="input" value={editValues.name || ""} onChange={e => setEditValues(v => ({ ...v, name: e.target.value }))} />
                    </div>
                    <div>
                      <label className="label">Type</label>
                      <select className="input" value={editValues.type || "SERVICE"} onChange={e => setEditValues(v => ({ ...v, type: e.target.value as ItemType }))}>
                        <option value="SERVICE">Service</option>
                        <option value="PRODUCT">Product</option>
                        <option value="API_COST">API Cost</option>
                        <option value="AI_TOKEN">AI Token</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Unit</label>
                      <select className="input" value={editValues.unit || "hour"} onChange={e => setEditValues(v => ({ ...v, unit: e.target.value }))}>
                        <option>hour</option><option>license</option><option>month</option><option>transaction</option><option>1M tokens</option><option>unit</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="col-span-3">
                      <label className="label">Description</label>
                      <input type="text" className="input" value={editValues.description || ""} onChange={e => setEditValues(v => ({ ...v, description: e.target.value }))} />
                    </div>
                    <div>
                      <label className="label">Rate (USD)</label>
                      <input type="number" step="0.01" className="input" value={editValues.rate ?? 0} onChange={e => setEditValues(v => ({ ...v, rate: parseFloat(e.target.value) || 0 }))} />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={cancelEdit} className="btn-ghost text-2xs"><X className="h-3 w-3" /> Cancel</button>
                    <button onClick={() => saveEdit(item.id)} className="btn-primary text-2xs"><Check className="h-3 w-3" /> Save</button>
                  </div>
                </div>
              )
            }

            return (
              <div key={item.id} className={`flex items-center justify-between px-4 py-3 hover:bg-surface-50 group ${!item.isActive ? "opacity-50" : ""}`}>
                <div className="flex items-center gap-3">
                  <div className={`rounded-md p-1.5 ${cfg.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-surface-800">{item.name}</p>
                      <span className={`badge ${cfg.color}`}>{cfg.label}</span>
                      {!item.isActive && <span className="badge text-surface-400 bg-surface-100">Inactive</span>}
                    </div>
                    <p className="text-2xs text-surface-400">{item.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-surface-800">{formatCurrency(Number(item.rate))}</p>
                    <p className="text-2xs text-surface-400">per {item.unit}</p>
                  </div>
                  {/* Action buttons — visible on hover */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEdit(item)} className="rounded p-1 hover:bg-surface-100" title="Edit">
                      <Pencil className="h-3.5 w-3.5 text-surface-500" />
                    </button>
                    <button onClick={() => deleteItem(item.id)} className="rounded p-1 hover:bg-red-50" title="Delete">
                      <Trash2 className="h-3.5 w-3.5 text-red-400" />
                    </button>
                  </div>
                  <button onClick={() => toggleActive(item.id)} title={item.isActive ? "Deactivate" : "Activate"}>
                    {item.isActive ? (
                      <ToggleRight className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <ToggleLeft className="h-5 w-5 text-surface-300" />
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Create Item Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Add Item">
        <form className="space-y-4" onSubmit={e => { e.preventDefault(); createItem() }}>
          <div><label className="label">Item Name</label><input type="text" className="input" placeholder="e.g. Web Development" value={newItem.name} onChange={e => setNewItem(v => ({ ...v, name: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Type</label>
              <select className="input" value={newItem.type} onChange={e => setNewItem(v => ({ ...v, type: e.target.value as ItemType }))}>
                <option value="SERVICE">Service</option>
                <option value="PRODUCT">Product</option>
                <option value="API_COST">API Cost</option>
                <option value="AI_TOKEN">AI Token Cost</option>
              </select>
            </div>
            <div><label className="label">Unit</label>
              <select className="input" value={newItem.unit} onChange={e => setNewItem(v => ({ ...v, unit: e.target.value }))}>
                <option>hour</option><option>license</option><option>month</option><option>transaction</option><option>1M tokens</option><option>unit</option>
              </select>
            </div>
          </div>
          <div><label className="label">Rate (USD)</label><input type="number" className="input" step="0.01" value={newItem.rate} onChange={e => setNewItem(v => ({ ...v, rate: parseFloat(e.target.value) || 0 }))} /></div>
          <div><label className="label">Description</label><textarea className="input" rows={2} placeholder="What does this item cover?" value={newItem.description} onChange={e => setNewItem(v => ({ ...v, description: e.target.value }))} /></div>
          <div className="flex justify-end gap-2 pt-3 border-t border-surface-200">
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary"><Plus className="h-3.5 w-3.5" /> Add Item</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
