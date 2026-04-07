"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { LayoutGrid, List, BarChart3, Clock } from "lucide-react";
import { Header } from "@/components/dashboard/header";
import { useApi } from "@/hooks/use-api";
import type { Project, ProjectStatus } from "@/types";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";

type ViewMode = "list" | "kanban" | "gantt" | "timeline";
type FilterStatus = "ALL" | ProjectStatus;

const STATUS_ORDER: ProjectStatus[] = [
  "PLANNING",
  "IN_PROGRESS",
  "ON_HOLD",
  "COMPLETED",
  "CANCELLED",
];

const STATUS_COLORS: Record<ProjectStatus, { bg: string; border: string; dot: string }> = {
  PLANNING: { bg: "bg-surface-50", border: "border-l-surface-400", dot: "bg-surface-400" },
  IN_PROGRESS: { bg: "bg-blue-50", border: "border-l-blue-500", dot: "bg-blue-500" },
  ON_HOLD: { bg: "bg-amber-50", border: "border-l-amber-500", dot: "bg-amber-500" },
  COMPLETED: { bg: "bg-emerald-50", border: "border-l-emerald-500", dot: "bg-emerald-500" },
  CANCELLED: { bg: "bg-red-50", border: "border-l-red-400", dot: "bg-red-400" },
};

const GANTT_COLORS: Record<ProjectStatus, string> = {
  PLANNING: "bg-surface-400",
  IN_PROGRESS: "bg-brand-600",
  ON_HOLD: "bg-amber-500",
  COMPLETED: "bg-emerald-500",
  CANCELLED: "bg-red-400",
};

export default function ProjectsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");
  const { data: projects, loading } = useApi<Project[]>("/api/projects", []);

  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    return projects.filter((p) => filterStatus === "ALL" || p.status === filterStatus);
  }, [projects, filterStatus]);

  const stats = useMemo(() => {
    if (!projects) return { total: 0, inProgress: 0, completed: 0, budget: 0 };
    return {
      total: projects.length,
      inProgress: projects.filter((p) => p.status === "IN_PROGRESS").length,
      completed: projects.filter((p) => p.status === "COMPLETED").length,
      budget: projects.reduce((sum, p) => sum + p.budget, 0),
    };
  }, [projects]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50">
        <Header title="Projects" action={{ label: "Add Project", href: "/projects/new" }} />
        <div className="flex items-center justify-center p-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <Header title="Projects" action={{ label: "Add Project", href: "/projects/new" }} />
      <div className="p-4 md:p-6">
        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <p className="text-2xs uppercase tracking-wider text-surface-500">Total Projects</p>
            <p className="mt-2 text-3xl font-bold text-surface-800">{stats.total}</p>
          </div>
          <div className="card p-4">
            <p className="text-2xs uppercase tracking-wider text-surface-500">In Progress</p>
            <p className="mt-2 text-3xl font-bold text-brand-600">{stats.inProgress}</p>
          </div>
          <div className="card p-4">
            <p className="text-2xs uppercase tracking-wider text-surface-500">Completed</p>
            <p className="mt-2 text-3xl font-bold text-emerald-600">{stats.completed}</p>
          </div>
          <div className="card p-4">
            <p className="text-2xs uppercase tracking-wider text-surface-500">Total Budget</p>
            <p className="mt-2 text-2xl font-bold text-surface-800">{formatCurrency(stats.budget)}</p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex gap-2 rounded-lg border border-surface-200 bg-white p-1">
            {[
              { mode: "list" as ViewMode, icon: List, label: "List" },
              { mode: "kanban" as ViewMode, icon: LayoutGrid, label: "Kanban" },
              { mode: "gantt" as ViewMode, icon: BarChart3, label: "Gantt" },
              { mode: "timeline" as ViewMode, icon: Clock, label: "Timeline" },
            ].map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`flex items-center gap-2 rounded px-3 py-2 text-sm font-medium transition-colors ${
                  viewMode === mode
                    ? "bg-brand-600 text-white"
                    : "text-surface-600 hover:text-surface-800"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="mb-6 flex gap-2 border-b border-surface-200 pb-0">
          {["ALL", ...STATUS_ORDER].map((status) => (
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

        {/* View Modes */}
        {viewMode === "list" && <ListView projects={filteredProjects} />}
        {viewMode === "kanban" && <KanbanView projects={filteredProjects} />}
        {viewMode === "gantt" && <GanttView projects={filteredProjects} allProjects={projects || []} />}
        {viewMode === "timeline" && <TimelineView projects={filteredProjects} />}
      </div>
    </div>
  );
}

// LIST VIEW
function ListView({ projects }: { projects: Project[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {projects.map((project) => (
        <Link
          key={project.id}
          href={`/projects/${project.id}`}
          className="card p-5 hover:shadow-md transition-shadow"
        >
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-surface-800">{project.name}</h3>
              <p className="text-sm text-surface-600">{project.client}</p>
            </div>
          </div>

          <div className="mb-4 flex gap-2">
            <span className={`inline-block rounded px-2 py-1 text-2xs font-semibold ${getStatusColor(project.status)}`}>
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

          <div className="mb-4">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs text-surface-600">Progress</span>
              <span className="text-xs font-semibold text-surface-700">{project.progress}%</span>
            </div>
            <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
              <div className="h-full bg-brand-600 transition-all" style={{ width: `${project.progress}%` }} />
            </div>
          </div>

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
                style={{ width: `${Math.min((project.spent / project.budget) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-surface-600">
            <span>{formatDate(project.startDate)}</span>
            <span>→</span>
            <span>{formatDate(project.deadline)}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

// KANBAN VIEW
function KanbanView({ projects }: { projects: Project[] }) {
  const columns = STATUS_ORDER.map((status) => ({
    status,
    projects: projects.filter((p) => p.status === status),
    count: projects.filter((p) => p.status === status).length,
  }));

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-6 pb-4">
        {columns.map((column) => (
          <div
            key={column.status}
            className={`flex-shrink-0 w-80 rounded-lg border border-surface-200 overflow-hidden ${STATUS_COLORS[column.status].bg}`}
          >
            <div className="border-b border-surface-200 bg-white px-4 py-3 flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${STATUS_COLORS[column.status].dot}`} />
              <h3 className="font-semibold text-surface-800 text-sm flex-1">{column.status.replace(/_/g, " ")}</h3>
              <span className="inline-flex items-center justify-center rounded-full bg-surface-100 px-2 py-0.5 text-xs font-semibold text-surface-700">
                {column.count}
              </span>
            </div>

            <div className="p-3 space-y-3">
              {column.projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className={`card p-3 border-l-4 hover:shadow-md transition-shadow ${STATUS_COLORS[column.status].border}`}
                >
                  <h4 className="font-medium text-sm text-surface-800 mb-1">{project.name}</h4>
                  <p className="text-xs text-surface-600 mb-2">{project.client}</p>

                  <div className="mb-2 flex gap-1">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-2xs font-semibold ${
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

                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-surface-600">Progress</span>
                      <span className="text-xs font-semibold text-surface-700">{project.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-surface-200 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-600" style={{ width: `${project.progress}%` }} />
                    </div>
                  </div>

                  <div className="text-xs text-surface-600">{formatCurrency(project.spent)} / {formatCurrency(project.budget)}</div>
                  <div className="text-xs text-surface-600 mt-1">
                    {formatDate(project.startDate)} → {formatDate(project.deadline)}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// GANTT VIEW
function GanttView({ projects, allProjects }: { projects: Project[]; allProjects: Project[] }) {
  const getDateRange = () => {
    if (allProjects.length === 0) {
      const today = new Date();
      return { start: today, end: new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000) };
    }

    const dates = allProjects.flatMap((p) => [new Date(p.startDate), new Date(p.deadline)]);
    const start = new Date(Math.min(...dates.map((d) => d.getTime())));
    const end = new Date(Math.max(...dates.map((d) => d.getTime())));

    start.setDate(start.getDate() - 7);
    end.setDate(end.getDate() + 7);

    return { start, end };
  };

  const { start: startDate, end: endDate } = getDateRange();
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
  const today = new Date();
  const todayOffset = Math.max(0, (today.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));

  const getProjectBar = (project: Project) => {
    const pStart = new Date(project.startDate);
    const pEnd = new Date(project.deadline);
    const barStart = Math.max(0, (pStart.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
    const barDuration = Math.ceil((pEnd.getTime() - pStart.getTime()) / (24 * 60 * 60 * 1000));
    const barWidth = Math.max((barDuration / totalDays) * 100, 2);
    const barLeft = (barStart / totalDays) * 100;

    return { barLeft, barWidth };
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-6 pb-4">
        <div className="flex-shrink-0 w-48">
          <div className="h-10 bg-white border-b border-surface-200 flex items-center px-3 font-semibold text-sm text-surface-800">
            Project
          </div>
          {projects.map((project) => (
            <div key={project.id} className="h-12 bg-surface-50 border-b border-surface-200 flex items-center px-3">
              <div>
                <p className="text-xs font-semibold text-surface-800">{project.name}</p>
                <p className="text-2xs text-surface-600">{project.client}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex-1 relative min-w-96">
          <div className="h-10 bg-white border-b border-surface-200 flex items-center relative">
            {Array.from({ length: Math.ceil(totalDays / 7) }).map((_, i) => {
              const date = new Date(startDate);
              date.setDate(date.getDate() + i * 7);
              return (
                <div key={i} className="flex-1 text-2xs text-surface-600 px-2 border-l border-surface-100">
                  {date.toLocaleDateString("nl-NL", { month: "short", day: "numeric" })}
                </div>
              );
            })}
          </div>

          {projects.map((project) => {
            const { barLeft, barWidth } = getProjectBar(project);
            return (
              <div key={project.id} className="h-12 bg-surface-50 border-b border-surface-200 relative">
                <div
                  className={`absolute top-2 h-8 rounded flex items-center px-2 text-white text-2xs font-semibold transition-all hover:shadow-md cursor-pointer ${
                    GANTT_COLORS[project.status]
                  }`}
                  style={{
                    left: `${barLeft}%`,
                    width: `${barWidth}%`,
                    opacity: 0.9,
                  }}
                  title={`${project.name} - ${project.progress}% complete`}
                >
                  <div className="absolute inset-0 bg-black opacity-10" style={{ width: `${project.progress}%` }} />
                  <span className="relative text-2xs font-semibold">{project.progress}%</span>
                </div>
              </div>
            );
          })}

          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 border-l border-red-400 pointer-events-none"
            style={{ left: `${(todayOffset / totalDays) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// TIMELINE VIEW
function TimelineView({ projects }: { projects: Project[] }) {
  const sortedProjects = [...projects].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  const groupedByMonth: Record<string, Project[]> = {};
  sortedProjects.forEach((project) => {
    const date = new Date(project.startDate);
    const monthKey = date.toLocaleDateString("nl-NL", { month: "long", year: "numeric" });
    if (!groupedByMonth[monthKey]) {
      groupedByMonth[monthKey] = [];
    }
    groupedByMonth[monthKey].push(project);
  });

  const months = Object.entries(groupedByMonth);

  return (
    <div className="space-y-8">
      {months.map(([month, monthProjects], monthIndex) => (
        <div key={month} className="relative">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-px h-12 bg-surface-300" />
            <h3 className="text-lg font-semibold text-surface-800 capitalize">{month}</h3>
          </div>

          <div className="space-y-3 ml-6 pl-6 border-l border-surface-200">
            {monthProjects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className={`card p-4 border-l-4 hover:shadow-md transition-shadow ${
                  STATUS_COLORS[project.status].border
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-surface-800">{project.name}</h4>
                    <p className="text-sm text-surface-600">{project.client}</p>
                  </div>
                  <span className={`inline-block rounded px-2 py-1 text-2xs font-semibold ${getStatusColor(project.status)}`}>
                    {project.status.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-3">
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
                  <span className="text-sm text-surface-600">
                    {formatDate(project.startDate)} → {formatDate(project.deadline)}
                  </span>
                </div>

                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-surface-600">Progress</span>
                    <span className="text-xs font-semibold text-surface-700">{project.progress}%</span>
                  </div>
                  <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-600" style={{ width: `${project.progress}%` }} />
                  </div>
                </div>

                <div className="text-xs text-surface-600">
                  {formatCurrency(project.spent)} / {formatCurrency(project.budget)}
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
