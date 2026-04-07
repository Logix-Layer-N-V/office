"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { Header } from "@/components/dashboard/header";
import { useApi, apiMutate } from "@/hooks/use-api";
import { formatCurrency, formatDate, getStatusColor, toNum } from "@/lib/utils";
import type { Project, WorkOrder, Task, ProjectStatus, ProjectPriority, Client } from "@/types";

type TabType = "overview" | "workorders" | "tasks" | "gantt";

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const { data: project, loading, refresh } = useApi<Project | null>(`/api/projects/${resolvedParams.id}`, null);
  const { data: workOrders = [] } = useApi<WorkOrder[]>("/api/work-orders", []);
  const { data: tasks = [] } = useApi<Task[]>("/api/tasks", []);
  const { data: clients = [] } = useApi<Client[]>("/api/clients", []);
  const [editForm, setEditForm] = useState<Record<string, any>>({});

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50">
        <Header title="Projects" />
        <div className="flex items-center justify-center p-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-surface-50">
        <Header title="Projects" />
        <div className="flex flex-col items-center justify-center p-12 text-surface-400">
          <p>The requested project was not found.</p>
          <a href="/projects" className="mt-2 text-brand-600 hover:underline">Back to projects</a>
        </div>
      </div>
    );
  }

  const projectWorkOrders = workOrders.filter((wo) => wo.projectId === project.id);
  const projectTasks = tasks.filter((t) => t.projectId === project.id);

  const budget = parseFloat(String(project.budget)) || 0;
  const spent = (project as any).spent ?? 0;
  const budgetUsagePercent = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const totalHours = projectWorkOrders.reduce((sum, wo) => sum + (parseFloat(String((wo as any).hours)) || 0), 0);

  return (
    <div className="min-h-screen bg-surface-50">
      <Header title="Projects" />
      <div className="p-6">
        {/* Back Link */}
        <Link href="/projects" className="mb-6 text-sm text-brand-600 hover:text-brand-700">
          ← Back to Projects
        </Link>

        {/* Edit Modal */}
        {editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="card w-full max-w-2xl mx-4 p-6">
              <h2 className="text-lg font-bold text-surface-800 mb-4">Edit Project</h2>
              <form className="space-y-4" onSubmit={async (e) => {
                e.preventDefault();
                setSaving(true);
                try {
                  await apiMutate(`/api/projects/${project.id}`, "PUT", editForm);
                  setEditing(false);
                  refresh();
                } catch { /* error handled silently */ }
                setSaving(false);
              }}>
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

        {/* Project Header */}
        <div className="card mb-6">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-surface-800">{project?.name}</h1>
              <p className="text-surface-600">{(project as any)?.client?.name || "—"}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setEditForm({
                    name: project.name,
                    clientId: project.clientId,
                    status: project.status,
                    priority: project.priority,
                    budget: toNum(project.budget),
                    progress: project.progress,
                    startDate: project.startDate ? new Date(project.startDate).toISOString().split("T")[0] : "",
                    deadline: project.deadline ? new Date(project.deadline).toISOString().split("T")[0] : "",
                    description: project.description || "",
                  });
                  setEditing(true);
                }}
                className="btn-secondary"
              >
                <Pencil className="h-3.5 w-3.5" /> Edit
              </button>
              <button
                onClick={async () => {
                  if (confirm("Are you sure you want to delete this project?")) {
                    await apiMutate(`/api/projects/${project.id}`, "DELETE");
                    router.push("/projects");
                  }
                }}
                className="btn-secondary text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <span
                className={`inline-block rounded px-3 py-1 text-sm font-semibold ${getStatusColor(
                  project?.status || "PLANNING"
                )}`}
              >
                {project?.status?.replace(/_/g, " ")}
              </span>
              <span
                className={`inline-block rounded px-3 py-1 text-sm font-semibold ${
                  project?.priority === "CRITICAL"
                    ? "bg-red-100 text-red-700"
                    : project?.priority === "HIGH"
                      ? "bg-orange-100 text-orange-700"
                      : project?.priority === "MEDIUM"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-surface-100 text-surface-700"
                }`}
              >
                {project?.priority}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-2xs uppercase tracking-wider text-surface-500">Budget</p>
              <p className="mt-1 text-lg font-bold text-surface-800">
                {formatCurrency(spent)}
              </p>
              <p className="text-2xs text-surface-600">of {formatCurrency(budget)}</p>
            </div>
            <div>
              <p className="text-2xs uppercase tracking-wider text-surface-500">Progress</p>
              <p className="mt-1 text-lg font-bold text-surface-800">{project?.progress}%</p>
            </div>
            <div>
              <p className="text-2xs uppercase tracking-wider text-surface-500">Hours</p>
              <p className="mt-1 text-lg font-bold text-surface-800">{Math.round(totalHours)}h</p>
            </div>
            <div>
              <p className="text-2xs uppercase tracking-wider text-surface-500">Deadline</p>
              <p className="mt-1 text-lg font-bold text-surface-800">
                {formatDate(project?.deadline || "")}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-4 border-b border-surface-200">
          {["overview", "workorders", "tasks", "gantt"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as TabType)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "border-b-2 border-brand-600 text-brand-600"
                  : "text-surface-600 hover:text-surface-800"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1).replace("workorders", "Work Orders")}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="card">
              <h2 className="mb-4 text-lg font-semibold text-surface-800">Description</h2>
              <p className="text-surface-600">{project?.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="card">
                <h3 className="mb-4 text-sm font-semibold text-surface-800">Timeline</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-2xs uppercase tracking-wider text-surface-500">Start</p>
                    <p className="text-surface-800">{formatDate(project?.startDate || "")}</p>
                  </div>
                  <div>
                    <p className="text-2xs uppercase tracking-wider text-surface-500">Deadline</p>
                    <p className="text-surface-800">{formatDate(project?.deadline || "")}</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="mb-4 text-sm font-semibold text-surface-800">Budget Breakdown</h3>
                <div className="space-y-2">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs text-surface-600">Spent</span>
                    <span className="font-semibold text-surface-800">
                      {formatCurrency(spent)}
                    </span>
                  </div>
                  <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500"
                      style={{ width: `${budgetUsagePercent}%` }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-surface-600">Remaining</span>
                    <span className="font-semibold text-surface-800">
                      {formatCurrency(Math.max(budget - spent, 0))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "workorders" && (
          <div className="card overflow-x-auto">
            <table className="table-compact w-full">
              <thead>
                <tr className="border-b border-surface-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-surface-600">
                    Number
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-surface-600">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-surface-600">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-surface-600">
                    Assignee
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-surface-600">
                    Hours
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-surface-600">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {projectWorkOrders.map((wo) => (
                  <tr key={wo.id} className="border-b border-surface-100 hover:bg-surface-100">
                    <td className="px-4 py-3 text-sm text-surface-800">{wo.number}</td>
                    <td className="px-4 py-3 text-sm text-surface-800">{wo.title}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded px-2 py-1 text-2xs font-semibold ${getStatusColor(
                          wo.status
                        )}`}
                      >
                        {wo.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-surface-800">{wo.assignee}</td>
                    <td className="px-4 py-3 text-sm text-surface-800">{wo.hours}h</td>
                    <td className="px-4 py-3 text-sm font-semibold text-surface-800">
                      {formatCurrency(toNum(wo.hours) * toNum(wo.rate))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "tasks" && (
          <div className="card overflow-x-auto">
            <table className="table-compact w-full">
              <thead>
                <tr className="border-b border-surface-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-surface-600">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-surface-600">
                    Priority
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-surface-600">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-surface-600">
                    Assignee
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-surface-600">
                    Due Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {projectTasks.map((task) => (
                  <tr key={task.id} className="border-b border-surface-100 hover:bg-surface-100">
                    <td className="px-4 py-3 text-sm text-surface-800">{task.title}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded px-2 py-1 text-2xs font-semibold ${
                          task.priority === "CRITICAL"
                            ? "bg-red-100 text-red-700"
                            : task.priority === "HIGH"
                              ? "bg-orange-100 text-orange-700"
                              : task.priority === "MEDIUM"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-surface-100 text-surface-700"
                        }`}
                      >
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded px-2 py-1 text-2xs font-semibold ${getStatusColor(
                          task.status
                        )}`}
                      >
                        {task.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-surface-800">{task.assignee?.name || "—"}</td>
                    <td className="px-4 py-3 text-sm text-surface-800">
                      {formatDate(task.dueDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "gantt" && (
          <div className="card">
            <h2 className="mb-6 text-lg font-semibold text-surface-800">Project Timeline</h2>
            <div className="overflow-x-auto">
              {/* Timeline Header */}
              <div className="mb-4 flex gap-4">
                <div className="w-40 flex-shrink-0">
                  <p className="text-2xs font-semibold uppercase text-surface-600">Task</p>
                </div>
                <div className="flex-1">
                  <div className="flex gap-2 text-2xs font-semibold uppercase text-surface-600">
                    <div className="flex-1 text-center">Start</div>
                    <div className="flex-1 text-center">Progress</div>
                    <div className="flex-1 text-center">Due</div>
                  </div>
                </div>
              </div>

              {/* Timeline Bars */}
              <div className="space-y-3">
                {projectTasks.map((task) => {
                  const startDate = new Date(task.createdAt);
                  const dueDate = new Date(task.dueDate);
                  const projectStart = new Date(project.startDate);
                  const projectEnd = new Date(project.deadline);

                  const totalDays =
                    (projectEnd.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24);
                  const taskStartOffset =
                    ((startDate.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24)) /
                    totalDays;
                  const taskDuration =
                    ((dueDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) /
                    totalDays;

                  const barColor =
                    task.priority === "CRITICAL"
                      ? "bg-red-500"
                      : task.priority === "HIGH"
                        ? "bg-orange-500"
                        : task.priority === "MEDIUM"
                          ? "bg-amber-500"
                          : "bg-surface-400";

                  return (
                    <div key={task.id} className="flex gap-4">
                      <div className="w-40 flex-shrink-0">
                        <p className="truncate text-sm text-surface-800">{task.title}</p>
                      </div>
                      <div className="flex-1">
                        <div className="relative h-6 bg-surface-100 rounded">
                          <div
                            className={`absolute top-0 h-6 rounded ${barColor} opacity-70`}
                            style={{
                              left: `${Math.max(taskStartOffset * 100, 0)}%`,
                              width: `${Math.max(Math.min(taskDuration * 100, 100), 2)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
