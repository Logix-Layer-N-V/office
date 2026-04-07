"use client"

import { useState } from "react"
import { Header } from "@/components/dashboard/header"
import { useApi, apiMutate } from "@/hooks/use-api"
import type { Vendor } from "@/types"
import { formatDate } from "@/lib/utils"
import { ListToolbar, applyFilters, type ActiveFilter } from "@/components/ui/list-toolbar"
import { StatCard } from "@/components/ui/stat-card"
import { Building2, Pencil, Trash2, X, CheckCircle2, XCircle, Globe, Mail, Phone } from "lucide-react"

export default function VendorsPage() {
  const { data: vendors, loading, refresh } = useApi<Vendor[]>("/api/vendors", [])
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null)
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState<ActiveFilter[]>([])
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", address: "", taxId: "", website: "", notes: "" })

  if (loading) {
    return (
      <div>
        <Header title="Vendors" subtitle="Manage your vendors and suppliers" action={{ label: "Add Vendor", onClick: () => setShowCreate(true) }} />
        <div className="flex items-center justify-center p-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      </div>
    )
  }

  const activeVendors = vendors.filter(v => v.isActive)
  const filtered = applyFilters(
    vendors as unknown as Record<string, unknown>[],
    search,
    filters,
    ["name", "email", "company", "phone"]
  ) as unknown as Vendor[]

  const openCreate = () => {
    setForm({ name: "", email: "", phone: "", company: "", address: "", taxId: "", website: "", notes: "" })
    setShowCreate(true)
  }

  const openEdit = (v: Vendor) => {
    setEditingVendor(v)
    setForm({
      name: v.name,
      email: v.email || "",
      phone: v.phone || "",
      company: v.company || "",
      address: v.address || "",
      taxId: v.taxId || "",
      website: v.website || "",
      notes: v.notes || "",
    })
    setShowEdit(true)
  }

  const saveCreate = async () => {
    if (!form.name.trim()) return
    await apiMutate("/api/vendors", "POST", form)
    setShowCreate(false)
    refresh()
  }

  const saveEdit = async () => {
    if (!editingVendor || !form.name.trim()) return
    await apiMutate(`/api/vendors/${editingVendor.id}`, "PUT", form)
    setShowEdit(false)
    setEditingVendor(null)
    refresh()
  }

  const deleteVendor = async (id: string) => {
    await apiMutate(`/api/vendors/${id}`, "DELETE", {})
    refresh()
  }

  const toggleActive = async (v: Vendor) => {
    await apiMutate(`/api/vendors/${v.id}`, "PUT", { isActive: !v.isActive })
    refresh()
  }

  return (
    <div>
      <Header title="Vendors" subtitle="Manage your vendors and suppliers" action={{ label: "Add Vendor", onClick: openCreate }} />

      <div className="p-4 md:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatCard title="Total Vendors" value={String(vendors.length)} icon={Building2} iconColor="text-brand-600" />
          <StatCard title="Active" value={String(activeVendors.length)} icon={CheckCircle2} iconColor="text-emerald-600" />
          <StatCard title="Inactive" value={String(vendors.length - activeVendors.length)} icon={XCircle} iconColor="text-surface-400" />
        </div>

        <div className="card p-4">
          <ListToolbar
            storageKey="vendors"
            searchPlaceholder="Search vendors..."
            filterOptions={[
              { key: "isActive", label: "Status", type: "select", options: [{ value: "true", label: "Active" }, { value: "false", label: "Inactive" }] },
            ]}
            onChange={(s, f) => { setSearch(s); setFilters(f) }}
          />
        </div>

        <div className="card">
          <div className="overflow-x-auto">
            <table className="table-compact">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Company</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th className="w-20">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-8 text-surface-400 text-sm">No vendors found</td></tr>
                ) : (
                  filtered.map((v) => (
                    <tr key={v.id} className="group">
                      <td className="font-medium text-surface-800">
                        <div className="flex items-center gap-2">
                          {v.name}
                          {v.website && (
                            <a href={v.website.startsWith("http") ? v.website : `https://${v.website}`} target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:text-brand-700">
                              <Globe className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td>{v.company || "-"}</td>
                      <td>
                        {v.email ? (
                          <span className="flex items-center gap-1 text-surface-600">
                            <Mail className="h-3 w-3" /> {v.email}
                          </span>
                        ) : "-"}
                      </td>
                      <td>
                        {v.phone ? (
                          <span className="flex items-center gap-1 text-surface-600">
                            <Phone className="h-3 w-3" /> {v.phone}
                          </span>
                        ) : "-"}
                      </td>
                      <td>
                        <button onClick={() => toggleActive(v)} className={`text-2xs font-medium px-2 py-0.5 rounded-full ${v.isActive ? "bg-emerald-50 text-emerald-700" : "bg-surface-100 text-surface-500"}`}>
                          {v.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td>{formatDate(v.createdAt)}</td>
                      <td>
                        <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(v)} className="rounded p-1 hover:bg-surface-100" title="Edit">
                            <Pencil className="h-3.5 w-3.5 text-surface-500" />
                          </button>
                          <button onClick={() => deleteVendor(v.id)} className="rounded p-1 hover:bg-red-50" title="Delete">
                            <Trash2 className="h-3.5 w-3.5 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Vendor Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-4 border-b border-surface-200">
              <h2 className="text-sm font-semibold text-surface-900">Add Vendor</h2>
              <button onClick={() => setShowCreate(false)} className="text-surface-400 hover:text-surface-600"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="label">Name *</label>
                <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Vendor name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Email</label><input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" /></div>
                <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 234 567 890" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Company</label><input className="input" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company name" /></div>
                <div><label className="label">Website</label><input className="input" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://..." /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Address</label><input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Street, City" /></div>
                <div><label className="label">Tax ID</label><input className="input" value={form.taxId} onChange={(e) => setForm({ ...form, taxId: e.target.value })} placeholder="Tax identifier" /></div>
              </div>
              <div><label className="label">Notes</label><textarea className="input" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes..." /></div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-surface-200">
              <button onClick={() => setShowCreate(false)} className="btn-secondary text-sm">Cancel</button>
              <button onClick={saveCreate} className="btn-primary text-sm">Add Vendor</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Vendor Modal */}
      {showEdit && editingVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-4 border-b border-surface-200">
              <h2 className="text-sm font-semibold text-surface-900">Edit Vendor — {editingVendor.name}</h2>
              <button onClick={() => setShowEdit(false)} className="text-surface-400 hover:text-surface-600"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="label">Name *</label>
                <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Email</label><input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Company</label><input className="input" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
                <div><label className="label">Website</label><input className="input" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Address</label><input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
                <div><label className="label">Tax ID</label><input className="input" value={form.taxId} onChange={(e) => setForm({ ...form, taxId: e.target.value })} /></div>
              </div>
              <div><label className="label">Notes</label><textarea className="input" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-surface-200">
              <button onClick={() => setShowEdit(false)} className="btn-secondary text-sm">Cancel</button>
              <button onClick={saveEdit} className="btn-primary text-sm">Save Vendor</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
