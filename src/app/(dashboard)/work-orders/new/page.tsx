"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { apiMutate, useApi } from "@/hooks/use-api"
import type { WorkOrderStatus, Project, Client } from "@/types"
import { ArrowLeft, AlertCircle } from "lucide-react"
import { ClientSelect } from "@/components/ui/client-select"

export default function WorkOrdersNewPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { data: projects } = useApi<Project[]>("/api/projects", [])
  const { data: clients, refresh: refreshClients } = useApi<Client[]>("/api/clients", [])
  const [workOrder, setWorkOrder] = useState({
    title: "",
    projectId: "",
    clientId: "",
    assignee: "",
    hours: 0,
    rate: 65,
    status: "TODO" as WorkOrderStatus,
    date: "",
  })

  const selectedProject = projects.find((p) => p.id === workOrder.projectId)

  const saveWorkOrder = async () => {
    if (!workOrder.title || !workOrder.projectId) {
      setError("Title and Project are required")
      return
    }

    setLoading(true)
    setError(null)

    try {
      await apiMutate("/api/work-orders", "POST", workOrder)
      router.push("/work-orders")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create work order")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-surface-50">
      {/* Header */}
      <header className="flex h-12 items-center border-b border-surface-200 bg-white px-6">
        <button
          onClick={() => router.push("/work-orders")}
          className="flex items-center gap-2 text-sm font-semibold text-surface-600 hover:text-surface-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Work Orders
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto">
          {/* Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-surface-800">New Work Order</h1>
            <p className="text-sm text-surface-400 mt-1">Create a new work order</p>
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
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); saveWorkOrder() }}>
              {/* Row 1: Title, Project */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Title *</label>
                  <input
                    type="text"
                    className="input w-full"
                    placeholder="Work order title"
                    value={workOrder.title}
                    onChange={(e) => setWorkOrder((v) => ({ ...v, title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label">Project *</label>
                  <select
                    className="input w-full"
                    value={workOrder.projectId}
                    onChange={(e) => {
                      const projectId = e.target.value
                      const project = projects.find((p) => p.id === projectId)
                      setWorkOrder((v) => ({
                        ...v,
                        projectId,
                        clientId: project?.clientId || "",
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

              {/* Row 2: Client, Assignee */}
              <div className="grid grid-cols-2 gap-4">
                <ClientSelect
                  clients={clients}
                  value={workOrder.clientId}
                  onChange={(id) => setWorkOrder((v) => ({ ...v, clientId: id }))}
                  onClientCreated={() => refreshClients()}
                />
                <div>
                  <label className="label">Assignee</label>
                  <input
                    type="text"
                    className="input w-full"
                    placeholder="Team member name"
                    value={workOrder.assignee}
                    onChange={(e) => setWorkOrder((v) => ({ ...v, assignee: e.target.value }))}
                  />
                </div>
              </div>

              {/* Row 3: Hours, Rate, Status */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label">Hours</label>
                  <input
                    type="number"
                    className="input w-full"
                    placeholder="0"
                    step="0.5"
                    value={workOrder.hours}
                    onChange={(e) => setWorkOrder((v) => ({ ...v, hours: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <label className="label">Hourly Rate ($)</label>
                  <input
                    type="number"
                    className="input w-full"
                    placeholder="65"
                    step="0.01"
                    value={workOrder.rate}
                    onChange={(e) => setWorkOrder((v) => ({ ...v, rate: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <label className="label">Status</label>
                  <select
                    className="input w-full"
                    value={workOrder.status}
                    onChange={(e) => setWorkOrder((v) => ({ ...v, status: e.target.value as WorkOrderStatus }))}
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Date */}
              <div>
                <label className="label">Date</label>
                <input
                  type="date"
                  className="input w-full"
                  value={workOrder.date}
                  onChange={(e) => setWorkOrder((v) => ({ ...v, date: e.target.value }))}
                />
              </div>

              {/* Calculated Amount */}
              <div className="bg-brand-50 border border-brand-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-surface-800">Total Amount</span>
                  <span className="text-lg font-bold text-brand-700">
                    ${(workOrder.hours * workOrder.rate).toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-surface-600 mt-1">
                  {workOrder.hours}h × ${workOrder.rate.toFixed(2)}/h
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-surface-200">
                <button
                  type="button"
                  onClick={() => router.push("/work-orders")}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? "Creating..." : "Create Work Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
