"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Briefcase,
  ClipboardList,
  Zap,
  BarChart3,
  Calendar,
  DollarSign,
  Clock,
  Target,
  TrendingUp,
  ChevronRight,
} from "lucide-react"
import { Header } from "@/components/dashboard/header"
import { useApi, apiMutate } from "@/hooks/use-api"
import { formatCurrency, formatDate, getStatusColor, toNum } from "@/lib/utils"
import type { Project, WorkOrder, Task, Client } from "@/types"

type TabKey = "overview" | "workorders" | "tasks" | "gantt"

const tabItems: Array<{ key: TabKey; label: string; icon: React.ReactNode }> = [
  { key: "overview", label: "Overview", icon: <Briefcase className="h-4 w-4" /> },
  { key: "workorders", label: "Work Orders", icon: <ClipboardList className="h-4 w-4" /> },
  { key: "tasks", label: "Tasks", icon: <Zap className="h-4 w-4" /> },
  { key: "gantt", label: "Gantt", icon: <BarChart3 className="h-4 w-4" /> },
]

const STATUS_STYLES: Record<string, { bg: string; dot: string }> = {
  PLANNING: { bg: "bg-surface-100 text-surface-700", dot: "bg-surface-400" },
  ACTIVE: { bg: "bg-blue-50 text-blue-700", dot: "bg-blue-500" },
  ON_HOLD: { bg: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  COMPLETED: { bg: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  CANCELLED: { bg: "bg-red-50 text-red-700", dot: "bg-red-400" },
}

const PRIORITY_STYLES: Record<string, string> = {
  CRITICAL: "bg-red-50 text-red-700 border border-red-200",
  HIGH: "bg-orange-50 text-orange-700 border border-orange-200",
  MEDIUM: "bg-amber-50 text-amber-700 border border-amber-200",
  LOW: "bg-surface-50 text-surface-600 border border-surface-200",
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params)
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabKey>("overview")
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState<Record<string, any>>({})

  const { data: project, loading, refresh } = useApi<Project | null>(`/api/projects/${resolvedParams.id}`, null)
  const { data: workOrders = [] } = useApi<WorkOrder[]>("/api/work-orders", [])
  const { data: tasks = [] } = useApi<Task[]>("/api/tasks", [])
  const { data: clients = [] } = useApi<Client[]>("/api/clients", [])

  const projectWorkOrders = useMemo(() => workOrders.filter((wo) => wo.projectId === project?.id), [workOrders, project])
  const projectTasks = useMemo(() => tasks.filter((t) => t.projectId === project?.id), [tasks, project])

  const budget = toNum(project?.budget)
  const spent = toNum((project as any)?.spent)
  const remaining = Math.max(budget - spent, 0)
  const budgetPercent = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0
  const totalHours = projectWorkOrders.reduce((sum, wo) => sum + toNum(wo.hours), 0)
  const totalRevenue = projectWorkOrders.reduce((sum, wo) => sum + toNum(wo.hours) * toNum(wo.rate), 0)

  const taskStats = useMemo(() => ({
    total: projectTasks.length,
    done: projectTasks.filter((t) => t.status === "DONE").length,
    inProgress: projectTasks.filter((t) => t.status === "IN_PROGRESS").length,
    todo: projectTasks.filter((t) => t.status === "TODO").length,
  }), [projectTasks])

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50">
        <Header title="Projects" />
        <div className="flex items-center justify-center p-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-surface-50">
        <Header title="Projects" />
        <div className="flex flex-col items-center justify-center p-20 text-surface-400">
          <Briefcase className="h-10 w-10 mb-3 opacity-30" />
          <p className="text-sm">Project not found</p>
          <Link href="/projects" className="mt-3 text-sm text-brand-600 hover:text-brand-700">← Back to Projects</Link>
        </div>
      </div>
    )
  }

  const statusStyle = STATUS_STYLES[project.status] || STATUS_STYLES.PLANNING
  const priorityStyle = PRIORITY_STYLES[project.priority] || PRIORITY_STYLES.MEDIUM
  const clientName = (project as any)?.client?.name || "—"

  function openEdit() {
    setEditForm({
      name: project!.name,
      clientId: project!.clientId,
      status: project!.status,
      priority: project!.priority,
      budget: toNum(project!.budget),
      progress: project!.progress,
      startDate: project!.startDate ? new Date(project!.startDate).toISOString().split("T")[0] : "",
      deadline: project!.deadline ? new Date(project!.deadline).toISOString().split("T")[0] : "",
      description: project!.description || "",
    })
    setEditing(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await apiMutate(`/api/projects/${project!.id}`, "PUT", editForm)
      setEditing(false)
      refresh()
    } catch { /* silently */ }
    setSaving(false)
  }

  async function handleDelete() {
    if (confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      await apiMutate(`/api/projects/${project!.id}`, "DELETE")
      router.push("/projects")
    }
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <Header title="Projects" />

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between p-5 border-b border-surface-200">
              <div className="flex items-center gap-2">
                <Pencil className="h-4 w-4 text-brand-600" />
                <h2 className="text-sm font-semibold text-surface-900">Edit Project</h2>
              </div>
              <button onClick={() => setEditing(false)} className="rounded-lg p-1 text-surface-400 hover:bg-surface-100 hover:text-surface-600">
                <span className="sr-only">Close</span>✕
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Project Name *</label>
                  <input className="input w-full" value={editForm.name || ""} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                </div>
                <div>
                  <label className="label">Client</label>
                  <select className="input w-full" value={editForm.clientId || ""} onChange={(e) => setEditForm({ ...editForm, clientId: e.target.value })}>
                    {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label">Status</label>
                  <select className="input w-full" value={editForm.status || ""} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                    <option value="PLANNING">Planning</option>
                    <option value="ACTIVE">Active</option>
                    <option value="ON_HOLD">On Hold</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="label">Priority</label>
                  <select className="input w-full" value={editForm.priority || ""} onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="label">Budget</label>
                  <input type="number" className="input w-full" value={editForm.budget || ""} onChange={(e) => setEditForm({ ...editForm, budget: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label">Progress (%)</label>
                  <input type="number" min="0" max="100" className="input w-full" value={editForm.progress ?? ""} onChange={(e) => setEditForm({ ...editForm, progress: parseInt(e.target.value) || 0 })} />
                </div>
                <div>
                  <label className="label">Start Date</label>
                  <input type="date" className="input w-full" value={editForm.startDate || ""} onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })} />
                </div>
                <div>
                  <label className="label">Deadline</label>
                  <input type="date" className="input w-full" value={editForm.deadline || ""} onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input w-full" rows={3} value={editForm.description || ""} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-surface-200">
                <button type="button" onClick={() => setEditing(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex">
        {/* Left sidebar tabs */}
        <aside className="hidden md:block w-48 shrink-0 border-r border-surface-200 bg-white min-h-[calc(100vh-105px)]">
          <nav className="p-2 space-y-0.5">
            {tabItems.map((item) => {
              const count = item.key === "workorders" ? projectWorkOrders.length
                : item.key === "tasks" ? projectTasks.length
                : undefined
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    activeTab === item.key
                      ? "bg-brand-50 text-brand-700"
                      : "text-surface-600 hover:bg-surface-50 hover:text-surface-800"
                  }`}
                >
                  <span className={activeTab === item.key ? "text-brand-600" : "text-surface-400"}>{item.icon}</span>
                  <span className="flex-1 text-left">{item.label}</span>
                  {count !== undefined && count > 0 && (
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                      activeTab === item.key ? "bg-brand-100 text-brand-700" : "bg-surface-100 text-surface-500"
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Main content */}
        <div className="flex-1 p-6">
          {/* Back link */}
          <Link href="/projects" className="inline-flex items-center gap-1 text-xs text-surface-500 hover:text-brand-600 transition-colors mb-4">
            <ArrowLeft className="h-3 w-3" /> Back to Projects
          </Link>

          {/* Project header card */}
          <div className="card p-5 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-xl font-bold text-surface-900">{project.name}</h1>
                <p className="text-sm text-surface-500 mt-0.5">{clientName}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={openEdit} className="btn-secondary text-xs gap-1.5">
                  <Pencil className="h-3 w-3" /> Edit
                </button>
                <button onClick={handleDelete} className="rounded-lg p-2 text-surface-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-2xs font-semibold ${statusStyle.bg}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
                  {project.status.replace(/_/g, " ")}
                </span>
                <span className={`rounded-full px-2.5 py-1 text-2xs font-semibold ${priorityStyle}`}>
                  {project.priority}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-2xs text-surface-500">Progress</span>
                <span className="text-2xs font-semibold text-surface-700">{project.progress}%</span>
              </div>
              <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    project.progress >= 100 ? "bg-emerald-500" : project.progress >= 50 ? "bg-brand-500" : "bg-amber-500"
                  }`}
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-lg border border-surface-100 bg-surface-50/50 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-2xs text-surface-500">Budget</span>
                </div>
                <p className="text-lg font-bold text-surface-900">{formatCurrency(budget)}</p>
                <p className="text-2xs text-surface-400">{formatCurrency(spent)} spent</p>
              </div>
              <div className="rounded-lg border border-surface-100 bg-surface-50/50 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-3.5 w-3.5 text-blue-500" />
                  <span className="text-2xs text-surface-500">Hours</span>
                </div>
                <p className="text-lg font-bold text-surface-900">{Math.round(totalHours)}h</p>
                <p className="text-2xs text-surface-400">{projectWorkOrders.length} work orders</p>
              </div>
              <div className="rounded-lg border border-surface-100 bg-surface-50/50 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-2xs text-surface-500">Tasks</span>
                </div>
                <p className="text-lg font-bold text-surface-900">{taskStats.done}/{taskStats.total}</p>
                <p className="text-2xs text-surface-400">{taskStats.inProgress} in progress</p>
              </div>
              <div className="rounded-lg border border-surface-100 bg-surface-50/50 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-3.5 w-3.5 text-purple-500" />
                  <span className="text-2xs text-surface-500">Deadline</span>
                </div>
                <p className="text-lg font-bold text-surface-900">{formatDate(project.deadline)}</p>
                <p className="text-2xs text-surface-400">Started {formatDate(project.startDate)}</p>
              </div>
            </div>
          </div>

          {/* Mobile tabs */}
          <div className="flex gap-2 border-b border-surface-200 mb-6 md:hidden overflow-x-auto">
            {tabItems.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-2 text-xs font-medium transition-colors ${
                  activeTab === tab.key
                    ? "border-b-2 border-brand-600 text-brand-600"
                    : "text-surface-500 hover:text-surface-700"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* ─── OVERVIEW TAB ─────────────────── */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Description */}
              <div className="card p-5">
                <h3 className="text-sm font-semibold text-surface-800 mb-3">Description</h3>
                <p className="text-sm text-surface-600 leading-relaxed">{project.description || "No description provided."}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Timeline */}
                <div className="card p-5">
                  <h3 className="text-sm font-semibold text-surface-800 mb-4">Timeline</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50">
                        <Calendar className="h-3.5 w-3.5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-2xs text-surface-400 uppercase tracking-wider">Start Date</p>
                        <p className="text-sm font-medium text-surface-800">{formatDate(project.startDate)}</p>
                      </div>
                    </div>
                    <div className="ml-4 h-6 border-l-2 border-dashed border-surface-200" />
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50">
                        <Target className="h-3.5 w-3.5 text-red-500" />
                      </div>
                      <div>
                        <p className="text-2xs text-surface-400 uppercase tracking-wider">Deadline</p>
                        <p className="text-sm font-medium text-surface-800">{formatDate(project.deadline)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Budget Breakdown */}
                <div className="card p-5">
                  <h3 className="text-sm font-semibold text-surface-800 mb-4">Budget Breakdown</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-surface-500">Spent</span>
                      <span className="text-sm font-semibold text-surface-800">{formatCurrency(spent)}</span>
                    </div>
                    <div className="h-2.5 bg-surface-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          budgetPercent > 90 ? "bg-red-500" : budgetPercent > 70 ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${budgetPercent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-surface-500">Remaining</span>
                      <span className="text-sm font-semibold text-emerald-600">{formatCurrency(remaining)}</span>
                    </div>
                    <div className="border-t border-surface-100 pt-3 flex items-center justify-between">
                      <span className="text-xs text-surface-500">Total Budget</span>
                      <span className="text-sm font-bold text-surface-900">{formatCurrency(budget)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-surface-500">Revenue (Work Orders)</span>
                      <span className="text-sm font-semibold text-brand-600">{formatCurrency(totalRevenue)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent activity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recent Work Orders */}
                <div className="card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-surface-800">Recent Work Orders</h3>
                    <button onClick={() => setActiveTab("workorders")} className="text-2xs text-brand-600 hover:text-brand-700">View all</button>
                  </div>
                  {projectWorkOrders.length === 0 ? (
                    <p className="text-xs text-surface-400 py-4 text-center">No work orders yet</p>
                  ) : (
                    <div className="space-y-2">
                      {projectWorkOrders.slice(0, 4).map((wo) => (
                        <div key={wo.id} className="flex items-center justify-between rounded-lg border border-surface-100 p-2.5 hover:bg-surface-50 transition-colors">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-2xs font-mono font-semibold text-surface-500">{wo.number}</span>
                            <span className="text-xs text-surface-700 truncate">{wo.title}</span>
                          </div>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${getStatusColor(wo.status)}`}>
                            {wo.status.replace(/_/g, " ")}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Tasks */}
                <div className="card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-surface-800">Recent Tasks</h3>
                    <button onClick={() => setActiveTab("tasks")} className="text-2xs text-brand-600 hover:text-brand-700">View all</button>
                  </div>
                  {projectTasks.length === 0 ? (
                    <p className="text-xs text-surface-400 py-4 text-center">No tasks yet</p>
                  ) : (
                    <div className="space-y-2">
                      {projectTasks.slice(0, 4).map((task) => (
                        <div key={task.id} className="flex items-center justify-between rounded-lg border border-surface-100 p-2.5 hover:bg-surface-50 transition-colors">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                              task.priority === "CRITICAL" ? "bg-red-500" : task.priority === "HIGH" ? "bg-orange-500" : task.priority === "MEDIUM" ? "bg-amber-500" : "bg-surface-400"
                            }`} />
                            <span className="text-xs text-surface-700 truncate">{task.title}</span>
                          </div>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${getStatusColor(task.status)}`}>
                            {task.status.replace(/_/g, " ")}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ─── WORK ORDERS TAB ──────────────── */}
          {activeTab === "workorders" && (
            <div className="card overflow-hidden">
              <div className="px-5 py-4 border-b border-surface-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-surface-800">Work Orders ({projectWorkOrders.length})</h3>
              </div>
              {projectWorkOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-surface-400">
                  <ClipboardList className="h-8 w-8 mb-2 opacity-30" />
                  <p className="text-xs">No work orders for this project</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-surface-100 bg-surface-50/50">
                      <th className="px-4 py-2.5 text-left text-2xs font-semibold uppercase tracking-wider text-surface-500">Number</th>
                      <th className="px-4 py-2.5 text-left text-2xs font-semibold uppercase tracking-wider text-surface-500">Title</th>
                      <th className="px-4 py-2.5 text-left text-2xs font-semibold uppercase tracking-wider text-surface-500">Status</th>
                      <th className="px-4 py-2.5 text-left text-2xs font-semibold uppercase tracking-wider text-surface-500">Assignee</th>
                      <th className="px-4 py-2.5 text-right text-2xs font-semibold uppercase tracking-wider text-surface-500">Hours</th>
                      <th className="px-4 py-2.5 text-right text-2xs font-semibold uppercase tracking-wider text-surface-500">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-50">
                    {projectWorkOrders.map((wo) => (
                      <tr key={wo.id} className="hover:bg-surface-50/50 transition-colors">
                        <td className="px-4 py-3 text-xs font-mono font-semibold text-brand-600">{wo.number}</td>
                        <td className="px-4 py-3 text-xs text-surface-700">{wo.title}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${getStatusColor(wo.status)}`}>
                            {wo.status.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-surface-600">{wo.assignee || "—"}</td>
                        <td className="px-4 py-3 text-xs text-right font-medium text-surface-700">{toNum(wo.hours)}h</td>
                        <td className="px-4 py-3 text-xs text-right font-semibold text-surface-800">{formatCurrency(toNum(wo.hours) * toNum(wo.rate))}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-surface-200 bg-surface-50/50">
                      <td colSpan={4} className="px-4 py-2.5 text-xs font-semibold text-surface-600">Total</td>
                      <td className="px-4 py-2.5 text-xs text-right font-bold text-surface-800">{Math.round(totalHours)}h</td>
                      <td className="px-4 py-2.5 text-xs text-right font-bold text-surface-800">{formatCurrency(totalRevenue)}</td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>
          )}

          {/* ─── TASKS TAB ────────────────────── */}
          {activeTab === "tasks" && (
            <div className="card overflow-hidden">
              <div className="px-5 py-4 border-b border-surface-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-surface-800">Tasks ({projectTasks.length})</h3>
                <div className="flex gap-2">
                  {[
                    { label: "Todo", count: taskStats.todo, color: "bg-surface-200 text-surface-600" },
                    { label: "In Progress", count: taskStats.inProgress, color: "bg-blue-100 text-blue-700" },
                    { label: "Done", count: taskStats.done, color: "bg-emerald-100 text-emerald-700" },
                  ].map((s) => (
                    <span key={s.label} className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${s.color}`}>
                      {s.count} {s.label}
                    </span>
                  ))}
                </div>
              </div>
              {projectTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-surface-400">
                  <Zap className="h-8 w-8 mb-2 opacity-30" />
                  <p className="text-xs">No tasks for this project</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-surface-100 bg-surface-50/50">
                      <th className="px-4 py-2.5 text-left text-2xs font-semibold uppercase tracking-wider text-surface-500">Task</th>
                      <th className="px-4 py-2.5 text-left text-2xs font-semibold uppercase tracking-wider text-surface-500">Priority</th>
                      <th className="px-4 py-2.5 text-left text-2xs font-semibold uppercase tracking-wider text-surface-500">Status</th>
                      <th className="px-4 py-2.5 text-left text-2xs font-semibold uppercase tracking-wider text-surface-500">Assignee</th>
                      <th className="px-4 py-2.5 text-left text-2xs font-semibold uppercase tracking-wider text-surface-500">Due Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-50">
                    {projectTasks.map((task) => (
                      <tr key={task.id} className="hover:bg-surface-50/50 transition-colors">
                        <td className="px-4 py-3 text-xs font-medium text-surface-700">{task.title}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            task.priority === "CRITICAL" ? "bg-red-50 text-red-700"
                            : task.priority === "HIGH" ? "bg-orange-50 text-orange-700"
                            : task.priority === "MEDIUM" ? "bg-amber-50 text-amber-700"
                            : "bg-surface-100 text-surface-600"
                          }`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${getStatusColor(task.status)}`}>
                            {task.status.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-surface-600">{task.assignee?.name || "—"}</td>
                        <td className="px-4 py-3 text-xs text-surface-600">{formatDate(task.dueDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ─── GANTT TAB ────────────────────── */}
          {activeTab === "gantt" && (
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-surface-800 mb-5">Project Timeline</h3>
              {projectTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-surface-400">
                  <BarChart3 className="h-8 w-8 mb-2 opacity-30" />
                  <p className="text-xs">No tasks to show on the timeline</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="min-w-[600px]">
                    {/* Header */}
                    <div className="flex gap-4 mb-3 pb-2 border-b border-surface-100">
                      <div className="w-44 flex-shrink-0">
                        <p className="text-2xs font-semibold uppercase tracking-wider text-surface-500">Task</p>
                      </div>
                      <div className="flex-1 flex justify-between">
                        <span className="text-2xs text-surface-400">{formatDate(project.startDate)}</span>
                        <span className="text-2xs text-surface-400">{formatDate(project.deadline)}</span>
                      </div>
                    </div>

                    {/* Bars */}
                    <div className="space-y-2">
                      {projectTasks.map((task) => {
                        const projectStart = new Date(project.startDate).getTime()
                        const projectEnd = new Date(project.deadline).getTime()
                        const taskStart = new Date(task.createdAt).getTime()
                        const taskDue = new Date(task.dueDate).getTime()
                        const totalSpan = projectEnd - projectStart || 1

                        const left = Math.max(((taskStart - projectStart) / totalSpan) * 100, 0)
                        const width = Math.max(Math.min(((taskDue - taskStart) / totalSpan) * 100, 100 - left), 3)

                        const barColor = task.status === "DONE" ? "bg-emerald-500"
                          : task.priority === "CRITICAL" ? "bg-red-500"
                          : task.priority === "HIGH" ? "bg-orange-500"
                          : task.priority === "MEDIUM" ? "bg-amber-500"
                          : "bg-surface-400"

                        return (
                          <div key={task.id} className="flex items-center gap-4">
                            <div className="w-44 flex-shrink-0 flex items-center gap-2">
                              <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${barColor}`} />
                              <p className="text-xs text-surface-700 truncate">{task.title}</p>
                            </div>
                            <div className="flex-1">
                              <div className="relative h-6 bg-surface-50 rounded-md border border-surface-100">
                                <div
                                  className={`absolute top-0.5 bottom-0.5 rounded ${barColor} ${task.status === "DONE" ? "opacity-100" : "opacity-70"}`}
                                  style={{ left: `${left}%`, width: `${width}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
