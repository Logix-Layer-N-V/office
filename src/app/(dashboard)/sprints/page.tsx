"use client"

import { useState } from "react"
import { Header } from "@/components/dashboard/header"
import {
  List,
  Columns3,
  BarChart3,
  Clock,
  Plus,
  Search,
  ChevronDown,
  Calendar,
  Target,
  Bug,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Users,
  ArrowRight,
} from "lucide-react"

// Types
interface Sprint {
  id: string
  name: string
  goal: string
  startDate: string
  endDate: string
  status: "PLANNING" | "ACTIVE" | "COMPLETED" | "CANCELLED"
  velocity: number
  capacity: number
}

interface SprintTask {
  id: string
  title: string
  description: string
  status: "BACKLOG" | "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE"
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  storyPoints: number
  assignee: string
  sprintId: string | null
  type: "STORY" | "BUG" | "TASK" | "EPIC"
  labels: string[]
  createdAt: string
  updatedAt: string
}

// Mock data
const mockSprints: Sprint[] = [
  {
    id: "s23",
    name: "Sprint 23",
    goal: "Close ledger automation & FP&A dashboards",
    startDate: "2026-03-17",
    endDate: "2026-03-31",
    status: "COMPLETED",
    velocity: 42,
    capacity: 40,
  },
  {
    id: "s24",
    name: "Sprint 24",
    goal: "Cash flow forecasting & budget variance tools",
    startDate: "2026-04-01",
    endDate: "2026-04-14",
    status: "ACTIVE",
    velocity: 38,
    capacity: 45,
  },
  {
    id: "s25",
    name: "Sprint 25",
    goal: "AP/AR automation & reconciliation framework",
    startDate: "2026-04-15",
    endDate: "2026-04-28",
    status: "PLANNING",
    velocity: 0,
    capacity: 43,
  },
]

const mockTasks: SprintTask[] = [
  // Sprint 24 (ACTIVE)
  {
    id: "t1",
    title: "Implement cash flow projection API",
    description: "Build REST endpoints for 12-month forecasts",
    status: "IN_PROGRESS",
    priority: "CRITICAL",
    storyPoints: 8,
    assignee: "Kento",
    sprintId: "s24",
    type: "STORY",
    labels: ["api", "cash-flow"],
    createdAt: "2026-03-28",
    updatedAt: "2026-04-02",
  },
  {
    id: "t2",
    title: "Fix budget variance calculation bug",
    description: "YoY comparison showing negative when should be positive",
    status: "IN_REVIEW",
    priority: "HIGH",
    storyPoints: 3,
    assignee: "David",
    sprintId: "s24",
    type: "BUG",
    labels: ["bug", "variance"],
    createdAt: "2026-03-29",
    updatedAt: "2026-04-03",
  },
  {
    id: "t3",
    title: "Design P&L dashboard layout",
    description: "Create wireframes and component hierarchy",
    status: "DONE",
    priority: "MEDIUM",
    storyPoints: 5,
    assignee: "Sarah",
    sprintId: "s24",
    type: "TASK",
    labels: ["design", "dashboard"],
    createdAt: "2026-03-20",
    updatedAt: "2026-04-01",
  },
  {
    id: "t4",
    title: "Add real-time expense tracking",
    description: "WebSocket integration for live updates",
    status: "TODO",
    priority: "MEDIUM",
    storyPoints: 5,
    assignee: "Lisa",
    sprintId: "s24",
    type: "STORY",
    labels: ["realtime", "expenses"],
    createdAt: "2026-03-31",
    updatedAt: "2026-04-02",
  },
  {
    id: "t5",
    title: "Write budget variance docs",
    description: "API documentation and formulas",
    status: "BACKLOG",
    priority: "LOW",
    storyPoints: 2,
    assignee: "Sarah",
    sprintId: "s24",
    type: "TASK",
    labels: ["documentation"],
    createdAt: "2026-04-01",
    updatedAt: "2026-04-02",
  },
  {
    id: "t6",
    title: "Monthly reconciliation portal (EPIC)",
    description: "Full AR/AP matching interface",
    status: "TODO",
    priority: "CRITICAL",
    storyPoints: 13,
    assignee: "Kento",
    sprintId: "s24",
    type: "EPIC",
    labels: ["epic", "reconciliation"],
    createdAt: "2026-03-15",
    updatedAt: "2026-04-02",
  },
  {
    id: "t7",
    title: "Optimize GL query performance",
    description: "Index missing ledger tables",
    status: "IN_PROGRESS",
    priority: "HIGH",
    storyPoints: 3,
    assignee: "David",
    sprintId: "s24",
    type: "TASK",
    labels: ["performance", "database"],
    createdAt: "2026-03-25",
    updatedAt: "2026-04-03",
  },
  {
    id: "t8",
    title: "Build expense category hierarchy",
    description: "Support 3-level category structure",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    storyPoints: 3,
    assignee: "Lisa",
    sprintId: "s24",
    type: "STORY",
    labels: ["expenses", "categories"],
    createdAt: "2026-03-22",
    updatedAt: "2026-04-03",
  },

  // Sprint 25 (PLANNING)
  {
    id: "t9",
    title: "AP automation rules engine",
    description: "Rule-based invoice matching",
    status: "BACKLOG",
    priority: "CRITICAL",
    storyPoints: 8,
    assignee: "Kento",
    sprintId: "s25",
    type: "STORY",
    labels: ["automation", "ap"],
    createdAt: "2026-03-20",
    updatedAt: "2026-04-02",
  },
  {
    id: "t10",
    title: "AR aging report enhancements",
    description: "Add drill-down and aging buckets",
    status: "BACKLOG",
    priority: "HIGH",
    storyPoints: 5,
    assignee: "Sarah",
    sprintId: "s25",
    type: "STORY",
    labels: ["reports", "ar"],
    createdAt: "2026-03-18",
    updatedAt: "2026-04-01",
  },
  {
    id: "t11",
    title: "Fix AR overdue date calculation",
    description: "Payment terms not applied correctly",
    status: "BACKLOG",
    priority: "HIGH",
    storyPoints: 2,
    assignee: "David",
    sprintId: "s25",
    type: "BUG",
    labels: ["bug", "ar"],
    createdAt: "2026-04-01",
    updatedAt: "2026-04-02",
  },
  {
    id: "t12",
    title: "Multi-currency support layer",
    description: "Handle FX conversion for consolidation",
    status: "BACKLOG",
    priority: "MEDIUM",
    storyPoints: 8,
    assignee: "Lisa",
    sprintId: "s25",
    type: "STORY",
    labels: ["currency", "consolidation"],
    createdAt: "2026-03-10",
    updatedAt: "2026-04-01",
  },

  // Backlog (no sprint assigned)
  {
    id: "t13",
    title: "Tax provision calculator",
    description: "Quarterly effective tax rate",
    status: "BACKLOG",
    priority: "CRITICAL",
    storyPoints: 8,
    assignee: "Kento",
    sprintId: null,
    type: "STORY",
    labels: ["tax", "calculations"],
    createdAt: "2026-02-28",
    updatedAt: "2026-04-02",
  },
  {
    id: "t14",
    title: "Intercompany transaction validation",
    description: "Flag mismatched IC entries",
    status: "BACKLOG",
    priority: "HIGH",
    storyPoints: 5,
    assignee: "Sarah",
    sprintId: null,
    type: "STORY",
    labels: ["intercompany", "validation"],
    createdAt: "2026-03-01",
    updatedAt: "2026-04-01",
  },
  {
    id: "t15",
    title: "Journal entry approval workflow",
    description: "Multi-level sign-off with comments",
    status: "BACKLOG",
    priority: "MEDIUM",
    storyPoints: 5,
    assignee: "David",
    sprintId: null,
    type: "STORY",
    labels: ["workflow", "approvals"],
    createdAt: "2026-03-05",
    updatedAt: "2026-04-01",
  },
  {
    id: "t16",
    title: "Cost center allocation rules",
    description: "Support tiered allocation logic",
    status: "BACKLOG",
    priority: "MEDIUM",
    storyPoints: 3,
    assignee: "Lisa",
    sprintId: null,
    type: "TASK",
    labels: ["allocations", "rules"],
    createdAt: "2026-03-12",
    updatedAt: "2026-04-02",
  },
  {
    id: "t17",
    title: "Fix consolidation rounding errors",
    description: "Variance from GL after rollup",
    status: "BACKLOG",
    priority: "HIGH",
    storyPoints: 3,
    assignee: "Kento",
    sprintId: null,
    type: "BUG",
    labels: ["bug", "consolidation"],
    createdAt: "2026-03-30",
    updatedAt: "2026-04-03",
  },
  {
    id: "t18",
    title: "Document revenue recognition policy",
    description: "ASC 606 compliance writeup",
    status: "BACKLOG",
    priority: "MEDIUM",
    storyPoints: 3,
    assignee: "Sarah",
    sprintId: null,
    type: "TASK",
    labels: ["documentation", "compliance"],
    createdAt: "2026-03-20",
    updatedAt: "2026-04-01",
  },
  {
    id: "t19",
    title: "Add audit trail logging",
    description: "Track all GL changes with who/when",
    status: "BACKLOG",
    priority: "MEDIUM",
    storyPoints: 5,
    assignee: "David",
    sprintId: null,
    type: "STORY",
    labels: ["logging", "audit"],
    createdAt: "2026-03-08",
    updatedAt: "2026-04-02",
  },
  {
    id: "t20",
    title: "Period-end balance sheet checklist",
    description: "Interactive review workflow",
    status: "BACKLOG",
    priority: "LOW",
    storyPoints: 3,
    assignee: "Lisa",
    sprintId: null,
    type: "TASK",
    labels: ["checklist", "close"],
    createdAt: "2026-03-25",
    updatedAt: "2026-04-01",
  },
  {
    id: "t21",
    title: "Accrual estimation tool",
    description: "Predictive monthly accruals",
    status: "BACKLOG",
    priority: "LOW",
    storyPoints: 5,
    assignee: "Kento",
    sprintId: null,
    type: "STORY",
    labels: ["accruals", "forecasting"],
    createdAt: "2026-02-20",
    updatedAt: "2026-04-01",
  },
]

const assigneeColors: Record<string, string> = {
  Kento: "bg-brand-600",
  Sarah: "bg-emerald-600",
  David: "bg-blue-600",
  Lisa: "bg-purple-600",
}

const typeConfig = {
  STORY: { icon: BookOpen, color: "text-blue-600", bg: "bg-blue-50", label: "Story" },
  BUG: { icon: Bug, color: "text-red-600", bg: "bg-red-50", label: "Bug" },
  TASK: { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50", label: "Task" },
  EPIC: { icon: Target, color: "text-purple-600", bg: "bg-purple-50", label: "Epic" },
}

const priorityColors = {
  CRITICAL: "border-l-red-600 bg-red-50",
  HIGH: "border-l-orange-500 bg-orange-50",
  MEDIUM: "border-l-amber-500 bg-amber-50",
  LOW: "border-l-surface-300 bg-surface-50",
}

const statusConfig = {
  BACKLOG: { label: "Backlog", color: "bg-surface-100 text-surface-700" },
  TODO: { label: "To Do", color: "bg-slate-100 text-slate-700" },
  IN_PROGRESS: { label: "In Progress", color: "bg-blue-100 text-blue-700" },
  IN_REVIEW: { label: "In Review", color: "bg-purple-100 text-purple-700" },
  DONE: { label: "Done", color: "bg-emerald-100 text-emerald-700" },
}

export default function SprintsPage() {
  const [activeTab, setActiveTab] = useState<"board" | "backlog" | "sprints" | "burndown" | "velocity">("board")
  const [activeSprint, setActiveSprint] = useState<Sprint>(mockSprints[1]) // Sprint 24 (ACTIVE)
  const [showCreateSprint, setShowCreateSprint] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const getTasksByStatus = (status: SprintTask["status"]) => {
    return mockTasks.filter((t) => t.status === status && t.sprintId === activeSprint.id)
  }

  const getBacklogTasks = () => {
    const backlog = mockTasks.filter((t) => t.sprintId === null)
    return backlog.sort((a, b) => {
      const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
  }

  const sprintProgress = (sprint: Sprint) => {
    const tasks = mockTasks.filter((t) => t.sprintId === sprint.id)
    const completedPoints = tasks.filter((t) => t.status === "DONE").reduce((sum, t) => sum + t.storyPoints, 0)
    const totalPoints = tasks.reduce((sum, t) => sum + t.storyPoints, 0)
    return totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0
  }

  const daysRemaining = (sprint: Sprint) => {
    const end = new Date(sprint.endDate)
    const today = new Date("2026-04-06")
    const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, diff)
  }

  const getCompletedPoints = (sprint: Sprint) => {
    return mockTasks
      .filter((t) => t.sprintId === sprint.id && t.status === "DONE")
      .reduce((sum, t) => sum + t.storyPoints, 0)
  }

  const getTotalPoints = (sprint: Sprint) => {
    return mockTasks.filter((t) => t.sprintId === sprint.id).reduce((sum, t) => sum + t.storyPoints, 0)
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <Header title="Scrum Board" />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-surface-200">
          {[
            { id: "board" as const, label: "Sprint Board", icon: Columns3 },
            { id: "backlog" as const, label: "Backlog", icon: List },
            { id: "sprints" as const, label: "Sprints", icon: Calendar },
            { id: "burndown" as const, label: "Burndown", icon: BarChart3 },
            { id: "velocity" as const, label: "Velocity", icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-brand-600 text-brand-600 font-medium"
                    : "border-transparent text-surface-600 hover:text-surface-900"
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* SPRINT BOARD TAB */}
        {activeTab === "board" && (
          <div className="space-y-6">
            {/* Sprint selector and info */}
            <div className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="label text-surface-600 text-sm">Current Sprint</label>
                    <div className="relative inline-block">
                      <select
                        value={activeSprint.id}
                        onChange={(e) => setActiveSprint(mockSprints.find((s) => s.id === e.target.value)!)}
                        className="input pr-10 py-2 font-medium"
                      >
                        {mockSprints.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-3 text-surface-500 pointer-events-none" />
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-surface-600">Status</div>
                  <div
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 ${
                      activeSprint.status === "ACTIVE"
                        ? "bg-emerald-100 text-emerald-700"
                        : activeSprint.status === "COMPLETED"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {activeSprint.status}
                  </div>
                </div>
              </div>

              {/* Sprint details grid */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4 pt-4 border-t border-surface-200">
                <div>
                  <div className="text-2xs text-surface-600 uppercase tracking-wide mb-1">Goal</div>
                  <p className="text-sm font-medium text-surface-900">{activeSprint.goal}</p>
                </div>
                <div>
                  <div className="text-2xs text-surface-600 uppercase tracking-wide mb-1">Dates</div>
                  <p className="text-sm text-surface-900">
                    {new Date(activeSprint.startDate).toLocaleDateString()} – {new Date(activeSprint.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <div className="text-2xs text-surface-600 uppercase tracking-wide mb-1">Days Left</div>
                  <p className="text-sm font-medium text-surface-900">{daysRemaining(activeSprint)} days</p>
                </div>
                <div>
                  <div className="text-2xs text-surface-600 uppercase tracking-wide mb-1">Points</div>
                  <p className="text-sm text-surface-900">
                    <span className="font-medium text-emerald-600">{getCompletedPoints(activeSprint)}</span> /{" "}
                    {getTotalPoints(activeSprint)}
                  </p>
                </div>
                <div>
                  <div className="text-2xs text-surface-600 uppercase tracking-wide mb-1">Progress</div>
                  <div className="w-full bg-surface-200 rounded h-2">
                    <div
                      className="bg-brand-600 h-2 rounded transition-all"
                      style={{ width: `${sprintProgress(activeSprint)}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-surface-900 mt-1">{sprintProgress(activeSprint)}%</p>
                </div>
              </div>
            </div>

            {/* Kanban board */}
            <div className="pb-4">
              <div className="grid grid-cols-5 gap-3">
                {[
                  { status: "BACKLOG" as const, label: "Backlog", bg: "bg-surface-50" },
                  { status: "TODO" as const, label: "To Do", bg: "bg-slate-50" },
                  { status: "IN_PROGRESS" as const, label: "In Progress", bg: "bg-blue-50" },
                  { status: "IN_REVIEW" as const, label: "In Review", bg: "bg-purple-50" },
                  { status: "DONE" as const, label: "Done", bg: "bg-emerald-50" },
                ].map((column) => {
                  const tasks = getTasksByStatus(column.status)
                  const points = tasks.reduce((sum, t) => sum + t.storyPoints, 0)
                  return (
                    <div key={column.status} className="min-w-0">
                      <div className={`card rounded-lg p-4 ${column.bg} h-fit`}>
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-surface-200">
                          <div>
                            <h3 className="font-semibold text-surface-900">{column.label}</h3>
                            <p className="text-2xs text-surface-600 mt-1">
                              {tasks.length} {tasks.length === 1 ? "task" : "tasks"} • {points} pts
                            </p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          {tasks.length === 0 ? (
                            <p className="text-sm text-surface-500 py-8 text-center">No tasks</p>
                          ) : (
                            tasks.map((task) => {
                              const TypeIcon = typeConfig[task.type].icon
                              return (
                                <div
                                  key={task.id}
                                  className={`card p-3 border-l-4 cursor-pointer hover:shadow-md transition-all ${priorityColors[task.priority]}`}
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2 flex-1">
                                      <TypeIcon size={14} className={typeConfig[task.type].color} />
                                      <span className="text-xs font-medium px-2 py-0.5 rounded text-white bg-surface-600">
                                        {task.storyPoints}
                                      </span>
                                    </div>
                                  </div>
                                  <p className="text-xs font-medium text-surface-900 mb-2 line-clamp-2">{task.title}</p>
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={`w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-medium ${assigneeColors[task.assignee]}`}
                                    >
                                      {task.assignee[0]}
                                    </div>
                                    {task.labels.length > 0 && (
                                      <span className="text-2xs px-2 py-0.5 rounded-full bg-surface-200 text-surface-700">
                                        {task.labels[0]}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* BACKLOG TAB */}
        {activeTab === "backlog" && (
          <div className="space-y-6">
            {/* Search and filter */}
            <div className="card p-4">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search size={18} className="absolute left-3 top-3 text-surface-500" />
                  <input
                    type="text"
                    placeholder="Search backlog..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input pl-10 py-2 w-full"
                  />
                </div>
              </div>
            </div>

            {/* Summary bar */}
            <div className="grid grid-cols-4 gap-4">
              <div className="card p-4">
                <div className="text-2xs text-surface-600 uppercase tracking-wide mb-2">Backlog Items</div>
                <p className="text-2xl font-bold text-surface-900">{getBacklogTasks().length}</p>
              </div>
              <div className="card p-4">
                <div className="text-2xs text-surface-600 uppercase tracking-wide mb-2">Total Points</div>
                <p className="text-2xl font-bold text-surface-900">
                  {getBacklogTasks().reduce((sum, t) => sum + t.storyPoints, 0)}
                </p>
              </div>
              <div className="card p-4">
                <div className="text-2xs text-surface-600 uppercase tracking-wide mb-2">High Priority</div>
                <p className="text-2xl font-bold text-red-600">
                  {getBacklogTasks().filter((t) => t.priority === "CRITICAL" || t.priority === "HIGH").length}
                </p>
              </div>
              <div className="card p-4">
                <div className="text-2xs text-surface-600 uppercase tracking-wide mb-2">Avg Complexity</div>
                <p className="text-2xl font-bold text-surface-900">
                  {(
                    getBacklogTasks().reduce((sum, t) => sum + t.storyPoints, 0) / (getBacklogTasks().length || 1)
                  ).toFixed(1)}
                </p>
              </div>
            </div>

            {/* Backlog table */}
            <div className="card">
              <div className="table-compact">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-surface-200 bg-surface-50">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-surface-900">Task</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-surface-900">Priority</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-surface-900">Type</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-surface-900">Points</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-surface-900">Assignee</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-surface-900">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getBacklogTasks()
                      .filter((t) => !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((task) => {
                        const TypeIcon = typeConfig[task.type].icon
                        return (
                          <tr key={task.id} className="border-b border-surface-100 hover:bg-surface-50 transition-colors">
                            <td className="px-6 py-4">
                              <p className="font-medium text-surface-900">{task.title}</p>
                              <p className="text-sm text-surface-600">{task.description}</p>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-block px-2 py-1 rounded text-sm font-medium ${
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
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <TypeIcon size={16} className={typeConfig[task.type].color} />
                                <span className="text-sm text-surface-900">{typeConfig[task.type].label}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold text-white bg-brand-600">
                                {task.storyPoints}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div
                                className={`w-8 h-8 rounded-full text-white text-sm flex items-center justify-center font-medium ${assigneeColors[task.assignee]}`}
                              >
                                {task.assignee[0]}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button className="text-brand-600 hover:text-brand-700 font-medium text-sm">Add to Sprint</button>
                            </td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SPRINTS TAB */}
        {activeTab === "sprints" && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={() => setShowCreateSprint(!showCreateSprint)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus size={18} />
                Create Sprint
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockSprints.map((sprint) => {
                const tasks = mockTasks.filter((t) => t.sprintId === sprint.id)
                const completedTasks = tasks.filter((t) => t.status === "DONE").length
                const inProgressTasks = tasks.filter((t) => t.status === "IN_PROGRESS").length
                const todoTasks = tasks.filter((t) => t.status === "TODO").length
                const points = tasks.reduce((sum, t) => sum + t.storyPoints, 0)

                return (
                  <div
                    key={sprint.id}
                    className={`card p-6 border-2 transition-all ${
                      sprint.status === "ACTIVE" ? "border-brand-600" : "border-surface-200"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-surface-900">{sprint.name}</h3>
                        <p className="text-sm text-surface-600 mt-1">{sprint.goal}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          sprint.status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-700"
                            : sprint.status === "COMPLETED"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {sprint.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4 py-4 border-y border-surface-200">
                      <div>
                        <div className="text-2xs text-surface-600 uppercase tracking-wide mb-1">Dates</div>
                        <p className="text-sm text-surface-900">
                          {new Date(sprint.startDate).toLocaleDateString()} – {new Date(sprint.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <div className="text-2xs text-surface-600 uppercase tracking-wide mb-1">Capacity</div>
                        <p className="text-sm text-surface-900">
                          {points} / {sprint.capacity} pts
                        </p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-2xs text-surface-600 uppercase font-medium">Progress</span>
                        <span className="text-sm font-semibold text-surface-900">{sprintProgress(sprint)}%</span>
                      </div>
                      <div className="w-full bg-surface-200 rounded h-2">
                        <div
                          className="bg-brand-600 h-2 rounded transition-all"
                          style={{ width: `${sprintProgress(sprint)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Task breakdown */}
                    <div className="flex gap-3 pt-4 border-t border-surface-200">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                        <span className="text-2xs text-surface-600">Done: {completedTasks}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-2xs text-surface-600">In Progress: {inProgressTasks}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-surface-400"></div>
                        <span className="text-2xs text-surface-600">To Do: {todoTasks}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* BURNDOWN TAB */}
        {activeTab === "burndown" && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div>
                <label className="label text-surface-600 text-sm">Sprint</label>
                <select
                  value={activeSprint.id}
                  onChange={(e) => setActiveSprint(mockSprints.find((s) => s.id === e.target.value)!)}
                  className="input py-2 font-medium"
                >
                  {mockSprints.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Burndown chart */}
            <div className="card p-6">
              <h3 className="text-lg font-bold text-surface-900 mb-6">Sprint Burndown</h3>
              <div className="overflow-x-auto">
                <svg viewBox="0 0 800 400" className="w-full h-auto border border-surface-200 rounded-lg bg-white">
                  {/* Grid lines */}
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <line
                      key={`h-${i}`}
                      x1="60"
                      y1={60 + (i * 300) / 5}
                      x2="750"
                      y2={60 + (i * 300) / 5}
                      stroke="#e5e7eb"
                      strokeWidth="1"
                      strokeDasharray="5,5"
                    />
                  ))}
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                    <line key={`v-${i}`} x1={60 + (i * 690) / 10} y1="60" x2={60 + (i * 690) / 10} y2="360" stroke="#e5e7eb" strokeWidth="1" />
                  ))}

                  {/* Axes */}
                  <line x1="60" y1="360" x2="750" y2="360" stroke="#000" strokeWidth="2" />
                  <line x1="60" y1="60" x2="60" y2="360" stroke="#000" strokeWidth="2" />

                  {/* Y-axis label */}
                  <text x="20" y="210" fontSize="12" fill="#666" textAnchor="end">
                    Points
                  </text>
                  <text x="55" y="375" fontSize="12" fill="#666">
                    0
                  </text>
                  <text x="55" y="285" fontSize="12" fill="#666">
                    25
                  </text>
                  <text x="55" y="195" fontSize="12" fill="#666">
                    50
                  </text>
                  <text x="55" y="105" fontSize="12" fill="#666">
                    75
                  </text>

                  {/* X-axis labels */}
                  {[0, 2, 4, 6, 8, 10].map((i) => (
                    <text key={`x-${i}`} x={60 + (i * 690) / 10} y="385" fontSize="12" fill="#666" textAnchor="middle">
                      Day {i + 1}
                    </text>
                  ))}

                  {/* Ideal burndown (dashed line from 80 to 0) */}
                  <polyline
                    points="60,120 750,360"
                    fill="none"
                    stroke="#999"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    opacity="0.6"
                  />

                  {/* Actual burndown (stepped line) */}
                  <polyline
                    points="60,120 120,120 180,150 240,150 300,180 360,180 420,210 480,210 540,240 600,240 660,270 720,300 750,300"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="3"
                  />

                  {/* Legend */}
                  <text x="60" y="30" fontSize="12" fill="#000" fontWeight="bold">
                    Ideal
                  </text>
                  <line x1="105" y1="24" x2="125" y2="24" stroke="#999" strokeWidth="2" strokeDasharray="5,5" />
                  <text x="400" y="30" fontSize="12" fill="#000" fontWeight="bold">
                    Actual
                  </text>
                  <line x1="445" y1="24" x2="465" y2="24" stroke="#2563eb" strokeWidth="2" />
                </svg>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="card p-4">
                <div className="text-2xs text-surface-600 uppercase tracking-wide mb-2">Total Points</div>
                <p className="text-2xl font-bold text-surface-900">{getTotalPoints(activeSprint)}</p>
              </div>
              <div className="card p-4">
                <div className="text-2xs text-surface-600 uppercase tracking-wide mb-2">Completed</div>
                <p className="text-2xl font-bold text-emerald-600">{getCompletedPoints(activeSprint)}</p>
              </div>
              <div className="card p-4">
                <div className="text-2xs text-surface-600 uppercase tracking-wide mb-2">Remaining</div>
                <p className="text-2xl font-bold text-orange-600">{getTotalPoints(activeSprint) - getCompletedPoints(activeSprint)}</p>
              </div>
              <div className="card p-4">
                <div className="text-2xs text-surface-600 uppercase tracking-wide mb-2">Burn Rate</div>
                <p className="text-2xl font-bold text-surface-900">
                  {(getCompletedPoints(activeSprint) / Math.max(1, 14 - daysRemaining(activeSprint))).toFixed(1)} pts/day
                </p>
              </div>
              <div className="card p-4">
                <div className="text-2xs text-surface-600 uppercase tracking-wide mb-2">Status</div>
                <p className={`text-lg font-bold ${sprintProgress(activeSprint) >= 75 ? "text-emerald-600" : "text-amber-600"}`}>
                  {sprintProgress(activeSprint) >= 75 ? "On Track" : "At Risk"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* VELOCITY TAB */}
        {activeTab === "velocity" && (
          <div className="space-y-6">
            {/* Velocity chart */}
            <div className="card p-6">
              <h3 className="text-lg font-bold text-surface-900 mb-6">Team Velocity Trend</h3>
              <div className="overflow-x-auto">
                <svg viewBox="0 0 900 350" className="w-full h-auto border border-surface-200 rounded-lg bg-white">
                  {/* Grid lines */}
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <line
                      key={`h-${i}`}
                      x1="80"
                      y1={40 + (i * 250) / 5}
                      x2="850"
                      y2={40 + (i * 250) / 5}
                      stroke="#e5e7eb"
                      strokeWidth="1"
                      strokeDasharray="5,5"
                    />
                  ))}

                  {/* Axes */}
                  <line x1="80" y1="290" x2="850" y2="290" stroke="#000" strokeWidth="2" />
                  <line x1="80" y1="40" x2="80" y2="290" stroke="#000" strokeWidth="2" />

                  {/* Y-axis label and ticks */}
                  <text x="25" y="165" fontSize="12" fill="#666" textAnchor="end">
                    Velocity
                  </text>
                  {[0, 10, 20, 30, 40, 50].map((val, i) => (
                    <g key={`y-${i}`}>
                      <line x1="75" y1={290 - (val * 250) / 50} x2="80" y2={290 - (val * 250) / 50} stroke="#000" strokeWidth="1" />
                      <text x="70" y={295 - (val * 250) / 50} fontSize="12" fill="#666" textAnchor="end">
                        {val}
                      </text>
                    </g>
                  ))}

                  {/* Average velocity line */}
                  <line
                    x1="80"
                    y1={290 - (38 * 250) / 50}
                    x2="850"
                    y2={290 - (38 * 250) / 50}
                    stroke="#666"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    opacity="0.5"
                  />
                  <text x="850" y={280 - (38 * 250) / 50} fontSize="11" fill="#666" textAnchor="start">
                    Avg: 38
                  </text>

                  {/* Bars - Commitment */}
                  {[
                    { sprint: "S18", committed: 35, completed: 33 },
                    { sprint: "S19", committed: 38, completed: 36 },
                    { sprint: "S20", committed: 40, completed: 40 },
                    { sprint: "S21", committed: 42, completed: 39 },
                    { sprint: "S22", committed: 41, completed: 42 },
                    { sprint: "S23", committed: 40, completed: 42 },
                  ].map((data, i) => {
                    const x = 130 + i * 110
                    const commitHeight = (data.committed * 250) / 50
                    const completeHeight = (data.completed * 250) / 50
                    return (
                      <g key={`bar-${i}`}>
                        {/* Committed (lighter) */}
                        <rect
                          x={x - 15}
                          y={290 - commitHeight}
                          width="25"
                          height={commitHeight}
                          fill="#93c5fd"
                          opacity="0.6"
                        />
                        {/* Completed (darker) */}
                        <rect x={x + 5} y={290 - completeHeight} width="25" height={completeHeight} fill="#2563eb" />
                        {/* Label */}
                        <text x={x + 5} y="310" fontSize="12" fill="#666" textAnchor="middle">
                          {data.sprint}
                        </text>
                      </g>
                    )
                  })}

                  {/* Legend */}
                  <rect x="80" y="20" width="15" height="15" fill="#2563eb" />
                  <text x="100" y="32" fontSize="12" fill="#000">
                    Completed
                  </text>
                  <rect x="250" y="20" width="15" height="15" fill="#93c5fd" opacity="0.6" />
                  <text x="270" y="32" fontSize="12" fill="#000">
                    Committed
                  </text>
                </svg>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card p-6">
                <div className="text-2xs text-surface-600 uppercase tracking-wide mb-3">Average Velocity</div>
                <p className="text-4xl font-bold text-brand-600">38</p>
                <p className="text-sm text-surface-600 mt-2">Last 6 sprints</p>
              </div>
              <div className="card p-6">
                <div className="text-2xs text-surface-600 uppercase tracking-wide mb-3">Best Sprint</div>
                <p className="text-4xl font-bold text-emerald-600">42</p>
                <p className="text-sm text-surface-600 mt-2">Sprint 23</p>
              </div>
              <div className="card p-6">
                <div className="text-2xs text-surface-600 uppercase tracking-wide mb-3">Trend</div>
                <p className="text-2xl font-bold text-emerald-600 flex items-center gap-2">
                  <ArrowRight size={20} className="transform -rotate-45" />
                  Improving
                </p>
                <p className="text-sm text-surface-600 mt-2">+2.3 pts/sprint</p>
              </div>
            </div>

            {/* Capacity planning */}
            <div className="card p-6">
              <h3 className="text-lg font-bold text-surface-900 mb-4">Capacity Planning</h3>
              <div className="bg-brand-50 border border-brand-200 rounded p-4">
                <p className="text-sm text-surface-900 mb-2">
                  Based on your average velocity of <span className="font-bold text-brand-600">38 points</span>, we recommend committing{" "}
                  <span className="font-bold text-brand-600">38–42 points</span> in your next sprint to maintain momentum while accounting for variation.
                </p>
                <p className="text-2xs text-surface-600 mt-3">
                  Current recommendation for Sprint 25: 40–43 points (your team is trending upward)
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
