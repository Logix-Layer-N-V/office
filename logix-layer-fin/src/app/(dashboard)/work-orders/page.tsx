"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/dashboard/header";
import { useApi } from "@/hooks/use-api";
import type { WorkOrder, Client } from "@/types";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";

type FilterStatus = "ALL" | "COMPLETED" | "IN_PROGRESS" | "TODO";

export default function WorkOrdersPage() {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");
  const { data: workOrders, loading } = useApi<WorkOrder[]>("/api/work-orders", []);
  const { data: clients } = useApi<Client[]>("/api/clients", []);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50">
        <Header title="Work Orders" />
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

  return (
    <div className="min-h-screen bg-surface-50">
      <Header title="Work Orders" />
      <div className="p-6">
        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2 border-b border-surface-200">
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

        {/* Work Orders Table */}
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
                  <td className="px-4 py-3 text-sm text-surface-800">{mockClients.find(c => c.id === wo.clientId)?.name || wo.clientId}</td>
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
      </div>
    </div>
  );
}
