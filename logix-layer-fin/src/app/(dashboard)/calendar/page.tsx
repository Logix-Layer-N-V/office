"use client";

import { useState } from "react";
import { Header } from "@/components/dashboard/header";
import { useApi } from "@/hooks/use-api";
import type { Invoice, Estimate, Proposal, Payment, Task } from "@/types";
import { formatDate } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

const customEvents = [
  {
    id: "ev1",
    title: "Team standup",
    date: "2026-04-06",
    type: "meeting",
    color: "bg-brand-500",
  },
  {
    id: "ev2",
    title: "Client call - BlockPay",
    date: "2026-04-08",
    type: "meeting",
    color: "bg-brand-500",
  },
  {
    id: "ev3",
    title: "Sprint review",
    date: "2026-04-10",
    type: "meeting",
    color: "bg-brand-500",
  },
  {
    id: "ev4",
    title: "Tax filing deadline",
    date: "2026-04-15",
    type: "deadline",
    color: "bg-red-500",
  },
  {
    id: "ev5",
    title: "Quarterly review",
    date: "2026-04-20",
    type: "meeting",
    color: "bg-brand-500",
  },
];

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: string;
  color: string;
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1)); // April 2026
  const { data: invoices, loading: loadingInv } = useApi<Invoice[]>("/api/invoices", []);
  const { data: estimates, loading: loadingEst } = useApi<Estimate[]>("/api/estimates", []);
  const { data: proposals, loading: loadingProp } = useApi<Proposal[]>("/api/proposals", []);
  const { data: payments, loading: loadingPay } = useApi<Payment[]>("/api/payments", []);
  const { data: tasks, loading: loadingTask } = useApi<Task[]>("/api/tasks", []);

  const loading = loadingInv || loadingEst || loadingProp || loadingPay || loadingTask;

  if (loading) {
    return (
      <div>
        <Header title="Calendar" subtitle="Schedule and track important dates" />
        <div className="flex items-center justify-center p-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  const mockInvoices = invoices;
  const mockEstimates = estimates;
  const mockProposals = proposals;
  const mockPayments = payments;
  const mockTasks = tasks;

  const today = new Date(2026, 3, 6);
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Aggregate events from mock data
  const getAllEvents = (): CalendarEvent[] => {
    const events: CalendarEvent[] = [...customEvents];

    // Invoice due dates - orange
    mockInvoices.forEach((invoice) => {
      const dueDateStr = invoice.dueDate;
      events.push({
        id: `inv-${invoice.id}`,
        title: `Invoice ${invoice.number}`,
        date: dueDateStr,
        type: "invoice",
        color: "bg-amber-500",
      });
    });

    // Estimate dates - blue
    mockEstimates.forEach((estimate) => {
      if (estimate.validUntil) {
        events.push({
          id: `est-${estimate.id}`,
          title: `Estimate ${estimate.number}`,
          date: estimate.validUntil,
          type: "estimate",
          color: "bg-blue-500",
        });
      }
    });

    // Proposal valid-until dates - purple
    mockProposals.forEach((proposal) => {
      if (proposal.validUntil) {
        events.push({
          id: `prop-${proposal.id}`,
          title: `Proposal: ${proposal.title}`,
          date: proposal.validUntil,
          type: "proposal",
          color: "bg-purple-500",
        });
      }
    });

    // Payment dates - green
    mockPayments.forEach((payment) => {
      events.push({
        id: `pay-${payment.id}`,
        title: `Payment received`,
        date: payment.receivedAt,
        type: "payment",
        color: "bg-green-500",
      });
    });

    // Task due dates - red/pink
    mockTasks.forEach((task) => {
      if (task.dueDate) {
        events.push({
          id: `task-${task.id}`,
          title: `Task: ${task.title}`,
          date: task.dueDate,
          type: "task",
          color: "bg-pink-500",
        });
      }
    });

    return events;
  };

  const allEvents = getAllEvents();

  // Get events for a specific date
  const getEventsForDate = (day: number): CalendarEvent[] => {
    const dateStr = `2026-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return allEvents.filter((event) => event.date === dateStr);
  };

  // Get days in month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Monday = 0

  // Calendar grid
  const days: (number | null)[] = [];
  for (let i = 0; i < adjustedFirstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const monthName = new Date(currentYear, currentMonth).toLocaleString("en-US", {
    month: "long",
  });

  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date(2026, 3, 6)); // April 6, 2026
  };

  return (
    <div>
      <Header title="Calendar" subtitle="Schedule and track important dates" />

      <div className="p-6 space-y-4">

        {/* Controls */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-surface-100 rounded-lg transition"
              >
                <ChevronLeft className="w-5 h-5 text-surface-600" />
              </button>

              <h2 className="text-2xl font-bold text-surface-900 min-w-[200px]">
                {monthName} {currentYear}
              </h2>

              <button
                onClick={nextMonth}
                className="p-2 hover:bg-surface-100 rounded-lg transition"
              >
                <ChevronRight className="w-5 h-5 text-surface-600" />
              </button>
            </div>

            <button onClick={goToToday} className="btn-primary">
              Today
            </button>
          </div>

          {/* View toggles */}
          <div className="flex gap-2 border-b border-surface-200 pb-4">
            <button className="px-4 py-2 rounded-lg font-medium text-brand-600 bg-brand-50 border border-brand-200">
              Month
            </button>
            <button className="px-4 py-2 rounded-lg font-medium text-surface-600 hover:bg-surface-100">
              Week
            </button>
            <button className="px-4 py-2 rounded-lg font-medium text-surface-600 hover:bg-surface-100">
              Day
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="card">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-0 border-b border-surface-200 mb-4">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div
                key={day}
                className="py-3 px-4 text-center text-sm font-semibold text-surface-600"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar cells */}
          <div className="grid grid-cols-7 gap-0">
            {weeks.map((week, weekIdx) =>
              week.map((day, dayIdx) => {
                const isToday =
                  day === today.getDate() &&
                  currentMonth === today.getMonth() &&
                  currentYear === today.getFullYear();

                const events = day ? getEventsForDate(day) : [];
                const displayedEvents = events.slice(0, 3);
                const moreCount = Math.max(0, events.length - 3);

                return (
                  <div
                    key={`${weekIdx}-${dayIdx}`}
                    className={`min-h-[120px] border border-surface-100 p-3 ${
                      isToday ? "ring-2 ring-brand-500 bg-brand-50" : "bg-white"
                    } ${day ? "hover:bg-surface-50 cursor-pointer transition" : "bg-surface-50"}`}
                  >
                    <div
                      className={`text-sm font-semibold mb-2 ${
                        isToday
                          ? "text-brand-600"
                          : day
                            ? "text-surface-900"
                            : "text-surface-300"
                      }`}
                    >
                      {day}
                    </div>

                    {day && (
                      <div className="space-y-1">
                        {displayedEvents.map((event) => (
                          <div
                            key={event.id}
                            className={`${event.color} text-white text-2xs px-2 py-1 rounded truncate font-medium`}
                          >
                            {event.title}
                          </div>
                        ))}
                        {moreCount > 0 && (
                          <div className="text-2xs text-brand-600 font-semibold px-2 hover:underline cursor-pointer">
                            +{moreCount} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
