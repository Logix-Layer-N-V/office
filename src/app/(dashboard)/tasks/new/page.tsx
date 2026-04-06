"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { apiMutate, useApi } from "@/hooks/use-api"
import type { TaskStatus, ProjectPriority, Project, WorkOrder, Client } from "@/types"
import { ArrowLeft, AlertCircle } from "lucide-react"

export default function TasksNewPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { data: projects } = useApi<Project[]>("/api/projects", [])
  const { data: workOrders } = useApi<WorkOrder[]>("/api/work-orders", [])
  const { data: clients } = useApi<Client[]>("/api/clients", [])
  const [task, setTask] = useState({
    title: "",
    projectId: "",
    workOrderId: "",
    clientId: "",
    priority: "MEDIUM" as ProjectPriority,
    status: "TODO" as TaskStatus,
    assignee: "",
    dueDate: "",
  })

  const filteredWorkOrders = workOrders.filter((wo) => wo.projectId === task.projectId)
  const selectedProject = projects.find((p) => p.id === task.projectId)

  const saveTask = async () => {
    if (!task.title || !task.projectId) {
      setError("Title and Project are required")
      return
    }

    setLoading(true)
    setError(null)

    try {
      await apiMutate("/api/tasks", "POST", task)
      router.push("/tasks")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-surface-50">
      {/* Header */}
      <header className="flex h-12 items-center border-b border-surface-200 bg-white px-6">
        <button
          onClick={() => router.push("/tasks")}
          className="flex items-center gap-2 text-sm font-semibold text-surface-600 hover:text-surface-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tasks
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto">
          {/* Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-surface-800">New Task</h1>
            <p className="text-sm text-surface-400 mt-1">Create a new task</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 flex gap-3 rounded-lg bg-red-50 p-4 border border-red-200">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-900">{error}</p>
              </div>
            </div>
          )}

          {/* Form Card */}
          <div className="card p-6">
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); saveTask() }}>
              {/* Row 1: Title, Project */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Title *</label>
                  <input
                    type="text"
                    className="input w-full"
                    placeholder="Task title"
                    value={task.title}
                    onChange={(e) => setTask((v) => ({ ...v, title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label">Project *</label>
                  <select
                    className="input w-full"
                    value={task.projectId}
                    onChange={(e) => {
                      const projectId = e.target.value
                      const project = projects.find((p) => p.id === projectId)
                      setTask((v) => ({
                        ...v,
                        projectId,
                        clientId: project?.clientId || "",
                        workOrderId: "",
                      }))
                    }}
                  >
                    <option value="">Select project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Work Order, Client */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Work Order</label>
                  <select
                    className="input w-full"
                    value={task.workOrderId}
                    onChange={(e) => setTask((v) => ({ ...v, workOrderId: e.target.value }))}
                    disabled={!task.projectId}
                  >
                    <option value="">Select work order</option>
                    {filteredWorkOrders.map((wo) => (
                      <option key={wo.id} value={wo.id}>
                        {wo.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Client</label>
                  <input
                    type="text"
                    className="input w-full bg-surface-100"
                    placeholder="Auto-filled from project"
                    value={selectedProject?.client || ""}
                    disabled
                  />
                </div>
              </div>

              {/* Row 3: Priority, Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Priority</label>
                  <select
                    className="input w-full"
                    value={task.priority}
                    onChange={(e) => setTask((v) => ({ ...v, priority: e.target.value as ProjectPriority }))}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="label">Status</label>
                  <select
                    className="input w-full"
                    value={task.status}
                    onChange={(e) => setTask((v) => ({ ...v, status: e.target.value as TaskStatus }))}
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Assignee, Due Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Assignee</label>
                  <input
                    type="text"
                    className="input w-full"
                    placeholder="Team member name"
                    value={task.assignee}
                    onChange={(e) => setTask((v) => ({ ...v, assignee: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label">Due Date</label>
                  <input
                    type="date"
                    className="input w-full"
                    value={task.dueDate}
                    onChange={(e) => setTask((v) => ({ ...v, dueDate: e.target.value }))}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-surface-200">
                <button
                  type="button"
                  onClick={() => router.push("/tasks")}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? "Creating..." : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
