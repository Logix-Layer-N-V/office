"use client";

import { useState } from "react";
import { Header } from "@/components/dashboard/header";
import { useApi } from "@/hooks/use-api";
import type { Task } from "@/types";
import { formatDate, getStatusColor } from "@/lib/utils";

type ViewMode = "list" | "kanban" | "gantt";

export default function TasksPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const { data: tasks, loading } = useApi<Task[]>("/api/tasks", []);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50">
        <Header title="Tasks" />
        <div className="flex items-center justify-center p-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  const mockTasks = tasks;

  const todoTasks = mockTasks.filter((t) => t.status === "TODO");
  const inProgressTasks = mockTasks.filter((t) => t.status === "IN_PROGRESS");
  const doneTasks = mockTasks.filter((t) => t.status === "DONE");

  const getPriorityColor = (priority: string) => {
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

  return (
    <div className="min-h-screen bg-surface-50">
      <Header title="Tasks" />
      <div className="p-6">
        {/* View Mode Toggle */}
        <div className="mb-6 flex gap-2">
          {["list", "kanban", "gantt"].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode as ViewMode)}
              className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                viewMode === mode
                  ? "bg-brand-600 text-white"
                  : "bg-surface-200 text-surface-700 hover:bg-surface-300"
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)} View
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
                {mockTasks.map((task) => (
                  <tr key={task.id} className="border-b border-surface-100 hover:bg-surface-100">
                    <td className="px-4 py-3 text-sm text-surface-800">{task.title}</td>
                    <td className="px-4 py-3 text-sm text-surface-700">{task.title}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded px-2 py-1 text-2xs font-semibold ${getPriorityColor(
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
          <div className="flex gap-4 overflow-x-auto">
            {/* TODO Column */}
            <div className="flex-shrink-0 w-80">
              <div className="card">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-surface-800">TODO</h3>
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-surface-200 text-2xs font-bold text-surface-700">
                    {todoTasks.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {todoTasks.map((task) => (
                    <div
                      key={task.id}
                      className="rounded border border-surface-200 bg-surface-50 p-3 hover:shadow-sm transition-shadow"
                    >
                      <p className="text-sm font-medium text-surface-800">{task.title}</p>
                      <p className="mt-1 text-2xs text-surface-600">{task.projectId}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span
                          className={`inline-block rounded px-2 py-1 text-2xs font-semibold ${getPriorityColor(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                        <span className="text-2xs text-surface-600">
                          {formatDate(task.dueDate)}
                        </span>
                      </div>
                      <p className="mt-2 text-2xs text-surface-700">{task.assignee}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* IN_PROGRESS Column */}
            <div className="flex-shrink-0 w-80">
              <div className="card">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-surface-800">IN PROGRESS</h3>
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-200 text-2xs font-bold text-blue-700">
                    {inProgressTasks.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {inProgressTasks.map((task) => (
                    <div
                      key={task.id}
                      className="rounded border border-blue-200 bg-blue-50 p-3 hover:shadow-sm transition-shadow"
                    >
                      <p className="text-sm font-medium text-surface-800">{task.title}</p>
                      <p className="mt-1 text-2xs text-surface-600">{task.projectId}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span
                          className={`inline-block rounded px-2 py-1 text-2xs font-semibold ${getPriorityColor(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                        <span className="text-2xs text-surface-600">
                          {formatDate(task.dueDate)}
                        </span>
                      </div>
                      <p className="mt-2 text-2xs text-surface-700">{task.assignee}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* DONE Column */}
            <div className="flex-shrink-0 w-80">
              <div className="card">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-surface-800">DONE</h3>
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-200 text-2xs font-bold text-green-700">
                    {doneTasks.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {doneTasks.map((task) => (
                    <div
                      key={task.id}
                      className="rounded border border-green-200 bg-green-50 p-3 hover:shadow-sm transition-shadow"
                    >
                      <p className="text-sm font-medium text-surface-800 line-through">
                        {task.title}
                      </p>
                      <p className="mt-1 text-2xs text-surface-600">{task.projectId}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span
                          className={`inline-block rounded px-2 py-1 text-2xs font-semibold ${getPriorityColor(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                        <span className="text-2xs text-surface-600">
                          {formatDate(task.dueDate)}
                        </span>
                      </div>
                      <p className="mt-2 text-2xs text-surface-700">{task.assignee}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Gantt View */}
        {viewMode === "gantt" && (
          <div className="card">
            <h2 className="mb-6 text-lg font-semibold text-surface-800">Task Timeline</h2>
            <div className="overflow-x-auto">
              {/* Timeline Header with weeks */}
              <div className="mb-6">
                <div className="flex gap-4">
                  <div className="w-40 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex gap-1 text-2xs font-semibold uppercase text-surface-600">
                      <div className="flex-1 text-center">Week 1</div>
                      <div className="flex-1 text-center">Week 2</div>
                      <div className="flex-1 text-center">Week 3</div>
                      <div className="flex-1 text-center">Week 4</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline Bars */}
              <div className="space-y-4">
                {mockTasks.map((task) => {
                  const createdDate = new Date(task.createdAt);
                  const dueDate = new Date(task.dueDate);

                  // Use a fixed time range for the gantt (e.g., 4 weeks from first task creation)
                  const allDates = mockTasks.map((t) => new Date(t.createdAt));
                  const minDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
                  const maxDate = new Date(
                    Math.max(
                      ...mockTasks.map((t) => new Date(t.dueDate).getTime())
                    )
                  );

                  const totalMs = maxDate.getTime() - minDate.getTime();
                  const taskStartOffset =
                    ((createdDate.getTime() - minDate.getTime()) / totalMs) * 100;
                  const taskDuration =
                    ((dueDate.getTime() - createdDate.getTime()) / totalMs) * 100;

                  return (
                    <div key={task.id} className="flex gap-4">
                      <div className="w-40 flex-shrink-0">
                        <p className="truncate text-sm font-medium text-surface-800">
                          {task.title}
                        </p>
                        <p className="text-2xs text-surface-600">{task.assignee}</p>
                      </div>
                      <div className="flex-1">
                        <div className="relative h-8 bg-surface-100 rounded">
                          <div
                            className={`absolute top-1 h-6 rounded opacity-80 ${getPriorityBarColor(
                              task.priority
                            )}`}
                            style={{
                              left: `${Math.max(taskStartOffset, 0)}%`,
                              width: `${Math.max(Math.min(taskDuration, 100), 1)}%`,
                            }}
                            title={`${task.title}: ${formatDate(task.createdAt)} to ${formatDate(task.dueDate)}`}
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
