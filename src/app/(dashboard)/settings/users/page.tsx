"use client"

import { useState } from "react"
import { Header } from "@/components/dashboard/header"
import { Modal } from "@/components/ui/modal"
import { useApi, apiMutate } from "@/hooks/use-api"
import type { Member, MemberRole } from "@/types"
import { formatDate } from "@/lib/utils"
import {
  Users, Shield as ShieldIcon, Lock, Eye,
  Edit2, Trash2, Plus, Check, Save, X,
  UserCog, Copy,
} from "lucide-react"

// ─── Types ─────────────────────────────────────────
interface CustomRole {
  key: string            // uppercase slug e.g. "ACCOUNTANT"
  label: string          // display name
  color: { bg: string; text: string }
  isDefault: boolean     // can't delete default roles
  permissions: string[]
}

// ─── Permission categories ─────────────────────────
const PERMISSION_CATEGORIES = [
  { name: "Team Management", permissions: [
    { key: "manage_members", label: "Manage team members" },
    { key: "invite_members", label: "Invite new members" },
    { key: "remove_members", label: "Remove team members" },
    { key: "change_roles", label: "Change member roles" },
  ]},
  { name: "Records & Data", permissions: [
    { key: "create_records", label: "Create records" },
    { key: "edit_own_records", label: "Edit own records" },
    { key: "edit_all_records", label: "Edit all records" },
    { key: "delete_records", label: "Delete records" },
    { key: "view_all_records", label: "View all records" },
    { key: "export_data", label: "Export data" },
  ]},
  { name: "Finance", permissions: [
    { key: "create_invoices", label: "Create invoices" },
    { key: "approve_invoices", label: "Approve invoices" },
    { key: "manage_payments", label: "Manage payments" },
    { key: "view_reports", label: "View reports & analytics" },
    { key: "manage_bank_accounts", label: "Manage bank accounts" },
    { key: "view_ledger", label: "View general ledger" },
  ]},
  { name: "Projects & Work", permissions: [
    { key: "create_projects", label: "Create projects" },
    { key: "manage_projects", label: "Manage all projects" },
    { key: "submit_work_orders", label: "Submit work orders" },
    { key: "approve_work_orders", label: "Approve work orders" },
    { key: "manage_tasks", label: "Manage tasks" },
  ]},
  { name: "Organization", permissions: [
    { key: "configure_settings", label: "Configure settings" },
    { key: "manage_billing", label: "Manage billing & subscription" },
    { key: "manage_api_keys", label: "Manage API keys" },
    { key: "delete_organization", label: "Delete organization" },
  ]},
]

const ALL_PERM_KEYS = PERMISSION_CATEGORIES.flatMap((c) => c.permissions.map((p) => p.key))

// ─── Available colors for roles ────────────────────
const ROLE_COLOR_OPTIONS = [
  { label: "Brand", bg: "bg-brand-50", text: "text-brand-700", dot: "bg-brand-500" },
  { label: "Blue", bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  { label: "Green", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  { label: "Red", bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  { label: "Orange", bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-500" },
  { label: "Amber", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  { label: "Teal", bg: "bg-teal-50", text: "text-teal-700", dot: "bg-teal-500" },
  { label: "Cyan", bg: "bg-cyan-50", text: "text-cyan-700", dot: "bg-cyan-500" },
  { label: "Purple", bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-500" },
  { label: "Pink", bg: "bg-pink-50", text: "text-pink-700", dot: "bg-pink-500" },
  { label: "Rose", bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
  { label: "Gray", bg: "bg-surface-100", text: "text-surface-600", dot: "bg-surface-500" },
]

// ─── Default roles ─────────────────────────────────
const DEFAULT_ROLES: CustomRole[] = [
  { key: "OWNER", label: "Owner", color: { bg: "bg-brand-50", text: "text-brand-700" }, isDefault: true, permissions: ALL_PERM_KEYS },
  { key: "ADMIN", label: "Admin", color: { bg: "bg-blue-50", text: "text-blue-700" }, isDefault: true, permissions: ALL_PERM_KEYS.filter((k) => !["delete_organization", "remove_members"].includes(k)) },
  { key: "MEMBER", label: "Member", color: { bg: "bg-emerald-50", text: "text-emerald-700" }, isDefault: true, permissions: ["create_records", "edit_own_records", "view_all_records", "export_data", "create_invoices", "view_reports", "view_ledger", "create_projects", "submit_work_orders", "manage_tasks"] },
  { key: "VIEWER", label: "Viewer", color: { bg: "bg-surface-100", text: "text-surface-600" }, isDefault: true, permissions: ["view_all_records", "export_data", "view_reports", "view_ledger"] },
]

const ROLE_ICONS: Record<string, typeof ShieldIcon> = { OWNER: ShieldIcon, ADMIN: Lock, MEMBER: Users, VIEWER: Eye }

// ─── Component ──────────────────────────────────────
export default function UsersPage() {
  const [usersTab, setUsersTab] = useState<"members" | "roles">("members")

  // Users state
  const { data: members, loading: membersLoading, refresh } = useApi<Member[]>("/api/users", [])
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [deletingMember, setDeletingMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(false)
  const [editPerms, setEditPerms] = useState(false)
  const [formData, setFormData] = useState({ name: "", email: "", role: "MEMBER" as string })

  // ─── Roles state (dynamic) ───────────────────────
  const [roles, setRoles] = useState<CustomRole[]>([...DEFAULT_ROLES])
  const [showAddRole, setShowAddRole] = useState(false)
  const [showEditRole, setShowEditRole] = useState(false)
  const [showDeleteRole, setShowDeleteRole] = useState(false)
  const [editingRole, setEditingRole] = useState<CustomRole | null>(null)
  const [deletingRole, setDeletingRole] = useState<CustomRole | null>(null)
  const [roleForm, setRoleForm] = useState({
    label: "",
    colorIdx: 0,
    copyFrom: "" as string, // role key to copy perms from
  })

  // Build rolePerms from roles array
  const rolePerms: Record<string, string[]> = {}
  roles.forEach(r => { rolePerms[r.key] = r.permissions })

  // Helper: get role color
  const getRoleColor = (key: string) => {
    const role = roles.find(r => r.key === key)
    return role?.color || { bg: "bg-surface-100", text: "text-surface-600" }
  }

  // Helper: get role icon
  const getRoleIcon = (key: string) => ROLE_ICONS[key] || UserCog

  // User CRUD
  const handleSave = async () => {
    if (!formData.name || !formData.email) return
    setLoading(true)
    try {
      if (editingMember) {
        await apiMutate(`/api/users/${editingMember.id}`, "PUT", formData)
        setShowEdit(false)
      } else {
        await apiMutate("/api/users", "POST", { ...formData, organizationId: "org_default" })
        setShowCreate(false)
      }
      refresh()
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleDelete = async () => {
    if (!deletingMember) return
    setLoading(true)
    try { await apiMutate(`/api/users/${deletingMember.id}`, "DELETE"); setShowDelete(false); refresh() }
    catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const togglePerm = (roleKey: string, key: string) => {
    setRoles(prev => prev.map(r =>
      r.key === roleKey
        ? { ...r, permissions: r.permissions.includes(key) ? r.permissions.filter(k => k !== key) : [...r.permissions, key] }
        : r
    ))
  }

  // ─── Role CRUD ───────────────────────────────────
  const handleAddRole = () => {
    if (!roleForm.label.trim()) return
    const key = roleForm.label.trim().toUpperCase().replace(/\s+/g, "_").replace(/[^A-Z0-9_]/g, "")
    if (roles.some(r => r.key === key)) return // duplicate check

    const selectedColor = ROLE_COLOR_OPTIONS[roleForm.colorIdx] || ROLE_COLOR_OPTIONS[0]
    const copyPerms = roleForm.copyFrom ? (roles.find(r => r.key === roleForm.copyFrom)?.permissions || []) : []

    const newRole: CustomRole = {
      key,
      label: roleForm.label.trim(),
      color: { bg: selectedColor.bg, text: selectedColor.text },
      isDefault: false,
      permissions: [...copyPerms],
    }
    setRoles(prev => [...prev, newRole])
    setShowAddRole(false)
    setRoleForm({ label: "", colorIdx: 0, copyFrom: "" })
  }

  const handleEditRole = () => {
    if (!editingRole || !roleForm.label.trim()) return
    const selectedColor = ROLE_COLOR_OPTIONS[roleForm.colorIdx] || ROLE_COLOR_OPTIONS[0]
    setRoles(prev => prev.map(r =>
      r.key === editingRole.key
        ? { ...r, label: roleForm.label.trim(), color: { bg: selectedColor.bg, text: selectedColor.text } }
        : r
    ))
    setShowEditRole(false)
    setEditingRole(null)
  }

  const handleDeleteRole = () => {
    if (!deletingRole || deletingRole.isDefault) return
    setRoles(prev => prev.filter(r => r.key !== deletingRole.key))
    setShowDeleteRole(false)
    setDeletingRole(null)
  }

  const openEditRole = (role: CustomRole) => {
    setEditingRole(role)
    const colorIdx = ROLE_COLOR_OPTIONS.findIndex(c => c.bg === role.color.bg)
    setRoleForm({ label: role.label, colorIdx: colorIdx >= 0 ? colorIdx : 0, copyFrom: "" })
    setShowEditRole(true)
  }

  return (
    <div>
      <Header title="Users & Roles" subtitle="Manage team members and permissions" />

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-48 border-r border-surface-200 bg-white min-h-[calc(100vh-96px)]">
          <div className="p-2 space-y-1">
            <button
              onClick={() => setUsersTab("members")}
              className={`flex items-center gap-2.5 w-full rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                usersTab === "members" ? "bg-brand-50 text-brand-700" : "text-surface-500 hover:bg-surface-50 hover:text-surface-700"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              Team Members
            </button>
            <button
              onClick={() => setUsersTab("roles")}
              className={`flex items-center gap-2.5 w-full rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                usersTab === "roles" ? "bg-brand-50 text-brand-700" : "text-surface-500 hover:bg-surface-50 hover:text-surface-700"
              }`}
            >
              <ShieldIcon className="h-3.5 w-3.5" />
              Role Permissions
            </button>
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 p-6 max-w-4xl">

          {/* ═══ TEAM MEMBERS ═══ */}
          {usersTab === "members" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div><h2 className="text-sm font-semibold text-surface-800 mb-1">Team Members</h2><p className="text-2xs text-surface-400">Manage who has access to your organization.</p></div>
                <button onClick={() => { setFormData({ name: "", email: "", role: "MEMBER" }); setEditingMember(null); setShowCreate(true) }} className="btn-primary text-xs"><Plus className="h-3.5 w-3.5" /> Add Member</button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-5 gap-3">
                <div className="card p-3"><p className="text-2xs text-surface-400">Total</p><p className="text-lg font-semibold text-surface-800">{members.length}</p></div>
                {roles.slice(0, 4).map((role) => (
                  <div key={role.key} className="card p-3"><p className="text-2xs text-surface-400">{role.label}s</p><p className={`text-lg font-semibold ${role.color.text}`}>{members.filter((m) => m.role === role.key).length}</p></div>
                ))}
              </div>

              {/* Table */}
              <div className="card">
                <table className="table-compact">
                  <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th className="w-20 text-right">Actions</th></tr></thead>
                  <tbody>
                    {members.map((m) => (
                      <tr key={m.id} className="hover:bg-surface-50">
                        <td className="font-medium text-surface-800">{m.name}</td>
                        <td className="text-2xs text-surface-500">{m.email}</td>
                        <td><span className={`inline-flex items-center rounded-md px-2 py-1 text-2xs font-medium ${getRoleColor(m.role).bg} ${getRoleColor(m.role).text}`}>{roles.find(r => r.key === m.role)?.label || m.role}</span></td>
                        <td className="text-2xs text-surface-500">{formatDate(m.createdAt)}</td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => { setFormData({ name: m.name, email: m.email, role: m.role }); setEditingMember(m); setShowEdit(true) }} className="rounded p-1 text-surface-400 hover:bg-surface-100 hover:text-brand-600"><Edit2 className="h-3.5 w-3.5" /></button>
                            <button onClick={() => { setDeletingMember(m); setShowDelete(true) }} className="rounded p-1 text-surface-400 hover:bg-surface-100 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {members.length === 0 && <div className="px-4 py-8 text-center"><p className="text-2xs text-surface-400">No team members yet.</p></div>}
              </div>
            </div>
          )}

          {/* ═══ ROLE PERMISSIONS ═══ */}
          {usersTab === "roles" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div><h2 className="text-sm font-semibold text-surface-800 mb-1">Role Permissions</h2><p className="text-2xs text-surface-400">Configure what each role can do. Add custom roles for your organization.</p></div>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setRoleForm({ label: "", colorIdx: 0, copyFrom: "" }); setShowAddRole(true) }} className="btn-secondary text-xs">
                    <Plus className="h-3 w-3" /> Add Role
                  </button>
                  <button onClick={() => setEditPerms(!editPerms)} className={editPerms ? "btn-primary text-xs" : "btn-secondary text-xs"}>
                    {editPerms ? <><Save className="h-3 w-3" /> Save</> : <><Edit2 className="h-3 w-3" /> Configure</>}
                  </button>
                </div>
              </div>

              {/* Role cards overview */}
              <div className="grid grid-cols-4 gap-2">
                {roles.map((role) => {
                  const Icon = getRoleIcon(role.key)
                  return (
                    <div key={role.key} className="card p-3 relative group">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="h-4 w-4 text-surface-500" />
                        <span className={`inline-flex rounded-md px-2 py-0.5 text-2xs font-medium ${role.color.bg} ${role.color.text}`}>{role.label}</span>
                        {role.isDefault && <span className="text-2xs text-surface-300">Default</span>}
                      </div>
                      <p className="text-2xs text-surface-400">{role.permissions.length} / {ALL_PERM_KEYS.length} permissions</p>
                      {!role.isDefault && (
                        <div className="absolute top-2 right-2 hidden group-hover:flex gap-1">
                          <button onClick={() => openEditRole(role)} className="rounded p-1 text-surface-400 hover:bg-surface-100 hover:text-brand-600"><Edit2 className="h-3 w-3" /></button>
                          <button onClick={() => { setDeletingRole(role); setShowDeleteRole(true) }} className="rounded p-1 text-surface-400 hover:bg-surface-100 hover:text-red-600"><Trash2 className="h-3 w-3" /></button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Permission matrix */}
              <div className="card overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-surface-200">
                      <th className="px-4 py-3 text-2xs font-medium text-surface-500 uppercase w-56">Permission</th>
                      {roles.map((role) => {
                        const Icon = getRoleIcon(role.key)
                        return (
                          <th key={role.key} className="px-2 py-3 text-center min-w-[80px]">
                            <div className="flex flex-col items-center gap-1">
                              <Icon className="h-3.5 w-3.5 text-surface-500" />
                              <span className={`inline-flex rounded-md px-1.5 py-0.5 text-2xs font-medium ${role.color.bg} ${role.color.text}`}>{role.label}</span>
                            </div>
                          </th>
                        )
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {PERMISSION_CATEGORIES.map((cat) => (
                      <>
                        <tr key={`cat-${cat.name}`} className="bg-surface-50">
                          <td colSpan={roles.length + 1} className="px-4 py-2 text-xs font-semibold text-surface-700">{cat.name}</td>
                        </tr>
                        {cat.permissions.map((perm) => (
                          <tr key={perm.key} className="border-b border-surface-100">
                            <td className="px-4 py-2 pl-8 text-xs text-surface-600">{perm.label}</td>
                            {roles.map((role) => {
                              const on = role.permissions.includes(perm.key)
                              return (
                                <td key={role.key} className="px-2 py-2 text-center">
                                  {editPerms ? (
                                    <button onClick={() => togglePerm(role.key, perm.key)} className={`inline-flex items-center justify-center h-5 w-5 rounded-md border ${on ? "border-brand-600 bg-brand-600 text-white" : "border-surface-300 bg-white hover:border-brand-400"}`}>
                                      {on && <Check className="h-3 w-3" />}
                                    </button>
                                  ) : (
                                    <span className={on ? "text-emerald-600" : "text-surface-300"}>{on ? <Check className="h-3.5 w-3.5 mx-auto" /> : <X className="h-3 w-3 mx-auto" />}</span>
                                  )}
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Member Modals ─── */}
      {[
        { open: showCreate, onClose: () => setShowCreate(false), title: "Add Team Member" },
        { open: showEdit, onClose: () => setShowEdit(false), title: "Edit Team Member" },
      ].map(({ open, onClose, title }) => (
        <Modal key={title} open={open} onClose={onClose} title={title} size="md">
          <form onSubmit={(e) => { e.preventDefault(); handleSave() }} className="space-y-4">
            <div><label className="label">Name</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input" required /></div>
            <div><label className="label">Email</label><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input" required /></div>
            <div>
              <label className="label">Role</label>
              <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="input">
                {roles.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
              </select>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary">{loading ? "Saving..." : title.includes("Add") ? "Add Member" : "Save"}</button>
            </div>
          </form>
        </Modal>
      ))}

      <Modal open={showDelete} onClose={() => setShowDelete(false)} title="Delete Team Member" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-surface-600">Remove <strong>{deletingMember?.name}</strong> from the team?</p>
          <div className="flex gap-2 justify-end pt-2"><button onClick={() => setShowDelete(false)} className="btn-secondary">Cancel</button><button onClick={handleDelete} disabled={loading} className="btn-primary bg-red-600 hover:bg-red-700">{loading ? "Deleting..." : "Delete"}</button></div>
        </div>
      </Modal>

      {/* ─── Add Role Modal ─── */}
      <Modal open={showAddRole} onClose={() => setShowAddRole(false)} title="Add Custom Role" size="md">
        <form onSubmit={(e) => { e.preventDefault(); handleAddRole() }} className="space-y-4">
          <div>
            <label className="label">Role Name</label>
            <input type="text" value={roleForm.label} onChange={(e) => setRoleForm({ ...roleForm, label: e.target.value })} className="input" placeholder="e.g. Accountant, Manager, Intern" required />
            {roleForm.label && (
              <p className="text-2xs text-surface-400 mt-1">Key: <span className="font-mono">{roleForm.label.trim().toUpperCase().replace(/\s+/g, "_").replace(/[^A-Z0-9_]/g, "")}</span></p>
            )}
          </div>

          <div>
            <label className="label mb-1.5">Color</label>
            <div className="flex flex-wrap gap-2">
              {ROLE_COLOR_OPTIONS.map((c, i) => (
                <button key={i} type="button" onClick={() => setRoleForm({ ...roleForm, colorIdx: i })}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-2xs font-medium border-2 transition-all ${c.bg} ${c.text} ${roleForm.colorIdx === i ? "border-surface-800 ring-1 ring-surface-300" : "border-transparent opacity-70 hover:opacity-100"}`}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Copy Permissions From</label>
            <select value={roleForm.copyFrom} onChange={(e) => setRoleForm({ ...roleForm, copyFrom: e.target.value })} className="input">
              <option value="">Start with no permissions</option>
              {roles.map(r => <option key={r.key} value={r.key}>{r.label} ({r.permissions.length} permissions)</option>)}
            </select>
            <p className="text-2xs text-surface-400 mt-1">You can fine-tune permissions after creating the role.</p>
          </div>

          {/* Preview */}
          <div className="p-3 rounded-lg bg-surface-50 border border-surface-200">
            <p className="text-2xs text-surface-500 mb-1.5">Preview</p>
            <div className="flex items-center gap-2">
              <UserCog className="h-4 w-4 text-surface-500" />
              <span className={`inline-flex rounded-md px-2 py-0.5 text-2xs font-medium ${ROLE_COLOR_OPTIONS[roleForm.colorIdx]?.bg} ${ROLE_COLOR_OPTIONS[roleForm.colorIdx]?.text}`}>
                {roleForm.label || "Role Name"}
              </span>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={() => setShowAddRole(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={!roleForm.label.trim()}>
              <Plus className="h-3 w-3" /> Create Role
            </button>
          </div>
        </form>
      </Modal>

      {/* ─── Edit Role Modal ─── */}
      <Modal open={showEditRole} onClose={() => setShowEditRole(false)} title={`Edit Role: ${editingRole?.label}`} size="md">
        <form onSubmit={(e) => { e.preventDefault(); handleEditRole() }} className="space-y-4">
          <div>
            <label className="label">Role Name</label>
            <input type="text" value={roleForm.label} onChange={(e) => setRoleForm({ ...roleForm, label: e.target.value })} className="input" required />
          </div>
          <div>
            <label className="label mb-1.5">Color</label>
            <div className="flex flex-wrap gap-2">
              {ROLE_COLOR_OPTIONS.map((c, i) => (
                <button key={i} type="button" onClick={() => setRoleForm({ ...roleForm, colorIdx: i })}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-2xs font-medium border-2 transition-all ${c.bg} ${c.text} ${roleForm.colorIdx === i ? "border-surface-800 ring-1 ring-surface-300" : "border-transparent opacity-70 hover:opacity-100"}`}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={() => setShowEditRole(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save Changes</button>
          </div>
        </form>
      </Modal>

      {/* ─── Delete Role Modal ─── */}
      <Modal open={showDeleteRole} onClose={() => setShowDeleteRole(false)} title="Delete Role" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-surface-600">Delete the <strong>{deletingRole?.label}</strong> role? Members with this role will need to be reassigned.</p>
          <div className="flex gap-2 justify-end pt-2">
            <button onClick={() => setShowDeleteRole(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleDeleteRole} className="btn-primary bg-red-600 hover:bg-red-700">Delete Role</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
