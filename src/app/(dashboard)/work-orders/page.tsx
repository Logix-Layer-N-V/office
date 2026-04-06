"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/dashboard/header";
import { useApi } from "@/hooks/use-api";
import type { WorkOrder, Client } from "@/types";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import { LayoutList, Grid3x3, GanttChart, Clock } from "lucide-react";

type FilterStatus = "ALL" | "COMPLETED" | "IN_PROGRESS" | "TODO";
type ViewMode = "list" | "kanban" | "gantt" | "timeline";

export default function WorkOrdersPage() {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const { data: workOrders, loading } = useApi<WorkOrder[]>("/api/work-orders", []);
  const { data: clients } = useApi<Client[]>("/api/clients", []);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50">
        <Header title="Work Orders" action={{ label: "New Work Order", href: "/work-orders/new" }} />
        <div className="flex items-center justify-center p-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  const mockWorkOrders = workOrders;
  const mockClients = clients;

  const filteredWorkOrders = mockWorkOrders.filter((wo) => {
    if (filterStatus === "ALL") return true;
    return wo.status === filterStatus;
  });

  const stats = {
    total: mockWorkOrders.length,
    todo: mockWorkOrders.filter((w) => w.status === "TODO").length,
    inProgress: mockWorkOrders.filter((w) => w.status === "IN_PROGRESS").length,
    completed: mockWorkOrders.filter((w) => w.status === "COMPLETED").length,
    totalRevenue: mockWorkOrders.reduce((sum, w) => sum + w.hours * w.rate, 0),
  };

  const getClientName = (clientId: string) => {
    return mockClients.find((c) => c.id === clientId)?.name || clientId;
  };

  const getStatusBorderColor = (status: string): string => {
    switch (status) {
      case "TODO":
        return "border-l-4 border-l-surface-300";
      case "IN_PROGRESS":
        return "border-l-4 border-l-blue-500";
      case "COMPLETED":
        return "border-l-4 border-l-emerald-500";
      default:
        return "border-l-4 border-l-surface-300";
    }
  };

  const getStatusBarColor = (status: string): string => {
    switch (status) {
      case "TODO":
        return "bg-surface-400";
      case "IN_PROGRESS":
        return "bg-brand-600";
      case "COMPLETED":
        return "bg-emerald-500";
      default:
        return "bg-surface-400";
    }
  };

  const getStatusBgColor = (status: string): string => {
    switch (status) {
      case "TODO":
        return "bg-surface-50";
      case "IN_PROGRESS":
        return "bg-blue-50";
      case "COMPLETED":
        return "bg-emerald-50";
      default:
        return "bg-surface-50";
    }
  };

  return (
    <div className="min-h-screen bg-surface-50">
      <Header title="Work Orders" action={{ label: "New Work Order", href: "/work-orders/new" }} />
      <div className="p-6">
        {/* Stats Row */}
        <div className="mb-6 grid grid-cols-5 gap-4">
          <div className="card p-4">
            <p className="text-xs font-semibold uppercase text-surface-600">Total Work Orders</p>
            <p className="mt-2 text-2xl font-bold text-surface-900">{stats.total}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs font-semibold uppercase text-surface-600">TODO</p>
            <p className="mt-2 text-2xl font-bold text-surface-900">{stats.todo}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs font-semibold uppercase text-surface-600">In Progress</p>
            <p className="mt-2 text-2xl font-bold text-surface-900">{stats.inProgress}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs font-semibold uppercase text-surface-600">Completed</p>
            <p className="mt-2 text-2xl font-bold text-surface-900">{stats.completed}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs font-semibold uppercase text-surface-600">Total Revenue</p>
            <p className="mt-2 text-xl font-bold text-surface-900">{formatCurrency(stats.totalRevenue)}</p>
          </div>
        </div>

        {/* View Mode Toggle & Filter Tabs */}
        <div className="mb-6 flex items-center justify-between">
          {/* View Mode Toggle */}
          <div className="flex gap-2 rounded-full bg-surface-100 p-1">
            {[
              { mode: "list" as ViewMode, icon: LayoutList, label: "List" },
              { mode: "kanban" as ViewMode, icon: Grid3x3, label: "Kanban" },
              { mode: "gantt" as ViewMode, icon: GanttChart, label: "Gantt" },
              { mode: "timeline" as ViewMode, icon: Clock, label: "Timeline" },
            ].map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  viewMode === mode
                    ? "bg-white text-brand-600 shadow-sm"
                    : "text-surface-600 hover:text-surface-800"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Status Filter Tabs (for list/kanban views) */}
          {(viewMode === "list" || viewMode === "kanban") && (
            <div className="flex gap-2 border-b border-surface-200">
              {["ALL", "TODO", "IN_PROGRESS", "COMPLETED"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status as FilterStatus)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    filterStatus === status
                      ? "border-b-2 border-brand-600 text-brand-600"
                      : "text-surface-600 hover:text-surface-800"
                  }`}
                >
                  {status.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* LIST VIEW */}
        {viewMode === "list" && (
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
                    Project
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-surface-600">
                    Client
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
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-surface-600">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredWorkOrders.map((wo) => (
                  <tr key={wo.id} className="border-b border-surface-100 hover:bg-surface-100">
                    <td className="px-4 py-3 text-sm font-semibold text-surface-800">{wo.number}</td>
                    <td className="px-4 py-3 text-sm text-surface-800">{wo.title}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/projects/${wo.projectId}`}
                        className="text-sm text-brand-600 hover:text-brand-700"
                      >
                        {wo.project}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-surface-800">{getClientName(wo.clientId)}</td>
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
                    <td className="px-4 py-3 text-sm font-semibold text-surface-800">{wo.hours}h</td>
                    <td className="px-4 py-3 text-sm font-semibold text-surface-800">
                      {formatCurrency(wo.hours * wo.rate)}
                    </td>
                    <td className="px-4 py-3 text-sm text-surface-600">
                      {formatDate(wo.date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* KANBAN VIEW */}
        {viewMode === "kanban" && (
          <div className="flex gap-6 overflow-x-auto pb-4">
            {["TODO", "IN_PROGRESS", "COMPLETED"].map((status) => {
              const statusWOs = filteredWorkOrders.filter((wo) => wo.status === (status as any));
              return (
                <div
                  key={status}
                  className={`flex flex-none flex-col gap-3 rounded-lg p-4 ${getStatusBgColor(status)} min-w-[300px]`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        status === "TODO"
                          ? "bg-surface-300"
                          : status === "IN_PROGRESS"
                            ? "bg-blue-500"
                            : "bg-emerald-500"
                      }`}
                    />
                    <h3 className="font-semibold text-surface-900">
                      {status.replace(/_/g, " ")} ({statusWOs.length})
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {statusWOs.map((wo) => (
                      <div
                        key={wo.id}
                        className={`card rounded-lg border border-surface-200 bg-white p-3 ${getStatusBorderColor(
                          status
                        )}`}
                      >
                        <p className="font-bold text-surface-900">{wo.number}</p>
                        <p className="mt-1 text-sm text-surface-700">{wo.title}</p>
                        <p className="mt-2 text-xs text-surface-600">{wo.project}</p>
                        <div className="mt-3 flex items-center justify-between border-t border-surface-100 pt-2">
                          <span className="text-xs font-medium text-surface-600">{wo.assignee}</span>
                          <span className="text-xs font-semibold text-surface-900">{wo.hours}h</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-surface-600">{formatDate(wo.date)}</span>
                          <span className="text-xs font-semibold text-brand-600">
                            {formatCurrency(wo.hours * wo.rate)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* GANTT VIEW */}
        {viewMode === "gantt" && (
          <div className="card overflow-x-auto">
            <div className="flex">
              {/* Left panel - WO info */}
              <div className="w-[200px] flex-shrink-0 border-r border-surface-200">
                <div className="sticky top-0 border-b border-surface-200 bg-surface-100 px-4 py-3">
                  <p className="text-xs font-semibold uppercase text-surface-600">Work Orders</p>
                </div>
                <div className="divide-y divide-surface-100">
                  {filteredWorkOrders.map((wo) => (
                    <div key={wo.id} className="border-b border-surface-100 px-4 py-3">
                      <p className="text-sm font-semibold text-surface-900">{wo.number}</p>
                      <p className="text-xs text-surface-600">{wo.title}</p>
                      <p className="mt-1 text-xs font-medium text-surface-700">{wo.assignee}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right panel - Timeline */}
              <div className="flex-1 min-w-[800px]">
                <div className="sticky top-0 border-b border-surface-200 bg-surface-100">
                  <div className="flex items-center gap-4 px-4 py-3">
                    <p className="text-xs font-semibold uppercase text-surface-600">Timeline</p>
                  </div>
                </div>
                <div className="relative">
                  {/* Today line */}
                  <div className="pointer-events-none absolute top-0 bottom-0 left-[calc(25%)]">
                    <div className="h-full w-0.5 border-l-2 border-dashed border-red-500" />
                    <span className="absolute -left-8 top-2 text-2xs font-semibold text-red-500">Today</span>
                  </div>

                  {/* Timeline bars */}
                  <div className="divide-y divide-surface-100">
                    {filteredWorkOrders.map((wo) => {
                      const woDate = new Date(wo.date);
                      const today = new Date();
                      const daysOffset = Math.floor(
                        (woDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
                      );
                      const position = Math.max(0, 25 + (daysOffset / 30) * 20);

                      return (
                        <div key={wo.id} className="relative h-12 px-4 py-2">
                          <div
                            className={`absolute top-1/2 h-6 w-12 -translate-y-1/2 rounded ${getStatusBarColor(
                              wo.status
                            )} opacity-75`}
                            style={{ left: `${position}%` }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TIMELINE VIEW */}
        {viewMode === "timeline" && (
          <div className="space-y-8">
            {(() => {
              const sortedWOs = [...filteredWorkOrders].sort(
                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
              );
              const grouped: Record<string, typeof sortedWOs> = {};

              sortedWOs.forEach((wo) => {
                const date = new Date(wo.date);
                const monthKey = date.toLocaleDateString("en-US", { year: "numeric", month: "long" });
                if (!grouped[monthKey]) grouped[monthKey] = [];
                grouped[monthKey].push(wo);
              });

              return Object.entries(grouped).map(([month, wos]) => (
                <div key={month}>
                  <h3 className="mb-4 text-lg font-bold text-surface-900">{month}</h3>
                  <div className="space-y-3">
                    {wos.map((wo) => (
                      <div
                        key={wo.id}
                        className={`card rounded-lg border border-surface-200 bg-white p-4 ${getStatusBorderColor(
                          wo.status
                        )}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-bold text-surface-900">{wo.number}</p>
                            <p className="mt-1 text-sm text-surface-700">{wo.title}</p>
                            <p className="mt-2 text-xs text-surface-600">
                              <Link
                                href={`/projects/${wo.projectId}`}
                                className="text-brand-600 hover:text-brand-700"
                              >
                                {wo.project}
                              </Link>
                            </p>
                          </div>
                          <span
                            className={`inline-block rounded px-2 py-1 text-2xs font-semibold ${getStatusColor(
                              wo.status
                            )}`}
                          >
                            {wo.status.replace(/_/g, " ")}
                          </span>
                        </div>
                        <div className="mt-3 flex items-center justify-between border-t border-surface-100 pt-3 text-xs text-surface-600">
                          <span>{wo.assignee}</span>
                          <span>
                            {wo.hours}h · {formatCurrency(wo.hours * wo.rate)}
                          </span>
                          <span>{formatDate(wo.date)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ));
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
