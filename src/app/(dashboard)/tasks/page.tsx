"use client";

import { useState } from "react";
import { Header } from "@/components/dashboard/header";
import { useApi } from "@/hooks/use-api";
import type { Task } from "@/types";
import { formatDate, getStatusColor } from "@/lib/utils";
import {
  List,
  Columns3,
  GanttChart,
  Clock,
} from "lucide-react";

type ViewMode = "list" | "kanban" | "gantt" | "timeline";

interface KanbanColumn {
  status: "TODO" | "IN_PROGRESS" | "DONE";
  title: string;
  count: number;
  bgLight: string;
  bgDark: string;
  borderColor: string;
  dotColor: string;
}

export default function TasksPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const { data: tasks, loading } = useApi<Task[]>("/api/tasks", []);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50">
        <Header title="Tasks" action={{ label: "New Task", href: "/tasks/new" }} />
        <div className="flex items-center justify-center p-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  const taskList = tasks || [];

  // Stats
  const todoCount = taskList.filter((t) => t.status === "TODO").length;
  const inProgressCount = taskList.filter((t) => t.status === "IN_PROGRESS").length;
  const doneCount = taskList.filter((t) => t.status === "DONE").length;
  const totalCount = taskList.length;

  // Utility functions
  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "CRITICAL":
        return "bg-red-100 text-red-700";
      case "HIGH":
        return "bg-orange-100 text-orange-700";
      case "MEDIUM":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-surface-100 text-surface-700";
    }
  };

  const getPriorityBarColor = (priority: string) => {
    switch (priority) {
      case "CRITICAL":
        return "bg-red-500";
      case "HIGH":
        return "bg-orange-500";
      case "MEDIUM":
        return "bg-amber-500";
      default:
        return "bg-surface-400";
    }
  };

  const getStatusDotColor = (status: string) => {
    switch (status) {
      case "TODO":
        return "bg-surface-300";
      case "IN_PROGRESS":
        return "bg-blue-500";
      case "DONE":
        return "bg-emerald-500";
      default:
        return "bg-surface-300";
    }
  };

  const getStatusBorderColor = (status: string) => {
    switch (status) {
      case "TODO":
        return "border-l-surface-300";
      case "IN_PROGRESS":
        return "border-l-blue-500";
      case "DONE":
        return "border-l-emerald-500";
      default:
        return "border-l-surface-300";
    }
  };

  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getRelativeTime = (dueDate: string) => {
    const days = getDaysUntilDue(dueDate);
    if (days < 0) return `${Math.abs(days)} days overdue`;
    if (days === 0) return "Due today";
    if (days === 1) return "Due tomorrow";
    return `Due in ${days} days`;
  };

  const kanbanColumns: KanbanColumn[] = [
    {
      status: "TODO",
      title: "To Do",
      count: todoCount,
      bgLight: "surface-50",
      bgDark: "surface-100",
      borderColor: "border-surface-300",
      dotColor: "bg-surface-300",
    },
    {
      status: "IN_PROGRESS",
      title: "In Progress",
      count: inProgressCount,
      bgLight: "blue-50",
      bgDark: "blue-100",
      borderColor: "border-blue-500",
      dotColor: "bg-blue-500",
    },
    {
      status: "DONE",
      title: "Done",
      count: doneCount,
      bgLight: "emerald-50",
      bgDark: "emerald-100",
      borderColor: "border-emerald-500",
      dotColor: "bg-emerald-500",
    },
  ];

  const viewModes = [
    { mode: "list", label: "List", icon: List },
    { mode: "kanban", label: "Kanban", icon: Columns3 },
    { mode: "gantt", label: "Gantt", icon: GanttChart },
    { mode: "timeline", label: "Timeline", icon: Clock },
  ] as const;

  // Gantt calculations
  const calculateGanttDates = () => {
    if (taskList.length === 0) {
      const today = new Date();
      return { minDate: today, maxDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000) };
    }
    const allDates = taskList.map((t) => new Date(t.createdAt));
    const dueDates = taskList.map((t) => new Date(t.dueDate));
    const minDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...dueDates.map((d) => d.getTime())));
    return { minDate, maxDate };
  };

  const { minDate: ganttMinDate, maxDate: ganttMaxDate } = calculateGanttDates();
  const ganttTotalMs = ganttMaxDate.getTime() - ganttMinDate.getTime();

  // Timeline grouping
  const getWeekKey = (date: Date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    return startOfWeek.toISOString().split("T")[0];
  };

  const groupedByWeek = taskList.reduce(
    (acc, task) => {
      const weekKey = getWeekKey(new Date(task.dueDate));
      if (!acc[weekKey]) {
        acc[weekKey] = [];
      }
      acc[weekKey].push(task);
      return acc;
    },
    {} as Record<string, Task[]>
  );

  const sortedWeeks = Object.keys(groupedByWeek).sort();

  return (
    <div className="min-h-screen bg-surface-50">
      <Header title="Tasks" action={{ label: "New Task", href: "/tasks/new" }} />
      <div className="p-4 md:p-6">
        {/* Stats Row */}
        <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <p className="text-2xs font-semibold uppercase text-surface-600">Total Tasks</p>
            <p className="mt-2 text-2xl font-bold text-surface-900">{totalCount}</p>
          </div>
          <div className="card p-4">
            <p className="text-2xs font-semibold uppercase text-surface-600">To Do</p>
            <p className="mt-2 text-2xl font-bold text-surface-900">{todoCount}</p>
          </div>
          <div className="card p-4">
            <p className="text-2xs font-semibold uppercase text-surface-600">In Progress</p>
            <p className="mt-2 text-2xl font-bold text-surface-900">{inProgressCount}</p>
          </div>
          <div className="card p-4">
            <p className="text-2xs font-semibold uppercase text-surface-600">Done</p>
            <p className="mt-2 text-2xl font-bold text-surface-900">{doneCount}</p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="mb-6 flex gap-2">
          {viewModes.map(({ mode, label, icon: Icon }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode as ViewMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                viewMode === mode
                  ? "bg-brand-600 text-white"
                  : "bg-surface-200 text-surface-700 hover:bg-surface-300"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* List View */}
        {viewMode === "list" && (
          <div className="card overflow-x-auto">
            <table className="table-compact w-full">
              <thead>
                <tr className="border-b border-surface-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-surface-600">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-surface-600">
                    Project
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
                {taskList.map((task) => (
                  <tr key={task.id} className="border-b border-surface-100 hover:bg-surface-100 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-surface-800">{task.title}</td>
                    <td className="px-4 py-3 text-sm text-surface-700">{task.projectId}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded px-2 py-1 text-2xs font-semibold ${getPriorityBadgeColor(
                          task.priority
                        )}`}
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
                    <td className="px-4 py-3 text-sm text-surface-800">{task.assignee}</td>
                    <td className="px-4 py-3 text-sm text-surface-600">
                      {formatDate(task.dueDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Kanban View */}
        {viewMode === "kanban" && (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {kanbanColumns.map((column) => {
              const columnTasks = taskList.filter((t) => t.status === column.status);
              return (
                <div key={column.status} className="flex-shrink-0 w-80">
                  <div className={`bg-${column.bgLight} rounded-lg p-4`}>
                    {/* Column Header */}
                    <div className="mb-4 flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${column.dotColor}`} />
                      <h3 className="text-sm font-semibold text-surface-800">{column.title}</h3>
                      <span className="ml-auto inline-flex h-6 w-6 items-center justify-center rounded-full bg-surface-200 text-2xs font-bold text-surface-700">
                        {column.count}
                      </span>
                    </div>

                    {/* Cards */}
                    <div className="space-y-3">
                      {columnTasks.map((task) => (
                        <div
                          key={task.id}
                          className={`card p-3 border-l-4 ${column.borderColor} hover:shadow-md transition-shadow`}
                        >
                          <p
                            className={`text-sm font-medium text-surface-800 ${
                              column.status === "DONE" ? "line-through" : ""
                            }`}
                          >
                            {task.title}
                          </p>

                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-300 text-2xs font-bold text-surface-700">
                                {getInitial(task.assignee)}
                              </div>
                              <span className="text-2xs text-surface-600">{task.assignee}</span>
                            </div>
                            <span
                              className={`inline-block rounded px-2 py-1 text-2xs font-semibold ${getPriorityBadgeColor(
                                task.priority
                              )}`}
                            >
                              {task.priority}
                            </span>
                          </div>

                          <p className="mt-2 text-2xs text-surface-600">
                            {formatDate(task.dueDate)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Gantt View */}
        {viewMode === "gantt" && (
          <div className="card p-4">
            <h3 className="mb-6 text-lg font-semibold text-surface-800">Task Timeline</h3>
            <div className="overflow-x-auto">
              {/* Timeline Content */}
              <div className="min-w-max">
                {taskList.map((task) => {
                  const createdDate = new Date(task.createdAt);
                  const dueDate = new Date(task.dueDate);
                  const taskStartOffset = ((createdDate.getTime() - ganttMinDate.getTime()) / ganttTotalMs) * 100;
                  const taskDuration = ((dueDate.getTime() - createdDate.getTime()) / ganttTotalMs) * 100;

                  return (
                    <div key={task.id} className="mb-4 flex gap-4">
                      {/* Left Panel */}
                      <div className="w-48 flex-shrink-0">
                        <p className="truncate text-sm font-medium text-surface-800">{task.title}</p>
                        <p className="text-2xs text-surface-600">{task.assignee}</p>
                      </div>

                      {/* Right Panel - Timeline Bar */}
                      <div className="flex-1" style={{ minWidth: "600px" }}>
                        <div className="relative h-8 bg-surface-100 rounded">
                          {/* Bar */}
                          <div
                            className={`absolute top-1 h-6 rounded opacity-80 ${getPriorityBarColor(
                              task.priority
                            )} flex items-center px-2`}
                            style={{
                              left: `${Math.max(taskStartOffset, 0)}%`,
                              width: `${Math.max(Math.min(taskDuration, 100), 2)}%`,
                            }}
                            title={`${task.title}: ${formatDate(task.createdAt)} to ${formatDate(task.dueDate)}`}
                          >
                            <div
                              className={`h-2 w-2 rounded-full flex-shrink-0 ${getStatusDotColor(
                                task.status
                              )}`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Timeline View */}
        {viewMode === "timeline" && (
          <div className="space-y-6">
            {sortedWeeks.length === 0 ? (
              <div className="card p-8 text-center">
                <p className="text-surface-600">No tasks scheduled</p>
              </div>
            ) : (
              sortedWeeks.map((weekKey) => {
                const weekTasks = groupedByWeek[weekKey];
                const weekDate = new Date(weekKey);
                const weekEnd = new Date(weekDate.getTime() + 6 * 24 * 60 * 60 * 1000);
                const weekLabel = `${formatDate(weekDate)} - ${formatDate(weekEnd)}`;

                return (
                  <div key={weekKey}>
                    {/* Week Header */}
                    <div className="mb-4 flex items-center gap-4">
                      <div className="h-px flex-1 bg-surface-200" />
                      <p className="text-sm font-semibold text-surface-600">{weekLabel}</p>
                      <div className="h-px flex-1 bg-surface-200" />
                    </div>

                    {/* Tasks in Week */}
                    <div className="space-y-3">
                      {weekTasks.map((task) => (
                        <div key={task.id} className="flex gap-4">
                          {/* Left - Date Marker */}
                          <div className="w-24 flex-shrink-0 text-right">
                            <p className="text-2xs font-semibold text-surface-600">
                              {formatDate(task.dueDate)}
                            </p>
                            <p className="text-2xs text-surface-500">
                              {getRelativeTime(task.dueDate)}
                            </p>
                          </div>

                          {/* Right - Task Card */}
                          <div className="flex-1">
                            <div
                              className={`card p-4 border-l-4 ${getStatusBorderColor(
                                task.status
                              )} hover:shadow-md transition-shadow`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-surface-800">
                                    {task.title}
                                  </p>
                                  <p className="mt-1 text-2xs text-surface-600">
                                    {task.projectId}
                                  </p>
                                </div>

                                <div className="ml-4 flex gap-2">
                                  <span
                                    className={`inline-block rounded px-2 py-1 text-2xs font-semibold ${getPriorityBadgeColor(
                                      task.priority
                                    )}`}
                                  >
                                    {task.priority}
                                  </span>
                                  <span
                                    className={`inline-block rounded px-2 py-1 text-2xs font-semibold ${getStatusColor(
                                      task.status
                                    )}`}
                                  >
                                    {task.status.replace(/_/g, " ")}
                                  </span>
                                </div>
                              </div>

                              <div className="mt-3 flex items-center gap-2">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-300 text-2xs font-bold text-surface-700">
                                  {getInitial(task.assignee)}
                                </div>
                                <span className="text-2xs text-surface-600">
                                  {task.assignee}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
