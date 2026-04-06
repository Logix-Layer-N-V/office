"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { apiMutate, useApi } from "@/hooks/use-api"
import type { ProjectStatus, ProjectPriority, Client } from "@/types"
import { ArrowLeft, AlertCircle } from "lucide-react"
import { ClientSelect } from "@/components/ui/client-select"

export default function ProjectsNewPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { data: clients, refresh: refreshClients } = useApi<Client[]>("/api/clients", [])
  const [project, setProject] = useState({
    name: "",
    clientId: "",
    status: "PLANNING" as ProjectStatus,
    priority: "MEDIUM" as ProjectPriority,
    budget: 0,
    startDate: "",
    deadline: "",
    description: "",
  })

  const saveProject = async () => {
    if (!project.name || !project.clientId) {
      setError("Project Name and Client are required")
      return
    }

    setLoading(true)
    setError(null)

    try {
      await apiMutate("/api/projects", "POST", project)
      router.push("/projects")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-surface-50">
      {/* Header */}
      <header className="flex h-12 items-center border-b border-surface-200 bg-white px-6">
        <button
          onClick={() => router.push("/projects")}
          className="flex items-center gap-2 text-sm font-semibold text-surface-600 hover:text-surface-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto">
          {/* Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-surface-800">New Project</h1>
            <p className="text-sm text-surface-400 mt-1">Create a new project</p>
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
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); saveProject() }}>
              {/* Row 1: Project Name, Client */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Project Name *</label>
                  <input
                    type="text"
                    className="input w-full"
                    placeholder="Project name"
                    value={project.name}
                    onChange={(e) => setProject((v) => ({ ...v, name: e.target.value }))}
                  />
                </div>
                <ClientSelect
                  clients={clients}
                  value={project.clientId}
                  onChange={(id) => setProject((v) => ({ ...v, clientId: id }))}
                  onClientCreated={() => refreshClients()}
                  required
                />
              </div>

              {/* Row 2: Status, Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Status</label>
                  <select
                    className="input w-full"
                    value={project.status}
                    onChange={(e) => setProject((v) => ({ ...v, status: e.target.value as ProjectStatus }))}
                  >
                    <option value="PLANNING">Planning</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="ON_HOLD">On Hold</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="label">Priority</label>
                  <select
                    className="input w-full"
                    value={project.priority}
                    onChange={(e) => setProject((v) => ({ ...v, priority: e.target.value as ProjectPriority }))}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Budget, Start Date, Deadline */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label">Budget</label>
                  <input
                    type="number"
                    className="input w-full"
                    placeholder="0.00"
                    value={project.budget}
                    onChange={(e) => setProject((v) => ({ ...v, budget: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <label className="label">Start Date</label>
                  <input
                    type="date"
                    className="input w-full"
                    value={project.startDate}
                    onChange={(e) => setProject((v) => ({ ...v, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label">Deadline</label>
                  <input
                    type="date"
                    className="input w-full"
                    value={project.deadline}
                    onChange={(e) => setProject((v) => ({ ...v, deadline: e.target.value }))}
                  />
                </div>
              </div>

              {/* Row 4: Description (textarea) */}
              <div>
                <label className="label">Description</label>
                <textarea
                  className="input w-full"
                  rows={3}
                  placeholder="Project description..."
                  value={project.description}
                  onChange={(e) => setProject((v) => ({ ...v, description: e.target.value }))}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-surface-200">
                <button
                  type="button"
                  onClick={() => router.push("/projects")}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? "Creating..." : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
