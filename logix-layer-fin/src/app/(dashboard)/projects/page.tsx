"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/dashboard/header";
import { useApi } from "@/hooks/use-api";
import type { Project } from "@/types";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";

type FilterStatus = "ALL" | "PLANNING" | "IN_PROGRESS" | "COMPLETED";

export default function ProjectsPage() {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");
  const { data: projects, loading } = useApi<Project[]>("/api/projects", []);

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

  const mockProjects = projects;

  const filteredProjects = mockProjects.filter((project) => {
    if (filterStatus === "ALL") return true;
    return project.status === filterStatus;
  });

  const totalBudget = mockProjects.reduce((sum, p) => sum + p.budget, 0);
  const inProgressCount = mockProjects.filter(
    (p) => p.status === "IN_PROGRESS"
  ).length;
  const completedCount = mockProjects.filter(
    (p) => p.status === "COMPLETED"
  ).length;

  return (
    <div className="min-h-screen bg-surface-50">
      <Header title="Projects" />
      <div className="p-6">
        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-4 gap-4">
          <div className="card">
            <p className="text-2xs uppercase tracking-wider text-surface-500">
              Total Projects
            </p>
            <p className="mt-2 text-3xl font-bold text-surface-800">
              {mockProjects.length}
            </p>
          </div>
          <div className="card">
            <p className="text-2xs uppercase tracking-wider text-surface-500">
              In Progress
            </p>
            <p className="mt-2 text-3xl font-bold text-surface-800">
              {inProgressCount}
            </p>
          </div>
          <div className="card">
            <p className="text-2xs uppercase tracking-wider text-surface-500">
              Completed
            </p>
            <p className="mt-2 text-3xl font-bold text-surface-800">
              {completedCount}
            </p>
          </div>
          <div className="card">
            <p className="text-2xs uppercase tracking-wider text-surface-500">
              Total Budget
            </p>
            <p className="mt-2 text-2xl font-bold text-surface-800">
              {formatCurrency(totalBudget)}
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2 border-b border-surface-200">
          {["ALL", "PLANNING", "IN_PROGRESS", "COMPLETED"].map((status) => (
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

        {/* Project Cards Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {filteredProjects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="card hover:shadow-md transition-shadow"
            >
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-surface-800">
                    {project.name}
                  </h3>
                  <p className="text-sm text-surface-600">{project.client}</p>
                </div>
              </div>

              <div className="mb-4 flex gap-2">
                <span
                  className={`inline-block rounded px-2 py-1 text-2xs font-semibold ${getStatusColor(
                    project.status
                  )}`}
                >
                  {project.status.replace(/_/g, " ")}
                </span>
                <span
                  className={`inline-block rounded px-2 py-1 text-2xs font-semibold ${
                    project.priority === "CRITICAL"
                      ? "bg-red-100 text-red-700"
                      : project.priority === "HIGH"
                        ? "bg-orange-100 text-orange-700"
                        : project.priority === "MEDIUM"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-surface-100 text-surface-700"
                  }`}
                >
                  {project.priority}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs text-surface-600">Progress</span>
                  <span className="text-xs font-semibold text-surface-700">
                    {project.progress}%
                  </span>
                </div>
                <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-600 transition-all"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              {/* Budget Bar */}
              <div className="mb-4">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs text-surface-600">Budget</span>
                  <span className="text-xs font-semibold text-surface-700">
                    {formatCurrency(project.spent)} / {formatCurrency(project.budget)}
                  </span>
                </div>
                <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 transition-all"
                    style={{
                      width: `${Math.min((project.spent / project.budget) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="flex items-center justify-between text-xs text-surface-600">
                <span>{formatDate(project.startDate)}</span>
                <span>→</span>
                <span>{formatDate(project.deadline)}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
