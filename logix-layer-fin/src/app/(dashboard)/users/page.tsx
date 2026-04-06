"use client"

import { useState } from "react"
import { Header } from "@/components/dashboard/header"
import { Modal } from "@/components/ui/modal"
import { useApi, apiMutate } from "@/hooks/use-api"
import type { Member, MemberRole } from "@/types"
import { formatDate } from "@/lib/utils"
import { Trash2, Edit2, ChevronDown, ChevronUp, Shield, Lock, Eye, Users } from "lucide-react"

const ROLE_COLORS: Record<MemberRole, { bg: string; text: string }> = {
  OWNER: { bg: "bg-brand-50", text: "text-brand-700" },
  ADMIN: { bg: "bg-blue-50", text: "text-blue-700" },
  MEMBER: { bg: "bg-emerald-50", text: "text-emerald-700" },
  VIEWER: { bg: "bg-surface-100", text: "text-surface-600" },
}

const ROLE_PERMISSIONS = {
  OWNER: {
    title: "Full Access",
    permissions: [
      "Manage team members",
      "Access all features",
      "Manage billing & subscription",
      "Delete organization",
    ],
  },
  ADMIN: {
    title: "Administrator",
    permissions: [
      "Manage team members",
      "Create and edit all records",
      "View reports and analytics",
      "Configure settings",
    ],
  },
  MEMBER: {
    title: "Team Member",
    permissions: [
      "Create and edit own records",
      "View all records",
      "Collaborate with team",
      "Submit work orders",
    ],
  },
  VIEWER: {
    title: "Read-Only Access",
    permissions: [
      "View all records",
      "View reports",
      "Export data",
      "No editing permissions",
    ],
  },
}

export default function UsersPage() {
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [showPermissions, setShowPermissions] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [deletingMember, setDeletingMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(false)

  const { data: members, loading: membersLoading, refresh } = useApi<Member[]>("/api/users", [])

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
          organizationId: "org_default", // TODO: Get from context
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

  const icons = {
    OWNER: Shield,
    ADMIN: Lock,
    MEMBER: Users,
    VIEWER: Eye,
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
                <th>Joined</th>
                <th className="w-20 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
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
              ))}
            </tbody>
          </table>
          {members.length === 0 && (
            <div className="px-4 py-8 text-center">
              <p className="text-2xs text-surface-400">No team members yet. Add your first member to get started.</p>
            </div>
          )}
        </div>

        {/* Role permissions info */}
        <div className="card p-4">
          <button
            onClick={() => setShowPermissions(!showPermissions)}
            className="flex w-full items-center justify-between"
          >
            <h3 className="font-medium text-surface-800">Role Permissions Reference</h3>
            {showPermissions ? (
              <ChevronUp className="h-4 w-4 text-surface-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-surface-400" />
            )}
          </button>

          {showPermissions && (
            <div className="mt-4 space-y-3 border-t border-surface-100 pt-4">
              {(["OWNER", "ADMIN", "MEMBER", "VIEWER"] as MemberRole[]).map((role) => {
                const Icon = icons[role]
                const perm = ROLE_PERMISSIONS[role]
                return (
                  <div key={role} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-surface-600" />
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-2xs font-medium ${
                          ROLE_COLORS[role].bg
                        } ${ROLE_COLORS[role].text}`}
                      >
                        {role}
                      </span>
                      <span className="text-xs font-medium text-surface-700">{perm.title}</span>
                    </div>
                    <ul className="ml-6 space-y-1 text-2xs text-surface-600">
                      {perm.permissions.map((p) => (
                        <li key={p} className="flex items-center gap-2">
                          <span className="h-1 w-1 rounded-full bg-surface-400" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
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
              <option value="OWNER">Owner</option>
              <option value="ADMIN">Admin</option>
              <option value="MEMBER">Member</option>
              <option value="VIEWER">Viewer</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50"
            >
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
            <button
              type="button"
              onClick={() => setShowEdit(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50"
            >
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
            Are you sure you want to remove <strong>{deletingMember?.name}</strong> from the team? This action cannot be undone.
          </p>
          <div className="flex gap-2 justify-end pt-2">
            <button
              onClick={() => setShowDelete(false)}
              className="btn-secondary"
            >
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
