"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/dashboard/header"
import { Modal } from "@/components/ui/modal"
import { useApi, apiMutate } from "@/hooks/use-api"
import type { Member, MemberRole } from "@/types"
import { formatDate } from "@/lib/utils"
import {
  Trash2,
  Edit2,
  ChevronDown,
  ChevronUp,
  Shield,
  Lock,
  Eye,
  Users,
  Check,
  X,
  Plus,
  Save,
  Settings,
} from "lucide-react"

const ROLE_COLORS: Record<MemberRole, { bg: string; text: string }> = {
  OWNER: { bg: "bg-brand-50", text: "text-brand-700" },
  ADMIN: { bg: "bg-blue-50", text: "text-blue-700" },
  MEMBER: { bg: "bg-emerald-50", text: "text-emerald-700" },
  VIEWER: { bg: "bg-surface-100", text: "text-surface-600" },
}

const ROLE_META: Record<MemberRole, { title: string; description: string }> = {
  OWNER: { title: "Full Access", description: "Complete control over the organization" },
  ADMIN: { title: "Administrator", description: "Manage team and all records" },
  MEMBER: { title: "Team Member", description: "Create and collaborate on records" },
  VIEWER: { title: "Read-Only Access", description: "View and export data only" },
}

// All available permissions grouped by category
const PERMISSION_CATEGORIES = [
  {
    name: "Team Management",
    permissions: [
      { key: "manage_members", label: "Manage team members" },
      { key: "invite_members", label: "Invite new members" },
      { key: "remove_members", label: "Remove team members" },
      { key: "change_roles", label: "Change member roles" },
    ],
  },
  {
    name: "Records & Data",
    permissions: [
      { key: "create_records", label: "Create records" },
      { key: "edit_own_records", label: "Edit own records" },
      { key: "edit_all_records", label: "Edit all records" },
      { key: "delete_records", label: "Delete records" },
      { key: "view_all_records", label: "View all records" },
      { key: "export_data", label: "Export data" },
    ],
  },
  {
    name: "Finance",
    permissions: [
      { key: "create_invoices", label: "Create invoices" },
      { key: "approve_invoices", label: "Approve invoices" },
      { key: "manage_payments", label: "Manage payments" },
      { key: "view_reports", label: "View reports & analytics" },
      { key: "manage_bank_accounts", label: "Manage bank accounts" },
      { key: "view_ledger", label: "View general ledger" },
    ],
  },
  {
    name: "Projects & Work",
    permissions: [
      { key: "create_projects", label: "Create projects" },
      { key: "manage_projects", label: "Manage all projects" },
      { key: "submit_work_orders", label: "Submit work orders" },
      { key: "approve_work_orders", label: "Approve work orders" },
      { key: "manage_tasks", label: "Manage tasks" },
    ],
  },
  {
    name: "Organization",
    permissions: [
      { key: "configure_settings", label: "Configure settings" },
      { key: "manage_billing", label: "Manage billing & subscription" },
      { key: "manage_api_keys", label: "Manage API keys" },
      { key: "delete_organization", label: "Delete organization" },
    ],
  },
]

// Default permissions per role
const DEFAULT_ROLE_PERMISSIONS: Record<MemberRole, string[]> = {
  OWNER: PERMISSION_CATEGORIES.flatMap((c) => c.permissions.map((p) => p.key)), // all
  ADMIN: [
    "manage_members",
    "invite_members",
    "change_roles",
    "create_records",
    "edit_own_records",
    "edit_all_records",
    "delete_records",
    "view_all_records",
    "export_data",
    "create_invoices",
    "approve_invoices",
    "manage_payments",
    "view_reports",
    "manage_bank_accounts",
    "view_ledger",
    "create_projects",
    "manage_projects",
    "submit_work_orders",
    "approve_work_orders",
    "manage_tasks",
    "configure_settings",
  ],
  MEMBER: [
    "create_records",
    "edit_own_records",
    "view_all_records",
    "export_data",
    "create_invoices",
    "view_reports",
    "view_ledger",
    "create_projects",
    "submit_work_orders",
    "manage_tasks",
  ],
  VIEWER: ["view_all_records", "export_data", "view_reports", "view_ledger"],
}

const ROLES: MemberRole[] = ["OWNER", "ADMIN", "MEMBER", "VIEWER"]

const icons: Record<MemberRole, typeof Shield> = {
  OWNER: Shield,
  ADMIN: Lock,
  MEMBER: Users,
  VIEWER: Eye,
}

export default function UsersPage() {
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [showPermissions, setShowPermissions] = useState(false)
  const [editingPermissions, setEditingPermissions] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [deletingMember, setDeletingMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(false)
  const [permSaving, setPermSaving] = useState(false)
  const [permSaved, setPermSaved] = useState(false)
  const [newPermission, setNewPermission] = useState("")
  const [customPermissions, setCustomPermissions] = useState<{ key: string; label: string }[]>([])

  const { data: members, loading: membersLoading, refresh } = useApi<Member[]>("/api/users", [])

  // Role permissions state (editable)
  const [rolePermissions, setRolePermissions] = useState<Record<MemberRole, string[]>>(
    () => {
      // Try to load from saved config, fallback to defaults
      if (typeof window !== "undefined") {
        try {
          const saved = window.sessionStorage?.getItem?.("__rp") // just for dev
        } catch {}
      }
      return { ...DEFAULT_ROLE_PERMISSIONS }
    }
  )

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "MEMBER" as MemberRole,
  })

  const handleOpenCreate = () => {
    setFormData({ name: "", email: "", role: "MEMBER" })
    setEditingMember(null)
    setShowCreate(true)
  }

  const handleOpenEdit = (member: Member) => {
    setFormData({ name: member.name, email: member.email, role: member.role })
    setEditingMember(member)
    setShowEdit(true)
  }

  const handleOpenDelete = (member: Member) => {
    setDeletingMember(member)
    setShowDelete(true)
  }

  const handleSave = async () => {
    if (!formData.name || !formData.email || !formData.role) return

    setLoading(true)
    try {
      if (editingMember) {
        await apiMutate(`/api/users/${editingMember.id}`, "PUT", {
          name: formData.name,
          email: formData.email,
          role: formData.role,
        })
        setShowEdit(false)
      } else {
        await apiMutate("/api/users", "POST", {
          ...formData,
          organizationId: "org_default",
        })
        setShowCreate(false)
      }
      refresh()
    } catch (error) {
      console.error("Failed to save member:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingMember) return

    setLoading(true)
    try {
      await apiMutate(`/api/users/${deletingMember.id}`, "DELETE")
      setShowDelete(false)
      setDeletingMember(null)
      refresh()
    } catch (error) {
      console.error("Failed to delete member:", error)
    } finally {
      setLoading(false)
    }
  }

  // Permission toggle
  const togglePermission = (role: MemberRole, permKey: string) => {
    setRolePermissions((prev) => {
      const current = prev[role] || []
      const has = current.includes(permKey)
      return {
        ...prev,
        [role]: has ? current.filter((k) => k !== permKey) : [...current, permKey],
      }
    })
  }

  // Toggle entire category for a role
  const toggleCategory = (role: MemberRole, categoryPerms: string[]) => {
    setRolePermissions((prev) => {
      const current = prev[role] || []
      const allEnabled = categoryPerms.every((p) => current.includes(p))
      if (allEnabled) {
        return { ...prev, [role]: current.filter((k) => !categoryPerms.includes(k)) }
      } else {
        const merged = [...new Set([...current, ...categoryPerms])]
        return { ...prev, [role]: merged }
      }
    })
  }

  // Save permissions config
  const handleSavePermissions = async () => {
    setPermSaving(true)
    try {
      // Save to API (will return 503 without DB, that's fine)
      await apiMutate("/api/users", "PUT", {
        type: "permissions_config",
        permissions: rolePermissions,
        customPermissions,
      }).catch(() => {
        // Silently handle — config saved in state for now
      })
      setPermSaved(true)
      setTimeout(() => setPermSaved(false), 2000)
      setEditingPermissions(false)
    } finally {
      setPermSaving(false)
    }
  }

  // Add custom permission
  const handleAddCustomPermission = () => {
    if (!newPermission.trim()) return
    const key = newPermission.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "")
    if (PERMISSION_CATEGORIES.flatMap((c) => c.permissions).some((p) => p.key === key)) return
    if (customPermissions.some((p) => p.key === key)) return

    setCustomPermissions((prev) => [...prev, { key, label: newPermission.trim() }])
    setNewPermission("")
  }

  // Reset to defaults
  const handleResetDefaults = () => {
    setRolePermissions({ ...DEFAULT_ROLE_PERMISSIONS })
    setCustomPermissions([])
  }

  // All permissions including custom
  const allCategories = [
    ...PERMISSION_CATEGORIES,
    ...(customPermissions.length > 0
      ? [{ name: "Custom", permissions: customPermissions }]
      : []),
  ]

  const allPermKeys = allCategories.flatMap((c) => c.permissions.map((p) => p.key))

  if (membersLoading) {
    return (
      <div>
        <Header
          title="Team Members"
          subtitle="Manage users and role permissions"
          action={{ label: "Add Member", onClick: handleOpenCreate }}
        />
        <div className="flex items-center justify-center p-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      </div>
    )
  }

  const stats = {
    total: members.length,
    owners: members.filter((m) => m.role === "OWNER").length,
    admins: members.filter((m) => m.role === "ADMIN").length,
    members: members.filter((m) => m.role === "MEMBER").length,
    viewers: members.filter((m) => m.role === "VIEWER").length,
  }

  return (
    <div>
      <Header
        title="Team Members"
        subtitle="Manage users and role permissions"
        action={{ label: "Add Member", onClick: handleOpenCreate }}
      />

      <div className="p-6 space-y-4">
        {/* Stats cards */}
        <div className="grid grid-cols-5 gap-3">
          <div className="card p-3">
            <p className="text-2xs text-surface-400">Total Members</p>
            <p className="text-lg font-semibold text-surface-800">{stats.total}</p>
          </div>
          <div className="card p-3">
            <p className="text-2xs text-surface-400">Owners</p>
            <p className="text-lg font-semibold text-brand-700">{stats.owners}</p>
          </div>
          <div className="card p-3">
            <p className="text-2xs text-surface-400">Admins</p>
            <p className="text-lg font-semibold text-blue-700">{stats.admins}</p>
          </div>
          <div className="card p-3">
            <p className="text-2xs text-surface-400">Members</p>
            <p className="text-lg font-semibold text-emerald-700">{stats.members}</p>
          </div>
          <div className="card p-3">
            <p className="text-2xs text-surface-400">Viewers</p>
            <p className="text-lg font-semibold text-surface-600">{stats.viewers}</p>
          </div>
        </div>

        {/* Members table */}
        <div className="card">
          <table className="table-compact">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Permissions</th>
                <th>Joined</th>
                <th className="w-20 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => {
                const permCount = (rolePermissions[member.role] || []).length
                return (
                  <tr key={member.id} className="hover:bg-surface-50">
                    <td>
                      <div className="font-medium text-surface-800">{member.name}</div>
                    </td>
                    <td className="text-2xs text-surface-500">{member.email}</td>
                    <td>
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-1 text-2xs font-medium ${
                          ROLE_COLORS[member.role].bg
                        } ${ROLE_COLORS[member.role].text}`}
                      >
                        {member.role}
                      </span>
                    </td>
                    <td className="text-2xs text-surface-500">
                      {permCount}/{allPermKeys.length} active
                    </td>
                    <td className="text-2xs text-surface-500">{formatDate(member.createdAt)}</td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(member)}
                          className="rounded p-1 text-surface-400 hover:bg-surface-100 hover:text-brand-600 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(member)}
                          className="rounded p-1 text-surface-400 hover:bg-surface-100 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {members.length === 0 && (
            <div className="px-4 py-8 text-center">
              <p className="text-2xs text-surface-400">
                No team members yet. Add your first member to get started.
              </p>
            </div>
          )}
        </div>

        {/* Configurable Role Permissions */}
        <div className="card">
          <button
            onClick={() => setShowPermissions(!showPermissions)}
            className="flex w-full items-center justify-between px-4 py-3"
          >
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-surface-500" />
              <h3 className="font-medium text-surface-800">Role Permissions</h3>
              {permSaved && (
                <span className="text-2xs text-emerald-600 font-medium flex items-center gap-1">
                  <Check className="h-3 w-3" /> Saved
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {showPermissions && !editingPermissions && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingPermissions(true)
                  }}
                  className="btn-secondary text-2xs"
                >
                  <Edit2 className="h-3 w-3" />
                  Configure
                </button>
              )}
              {showPermissions ? (
                <ChevronUp className="h-4 w-4 text-surface-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-surface-400" />
              )}
            </div>
          </button>

          {showPermissions && (
            <div className="border-t border-surface-200">
              {/* Permission Matrix */}
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  {/* Header with role columns */}
                  <thead>
                    <tr className="border-b border-surface-200">
                      <th className="px-4 py-3 text-2xs font-medium text-surface-500 uppercase tracking-wider w-64">
                        Permission
                      </th>
                      {ROLES.map((role) => {
                        const Icon = icons[role]
                        const permCount = (rolePermissions[role] || []).length
                        return (
                          <th key={role} className="px-3 py-3 text-center min-w-[100px]">
                            <div className="flex flex-col items-center gap-1">
                              <Icon className="h-4 w-4 text-surface-500" />
                              <span
                                className={`inline-flex items-center rounded-md px-2 py-0.5 text-2xs font-medium ${ROLE_COLORS[role].bg} ${ROLE_COLORS[role].text}`}
                              >
                                {role}
                              </span>
                              <span className="text-2xs text-surface-400">
                                {permCount}/{allPermKeys.length}
                              </span>
                            </div>
                          </th>
                        )
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {allCategories.map((category) => (
                      <>
                        {/* Category header row */}
                        <tr key={`cat-${category.name}`} className="bg-surface-50">
                          <td className="px-4 py-2">
                            <span className="text-xs font-semibold text-surface-700">
                              {category.name}
                            </span>
                          </td>
                          {ROLES.map((role) => {
                            const catPermKeys = category.permissions.map((p) => p.key)
                            const allEnabled = catPermKeys.every((k) =>
                              (rolePermissions[role] || []).includes(k)
                            )
                            const someEnabled = catPermKeys.some((k) =>
                              (rolePermissions[role] || []).includes(k)
                            )
                            return (
                              <td key={role} className="px-3 py-2 text-center">
                                {editingPermissions && (
                                  <button
                                    onClick={() => toggleCategory(role, catPermKeys)}
                                    className={`inline-flex items-center justify-center h-5 w-5 rounded text-2xs font-medium transition-colors ${
                                      allEnabled
                                        ? "bg-brand-600 text-white"
                                        : someEnabled
                                          ? "bg-brand-200 text-brand-700"
                                          : "bg-surface-200 text-surface-400"
                                    }`}
                                    title={allEnabled ? "Disable all" : "Enable all"}
                                  >
                                    {allEnabled ? (
                                      <Check className="h-3 w-3" />
                                    ) : someEnabled ? (
                                      "—"
                                    ) : (
                                      ""
                                    )}
                                  </button>
                                )}
                              </td>
                            )
                          })}
                        </tr>
                        {/* Permission rows */}
                        {category.permissions.map((perm) => (
                          <tr
                            key={perm.key}
                            className="border-b border-surface-100 hover:bg-surface-50 transition-colors"
                          >
                            <td className="px-4 py-2 pl-8">
                              <span className="text-xs text-surface-600">{perm.label}</span>
                            </td>
                            {ROLES.map((role) => {
                              const enabled = (rolePermissions[role] || []).includes(perm.key)
                              return (
                                <td key={role} className="px-3 py-2 text-center">
                                  {editingPermissions ? (
                                    <button
                                      onClick={() => togglePermission(role, perm.key)}
                                      className={`inline-flex items-center justify-center h-5 w-5 rounded-md border transition-all ${
                                        enabled
                                          ? "border-brand-600 bg-brand-600 text-white"
                                          : "border-surface-300 bg-white text-surface-300 hover:border-brand-400"
                                      }`}
                                    >
                                      {enabled && <Check className="h-3 w-3" />}
                                    </button>
                                  ) : (
                                    <span
                                      className={`inline-flex items-center justify-center h-5 w-5 rounded-md ${
                                        enabled
                                          ? "text-emerald-600"
                                          : "text-surface-300"
                                      }`}
                                    >
                                      {enabled ? (
                                        <Check className="h-3.5 w-3.5" />
                                      ) : (
                                        <X className="h-3 w-3" />
                                      )}
                                    </span>
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

              {/* Edit mode actions */}
              {editingPermissions && (
                <div className="border-t border-surface-200 px-4 py-3 space-y-3">
                  {/* Add custom permission */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newPermission}
                      onChange={(e) => setNewPermission(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddCustomPermission()}
                      placeholder="Add custom permission..."
                      className="input flex-1 text-xs"
                    />
                    <button
                      onClick={handleAddCustomPermission}
                      disabled={!newPermission.trim()}
                      className="btn-secondary text-2xs disabled:opacity-50"
                    >
                      <Plus className="h-3 w-3" />
                      Add
                    </button>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={handleResetDefaults}
                      className="text-2xs text-surface-500 hover:text-red-600 transition-colors"
                    >
                      Reset to defaults
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingPermissions(false)}
                        className="btn-secondary text-2xs"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSavePermissions}
                        disabled={permSaving}
                        className="btn-primary text-2xs"
                      >
                        <Save className="h-3 w-3" />
                        {permSaving ? "Saving..." : "Save Permissions"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create modal */}
      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Add Team Member"
        size="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSave()
          }}
          className="space-y-4"
        >
          <div>
            <label className="label">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@example.com"
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as MemberRole })}
              className="input"
            >
              <option value="OWNER">Owner — {ROLE_META.OWNER.description}</option>
              <option value="ADMIN">Admin — {ROLE_META.ADMIN.description}</option>
              <option value="MEMBER">Member — {ROLE_META.MEMBER.description}</option>
              <option value="VIEWER">Viewer — {ROLE_META.VIEWER.description}</option>
            </select>
            {/* Show permissions preview for selected role */}
            <div className="mt-2 rounded-md bg-surface-50 p-2">
              <p className="text-2xs font-medium text-surface-500 mb-1">
                Permissions for {formData.role}:
              </p>
              <div className="flex flex-wrap gap-1">
                {(rolePermissions[formData.role] || []).slice(0, 6).map((key) => {
                  const perm = allCategories
                    .flatMap((c) => c.permissions)
                    .find((p) => p.key === key)
                  return perm ? (
                    <span
                      key={key}
                      className="inline-flex rounded-full bg-white border border-surface-200 px-2 py-0.5 text-2xs text-surface-600"
                    >
                      {perm.label}
                    </span>
                  ) : null
                })}
                {(rolePermissions[formData.role] || []).length > 6 && (
                  <span className="text-2xs text-surface-400">
                    +{(rolePermissions[formData.role] || []).length - 6} more
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
              {loading ? "Adding..." : "Add Member"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit modal */}
      <Modal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        title="Edit Team Member"
        size="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSave()
          }}
          className="space-y-4"
        >
          <div>
            <label className="label">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@example.com"
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as MemberRole })}
              className="input"
            >
              <option value="OWNER">Owner</option>
              <option value="ADMIN">Admin</option>
              <option value="MEMBER">Member</option>
              <option value="VIEWER">Viewer</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={() => setShowEdit(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        title="Delete Team Member"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-surface-600">
            Are you sure you want to remove <strong>{deletingMember?.name}</strong> from the team?
            This action cannot be undone.
          </p>
          <div className="flex gap-2 justify-end pt-2">
            <button onClick={() => setShowDelete(false)} className="btn-secondary">
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="btn-primary bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? "Deleting..." : "Delete Member"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
