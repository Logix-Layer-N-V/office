"use client"

import { useState, useMemo, useCallback } from "react"
import { Header } from "@/components/dashboard/header"
import { Modal } from "@/components/ui/modal"
import { useApi } from "@/hooks/use-api"
import type { Invoice, Estimate, Proposal, Payment, Task } from "@/types"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Trash2,
  Edit2,
  Calendar as CalIcon,
  X,
} from "lucide-react"

// ─── Types ──────────────────────────────────────────
type ViewMode = "month" | "week" | "day" | "year" | "custom"
type EventType = "meeting" | "deadline" | "invoice" | "estimate" | "proposal" | "payment" | "task" | "personal" | "reminder"

interface CalendarEvent {
  id: string
  title: string
  date: string        // YYYY-MM-DD
  time?: string       // HH:mm
  endTime?: string    // HH:mm
  type: EventType
  color: string
  description?: string
  editable?: boolean
}

// ─── Color map ──────────────────────────────────────
const EVENT_COLORS: Record<EventType, { bg: string; text: string; dot: string }> = {
  meeting:   { bg: "bg-brand-500", text: "text-white", dot: "bg-brand-500" },
  deadline:  { bg: "bg-red-500", text: "text-white", dot: "bg-red-500" },
  invoice:   { bg: "bg-amber-500", text: "text-white", dot: "bg-amber-500" },
  estimate:  { bg: "bg-blue-500", text: "text-white", dot: "bg-blue-500" },
  proposal:  { bg: "bg-purple-500", text: "text-white", dot: "bg-purple-500" },
  payment:   { bg: "bg-emerald-500", text: "text-white", dot: "bg-emerald-500" },
  task:      { bg: "bg-pink-500", text: "text-white", dot: "bg-pink-500" },
  personal:  { bg: "bg-cyan-500", text: "text-white", dot: "bg-cyan-500" },
  reminder:  { bg: "bg-orange-400", text: "text-white", dot: "bg-orange-400" },
}

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  meeting: "Meeting",
  deadline: "Deadline",
  invoice: "Invoice",
  estimate: "Estimate",
  proposal: "Proposal",
  payment: "Payment",
  task: "Task",
  personal: "Personal",
  reminder: "Reminder",
}

// ─── Helpers ────────────────────────────────────────
function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function getWeekDates(date: Date): Date[] {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day // monday start
  d.setDate(d.getDate() + diff)
  const week: Date[] = []
  for (let i = 0; i < 7; i++) {
    week.push(new Date(d))
    d.setDate(d.getDate() + 1)
  }
  return week
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const WEEKDAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

// ─── Component ──────────────────────────────────────
export default function CalendarPage() {
  const today = new Date()
  const [currentDate, setCurrentDate] = useState(new Date(today))
  const [view, setView] = useState<ViewMode>("month")
  const [customDays, setCustomDays] = useState(3)

  // Event modals
  const [showEventModal, setShowEventModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [eventForm, setEventForm] = useState({
    title: "",
    date: "",
    time: "09:00",
    endTime: "10:00",
    type: "meeting" as EventType,
    description: "",
    customColor: "" as string, // empty = use type default
  })

  // Color palette for custom event colors
  const COLOR_PALETTE = [
    { label: "Brand", value: "bg-brand-500" },
    { label: "Red", value: "bg-red-500" },
    { label: "Orange", value: "bg-orange-500" },
    { label: "Amber", value: "bg-amber-500" },
    { label: "Yellow", value: "bg-yellow-500" },
    { label: "Lime", value: "bg-lime-500" },
    { label: "Green", value: "bg-emerald-500" },
    { label: "Teal", value: "bg-teal-500" },
    { label: "Cyan", value: "bg-cyan-500" },
    { label: "Blue", value: "bg-blue-500" },
    { label: "Indigo", value: "bg-indigo-500" },
    { label: "Purple", value: "bg-purple-500" },
    { label: "Pink", value: "bg-pink-500" },
    { label: "Rose", value: "bg-rose-500" },
  ]

  // Custom events (user created)
  const [userEvents, setUserEvents] = useState<CalendarEvent[]>([
    { id: "ev1", title: "Team standup", date: "2026-04-06", time: "09:00", endTime: "09:30", type: "meeting", color: "bg-brand-500", editable: true },
    { id: "ev2", title: "Client call - BlockPay", date: "2026-04-08", time: "14:00", endTime: "15:00", type: "meeting", color: "bg-brand-500", editable: true },
    { id: "ev3", title: "Sprint review", date: "2026-04-10", time: "10:00", endTime: "11:00", type: "meeting", color: "bg-brand-500", editable: true },
    { id: "ev4", title: "Tax filing deadline", date: "2026-04-15", type: "deadline", color: "bg-red-500", editable: true },
    { id: "ev5", title: "Quarterly review", date: "2026-04-20", time: "13:00", endTime: "14:00", type: "meeting", color: "bg-brand-500", editable: true },
  ])

  // API data
  const { data: invoices } = useApi<Invoice[]>("/api/invoices", [])
  const { data: estimates } = useApi<Estimate[]>("/api/estimates", [])
  const { data: proposals } = useApi<Proposal[]>("/api/proposals", [])
  const { data: payments } = useApi<Payment[]>("/api/payments", [])
  const { data: tasks } = useApi<Task[]>("/api/tasks", [])

  // ─── Aggregate all events ─────────────────────────
  const allEvents = useMemo<CalendarEvent[]>(() => {
    const events: CalendarEvent[] = [...userEvents]

    invoices.forEach((inv) => {
      if (inv.dueDate) events.push({ id: `inv-${inv.id}`, title: `Invoice ${inv.number}`, date: inv.dueDate, type: "invoice", color: EVENT_COLORS.invoice.bg })
    })
    estimates.forEach((est) => {
      if (est.validUntil) events.push({ id: `est-${est.id}`, title: `Estimate ${est.number}`, date: est.validUntil, type: "estimate", color: EVENT_COLORS.estimate.bg })
    })
    proposals.forEach((prop) => {
      if (prop.validUntil) events.push({ id: `prop-${prop.id}`, title: `Proposal: ${prop.title}`, date: prop.validUntil, type: "proposal", color: EVENT_COLORS.proposal.bg })
    })
    payments.forEach((pay) => {
      if (pay.receivedAt) events.push({ id: `pay-${pay.id}`, title: "Payment received", date: pay.receivedAt, type: "payment", color: EVENT_COLORS.payment.bg })
    })
    tasks.forEach((task) => {
      if (task.dueDate) events.push({ id: `task-${task.id}`, title: `Task: ${task.title}`, date: task.dueDate, type: "task", color: EVENT_COLORS.task.bg })
    })

    return events
  }, [userEvents, invoices, estimates, proposals, payments, tasks])

  const getEventsForDate = useCallback(
    (dateStr: string) => allEvents.filter((e) => e.date === dateStr),
    [allEvents]
  )

  // ─── Navigation ───────────────────────────────────
  const navigate = (dir: -1 | 1) => {
    const d = new Date(currentDate)
    if (view === "month") d.setMonth(d.getMonth() + dir)
    else if (view === "week") d.setDate(d.getDate() + dir * 7)
    else if (view === "day") d.setDate(d.getDate() + dir)
    else if (view === "year") d.setFullYear(d.getFullYear() + dir)
    else if (view === "custom") d.setDate(d.getDate() + dir * customDays)
    setCurrentDate(d)
  }

  const goToday = () => setCurrentDate(new Date(today))

  const headerLabel = () => {
    if (view === "year") return `${currentDate.getFullYear()}`
    if (view === "month") return currentDate.toLocaleString("en-US", { month: "long", year: "numeric" })
    if (view === "week") {
      const week = getWeekDates(currentDate)
      const s = week[0]
      const e = week[6]
      return `${s.toLocaleDateString("en-US", { month: "short", day: "numeric" })} — ${e.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
    }
    if (view === "day") return currentDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
    if (view === "custom") {
      const end = new Date(currentDate)
      end.setDate(end.getDate() + customDays - 1)
      return `${currentDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} — ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
    }
    return ""
  }

  // ─── Event CRUD ───────────────────────────────────
  const openCreateEvent = (dateStr: string) => {
    setEditingEvent(null)
    setEventForm({ title: "", date: dateStr, time: "09:00", endTime: "10:00", type: "meeting", description: "", customColor: "" })
    setShowEventModal(true)
  }

  const openEditEvent = (event: CalendarEvent) => {
    if (!event.editable) return
    setEditingEvent(event)
    setEventForm({
      title: event.title,
      date: event.date,
      time: event.time || "09:00",
      endTime: event.endTime || "10:00",
      type: event.type,
      description: event.description || "",
      customColor: event.color || "",
    })
    setShowEventModal(true)
  }

  const saveEvent = () => {
    if (!eventForm.title || !eventForm.date) return
    const color = eventForm.customColor || EVENT_COLORS[eventForm.type]?.bg || "bg-brand-500"

    if (editingEvent) {
      setUserEvents((prev) =>
        prev.map((e) =>
          e.id === editingEvent.id
            ? { ...e, title: eventForm.title, date: eventForm.date, time: eventForm.time, endTime: eventForm.endTime, type: eventForm.type, color, description: eventForm.description }
            : e
        )
      )
    } else {
      const newEvent: CalendarEvent = {
        id: `user-${Date.now()}`,
        title: eventForm.title,
        date: eventForm.date,
        time: eventForm.time,
        endTime: eventForm.endTime,
        type: eventForm.type,
        color,
        description: eventForm.description,
        editable: true,
      }
      setUserEvents((prev) => [...prev, newEvent])
    }
    setShowEventModal(false)
  }

  const deleteEvent = () => {
    if (!editingEvent) return
    setUserEvents((prev) => prev.filter((e) => e.id !== editingEvent.id))
    setShowEventModal(false)
  }

  // ─── Month Grid ───────────────────────────────────
  const MonthView = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDay = new Date(year, month, 1).getDay()
    const offset = firstDay === 0 ? 6 : firstDay - 1

    const prevMonthDays = new Date(year, month, 0).getDate()
    const cells: { day: number; currentMonth: boolean; dateStr: string }[] = []

    // Prev month fill
    for (let i = offset - 1; i >= 0; i--) {
      const d = prevMonthDays - i
      const m = month === 0 ? 12 : month
      const y = month === 0 ? year - 1 : year
      cells.push({ day: d, currentMonth: false, dateStr: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}` })
    }
    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, currentMonth: true, dateStr: `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}` })
    }
    // Next month fill
    const remaining = 42 - cells.length
    for (let d = 1; d <= remaining; d++) {
      const m = month + 2 > 12 ? 1 : month + 2
      const y = month + 2 > 12 ? year + 1 : year
      cells.push({ day: d, currentMonth: false, dateStr: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}` })
    }

    const weeks: typeof cells[] = []
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))

    return (
      <div className="card overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-7 bg-surface-50 border-b border-surface-200">
          {WEEKDAYS_SHORT.map((d) => (
            <div key={d} className="px-2 py-2.5 text-center text-2xs font-semibold uppercase tracking-wider text-surface-500">
              {d}
            </div>
          ))}
        </div>
        {/* Weeks */}
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 border-b border-surface-100 last:border-b-0">
            {week.map((cell, ci) => {
              const cellDate = new Date(cell.dateStr)
              const isToday = isSameDay(cellDate, today)
              const events = getEventsForDate(cell.dateStr)
              const shown = events.slice(0, 3)
              const more = events.length - 3

              return (
                <div
                  key={ci}
                  className={`min-h-[110px] border-r border-surface-100 last:border-r-0 p-1.5 transition-colors cursor-pointer ${
                    isToday ? "bg-brand-50/50" : cell.currentMonth ? "bg-white hover:bg-surface-50" : "bg-surface-50/50"
                  }`}
                  onDoubleClick={() => openCreateEvent(cell.dateStr)}
                >
                  <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium mb-1 ${
                    isToday ? "bg-brand-600 text-white" : cell.currentMonth ? "text-surface-800" : "text-surface-400"
                  }`}>
                    {cell.day}
                  </div>
                  <div className="space-y-0.5">
                    {shown.map((ev) => (
                      <button
                        key={ev.id}
                        onClick={(e) => { e.stopPropagation(); openEditEvent(ev) }}
                        className={`w-full text-left ${EVENT_COLORS[ev.type]?.bg || ev.color} ${EVENT_COLORS[ev.type]?.text || "text-white"} text-2xs px-1.5 py-0.5 rounded truncate font-medium hover:opacity-80 transition-opacity`}
                      >
                        {ev.time && <span className="opacity-75">{ev.time} </span>}
                        {ev.title}
                      </button>
                    ))}
                    {more > 0 && (
                      <div className="text-2xs text-brand-600 font-medium px-1.5 cursor-pointer hover:underline">
                        +{more} more
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    )
  }

  // ─── Week View ────────────────────────────────────
  const WeekView = () => {
    const weekDates = getWeekDates(currentDate)

    return (
      <div className="card overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-8 border-b border-surface-200 bg-surface-50">
          <div className="px-2 py-2 text-2xs text-surface-400 border-r border-surface-200" />
          {weekDates.map((d, i) => {
            const isToday = isSameDay(d, today)
            return (
              <div key={i} className={`px-2 py-2 text-center border-r border-surface-100 last:border-r-0 ${isToday ? "bg-brand-50" : ""}`}>
                <div className="text-2xs font-medium text-surface-500 uppercase">{WEEKDAYS_SHORT[i]}</div>
                <div className={`text-lg font-bold mt-0.5 ${isToday ? "text-brand-600" : "text-surface-800"}`}>{d.getDate()}</div>
              </div>
            )
          })}
        </div>
        {/* All-day events row */}
        <div className="grid grid-cols-8 border-b border-surface-200 min-h-[36px]">
          <div className="px-2 py-1 text-2xs text-surface-400 border-r border-surface-200 flex items-center">All day</div>
          {weekDates.map((d, i) => {
            const dateStr = toDateStr(d)
            const allDay = getEventsForDate(dateStr).filter((e) => !e.time)
            return (
              <div key={i} className="px-1 py-1 border-r border-surface-100 last:border-r-0 space-y-0.5" onDoubleClick={() => openCreateEvent(dateStr)}>
                {allDay.map((ev) => (
                  <button key={ev.id} onClick={() => openEditEvent(ev)} className={`w-full text-left ${ev.color} text-white text-2xs px-1.5 py-0.5 rounded truncate font-medium hover:opacity-80`}>
                    {ev.title}
                  </button>
                ))}
              </div>
            )
          })}
        </div>
        {/* Time grid */}
        <div className="max-h-[600px] overflow-y-auto">
          {HOURS.map((hour) => (
            <div key={hour} className="grid grid-cols-8 border-b border-surface-100 min-h-[48px]">
              <div className="px-2 py-1 text-2xs text-surface-400 border-r border-surface-200 text-right pr-3">
                {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
              </div>
              {weekDates.map((d, i) => {
                const dateStr = toDateStr(d)
                const hourStr = String(hour).padStart(2, "0")
                const events = getEventsForDate(dateStr).filter((e) => e.time?.startsWith(hourStr))
                const isToday = isSameDay(d, today)
                return (
                  <div
                    key={i}
                    className={`px-1 py-0.5 border-r border-surface-100 last:border-r-0 ${isToday ? "bg-brand-50/30" : ""} hover:bg-surface-50 cursor-pointer`}
                    onDoubleClick={() => {
                      setEventForm((f) => ({ ...f, date: dateStr, time: `${hourStr}:00`, endTime: `${String(hour + 1).padStart(2, "0")}:00` }))
                      openCreateEvent(dateStr)
                    }}
                  >
                    {events.map((ev) => (
                      <button key={ev.id} onClick={() => openEditEvent(ev)} className={`w-full text-left ${ev.color} text-white text-2xs px-1.5 py-1 rounded truncate font-medium mb-0.5 hover:opacity-80`}>
                        {ev.time} {ev.title}
                      </button>
                    ))}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ─── Day View ─────────────────────────────────────
  const DayView = () => {
    const dateStr = toDateStr(currentDate)
    const dayEvents = getEventsForDate(dateStr)
    const allDay = dayEvents.filter((e) => !e.time)
    const isToday = isSameDay(currentDate, today)

    return (
      <div className="card overflow-hidden">
        {/* Header */}
        <div className={`px-4 py-3 border-b border-surface-200 ${isToday ? "bg-brand-50" : "bg-surface-50"}`}>
          <div className="text-2xs font-medium text-surface-500 uppercase">{currentDate.toLocaleDateString("en-US", { weekday: "long" })}</div>
          <div className={`text-2xl font-bold ${isToday ? "text-brand-600" : "text-surface-800"}`}>{currentDate.getDate()}</div>
        </div>
        {/* All-day */}
        {allDay.length > 0 && (
          <div className="px-4 py-2 border-b border-surface-200 bg-surface-50/50 space-y-1">
            <span className="text-2xs text-surface-400 font-medium">All day</span>
            {allDay.map((ev) => (
              <button key={ev.id} onClick={() => openEditEvent(ev)} className={`block w-full text-left ${ev.color} text-white text-xs px-3 py-1.5 rounded font-medium hover:opacity-80`}>
                {ev.title}
              </button>
            ))}
          </div>
        )}
        {/* Time slots */}
        <div className="max-h-[600px] overflow-y-auto">
          {HOURS.map((hour) => {
            const hourStr = String(hour).padStart(2, "0")
            const events = dayEvents.filter((e) => e.time?.startsWith(hourStr))
            return (
              <div
                key={hour}
                className="flex border-b border-surface-100 min-h-[56px] hover:bg-surface-50 cursor-pointer"
                onDoubleClick={() => openCreateEvent(dateStr)}
              >
                <div className="w-20 flex-shrink-0 px-3 py-2 text-xs text-surface-400 text-right border-r border-surface-200">
                  {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
                </div>
                <div className="flex-1 px-2 py-1 space-y-0.5">
                  {events.map((ev) => (
                    <button key={ev.id} onClick={() => openEditEvent(ev)} className={`w-full text-left ${ev.color} text-white text-xs px-3 py-2 rounded font-medium hover:opacity-80 transition-opacity`}>
                      <span className="opacity-75">{ev.time}{ev.endTime ? ` — ${ev.endTime}` : ""}</span>{" "}
                      {ev.title}
                      {ev.description && <p className="text-2xs opacity-75 mt-0.5">{ev.description}</p>}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ─── Year View ────────────────────────────────────
  const YearView = () => {
    const year = currentDate.getFullYear()

    return (
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 12 }, (_, monthIdx) => {
          const daysInMonth = new Date(year, monthIdx + 1, 0).getDate()
          const firstDay = new Date(year, monthIdx, 1).getDay()
          const offset = firstDay === 0 ? 6 : firstDay - 1

          return (
            <div
              key={monthIdx}
              className="card p-3 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => {
                setCurrentDate(new Date(year, monthIdx, 1))
                setView("month")
              }}
            >
              <h3 className="text-xs font-semibold text-surface-800 mb-2">{MONTHS[monthIdx]}</h3>
              <div className="grid grid-cols-7 gap-0">
                {WEEKDAYS_SHORT.map((d) => (
                  <div key={d} className="text-center text-2xs text-surface-400 font-medium py-0.5">{d[0]}</div>
                ))}
                {Array.from({ length: offset }, (_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }, (_, d) => {
                  const day = d + 1
                  const dateStr = `${year}-${String(monthIdx + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                  const hasEvents = allEvents.some((e) => e.date === dateStr)
                  const isToday = day === today.getDate() && monthIdx === today.getMonth() && year === today.getFullYear()

                  return (
                    <div
                      key={day}
                      className={`text-center text-2xs py-0.5 rounded-sm ${
                        isToday ? "bg-brand-600 text-white font-bold" : hasEvents ? "font-semibold text-brand-700" : "text-surface-600"
                      }`}
                    >
                      {day}
                      {hasEvents && !isToday && (
                        <div className="mx-auto mt-0 h-0.5 w-2 rounded-full bg-brand-400" />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // ─── Custom View (N-day) ──────────────────────────
  const CustomView = () => {
    const dates: Date[] = []
    for (let i = 0; i < customDays; i++) {
      const d = new Date(currentDate)
      d.setDate(d.getDate() + i)
      dates.push(d)
    }

    return (
      <div className="card overflow-hidden">
        {/* Header */}
        <div className={`grid border-b border-surface-200 bg-surface-50`} style={{ gridTemplateColumns: `80px repeat(${customDays}, 1fr)` }}>
          <div className="px-2 py-2 text-2xs text-surface-400 border-r border-surface-200" />
          {dates.map((d, i) => {
            const isToday = isSameDay(d, today)
            return (
              <div key={i} className={`px-2 py-2 text-center border-r border-surface-100 last:border-r-0 ${isToday ? "bg-brand-50" : ""}`}>
                <div className="text-2xs font-medium text-surface-500 uppercase">{d.toLocaleDateString("en-US", { weekday: "short" })}</div>
                <div className={`text-lg font-bold ${isToday ? "text-brand-600" : "text-surface-800"}`}>{d.getDate()}</div>
                <div className="text-2xs text-surface-400">{d.toLocaleDateString("en-US", { month: "short" })}</div>
              </div>
            )
          })}
        </div>
        {/* Time grid */}
        <div className="max-h-[600px] overflow-y-auto">
          {HOURS.filter((h) => h >= 6 && h <= 22).map((hour) => (
            <div key={hour} className="border-b border-surface-100 min-h-[48px]" style={{ display: "grid", gridTemplateColumns: `80px repeat(${customDays}, 1fr)` }}>
              <div className="px-2 py-1 text-2xs text-surface-400 border-r border-surface-200 text-right pr-3">
                {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
              </div>
              {dates.map((d, i) => {
                const dateStr = toDateStr(d)
                const hourStr = String(hour).padStart(2, "0")
                const events = getEventsForDate(dateStr).filter((e) => e.time?.startsWith(hourStr))
                return (
                  <div
                    key={i}
                    className="px-1 py-0.5 border-r border-surface-100 last:border-r-0 hover:bg-surface-50 cursor-pointer"
                    onDoubleClick={() => openCreateEvent(dateStr)}
                  >
                    {events.map((ev) => (
                      <button key={ev.id} onClick={() => openEditEvent(ev)} className={`w-full text-left ${ev.color} text-white text-2xs px-1.5 py-1 rounded truncate font-medium mb-0.5 hover:opacity-80`}>
                        {ev.time} {ev.title}
                      </button>
                    ))}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ─── Render ───────────────────────────────────────
  return (
    <div>
      <Header title="Calendar" subtitle="Schedule and track important dates" />

      <div className="p-6 space-y-4">
        {/* Controls Bar */}
        <div className="card p-4">
          <div className="flex items-center justify-between">
            {/* Left: Nav */}
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="p-1.5 rounded-md hover:bg-surface-100 text-surface-600 transition-colors">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h2 className="text-lg font-bold text-surface-900 min-w-[220px]">{headerLabel()}</h2>
              <button onClick={() => navigate(1)} className="p-1.5 rounded-md hover:bg-surface-100 text-surface-600 transition-colors">
                <ChevronRight className="h-5 w-5" />
              </button>
              <button onClick={goToday} className="btn-secondary text-xs ml-2">Today</button>
            </div>

            {/* Right: View toggles + add */}
            <div className="flex items-center gap-2">
              {(["month", "week", "day", "year", "custom"] as ViewMode[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    view === v ? "bg-brand-600 text-white" : "text-surface-600 hover:bg-surface-100"
                  }`}
                >
                  {v === "custom" ? `${customDays}-Day` : v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}

              {view === "custom" && (
                <select
                  value={customDays}
                  onChange={(e) => setCustomDays(Number(e.target.value))}
                  className="input text-xs w-16 py-1"
                >
                  {[2, 3, 4, 5, 10, 14].map((n) => (
                    <option key={n} value={n}>{n}d</option>
                  ))}
                </select>
              )}

              <div className="w-px h-6 bg-surface-200 mx-1" />

              <button
                onClick={() => openCreateEvent(toDateStr(currentDate))}
                className="btn-primary text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Event
              </button>
            </div>
          </div>
        </div>

        {/* Event type legend */}
        <div className="flex flex-wrap items-center gap-3 px-1">
          {(Object.entries(EVENT_TYPE_LABELS) as [EventType, string][]).map(([type, label]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div className={`h-2.5 w-2.5 rounded-full ${EVENT_COLORS[type].dot}`} />
              <span className="text-2xs text-surface-500">{label}</span>
            </div>
          ))}
        </div>

        {/* Calendar View */}
        {view === "month" && <MonthView />}
        {view === "week" && <WeekView />}
        {view === "day" && <DayView />}
        {view === "year" && <YearView />}
        {view === "custom" && <CustomView />}
      </div>

      {/* Event Create/Edit Modal */}
      <Modal
        open={showEventModal}
        onClose={() => setShowEventModal(false)}
        title={editingEvent ? "Edit Event" : "New Event"}
        size="md"
      >
        <form onSubmit={(e) => { e.preventDefault(); saveEvent() }} className="space-y-4">
          {/* Title */}
          <div>
            <label className="label">Title *</label>
            <input
              type="text"
              className="input w-full"
              placeholder="Event title"
              value={eventForm.title}
              onChange={(e) => setEventForm((f) => ({ ...f, title: e.target.value }))}
              autoFocus
              required
            />
          </div>

          {/* Date + Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Date *</label>
              <input
                type="date"
                className="input w-full"
                value={eventForm.date}
                onChange={(e) => setEventForm((f) => ({ ...f, date: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="label">Type</label>
              <select
                className="input w-full"
                value={eventForm.type}
                onChange={(e) => setEventForm((f) => ({ ...f, type: e.target.value as EventType }))}
              >
                {(Object.entries(EVENT_TYPE_LABELS) as [EventType, string][]).map(([type, label]) => (
                  <option key={type} value={type}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Start Time</label>
              <input
                type="time"
                className="input w-full"
                value={eventForm.time}
                onChange={(e) => setEventForm((f) => ({ ...f, time: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">End Time</label>
              <input
                type="time"
                className="input w-full"
                value={eventForm.endTime}
                onChange={(e) => setEventForm((f) => ({ ...f, endTime: e.target.value }))}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="label">Description</label>
            <textarea
              className="input w-full"
              rows={2}
              placeholder="Optional notes..."
              value={eventForm.description}
              onChange={(e) => setEventForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>

          {/* Color picker */}
          <div>
            <label className="label mb-1.5">Color</label>
            <div className="flex flex-wrap gap-1.5">
              {/* Default = use type color */}
              <button
                type="button"
                onClick={() => setEventForm((f) => ({ ...f, customColor: "" }))}
                className={`h-6 w-6 rounded-full border-2 transition-all flex items-center justify-center ${EVENT_COLORS[eventForm.type]?.bg || "bg-brand-500"} ${!eventForm.customColor ? "border-surface-800 ring-2 ring-surface-300 scale-110" : "border-transparent opacity-60 hover:opacity-100"}`}
                title={`Default (${EVENT_TYPE_LABELS[eventForm.type]})`}
              >
                {!eventForm.customColor && <span className="text-white text-2xs font-bold">A</span>}
              </button>
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setEventForm((f) => ({ ...f, customColor: c.value }))}
                  className={`h-6 w-6 rounded-full border-2 transition-all ${c.value} ${eventForm.customColor === c.value ? "border-surface-800 ring-2 ring-surface-300 scale-110" : "border-transparent opacity-60 hover:opacity-100"}`}
                  title={c.label}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className={`h-3.5 w-3.5 rounded-full ${eventForm.customColor || EVENT_COLORS[eventForm.type]?.bg || "bg-brand-500"}`} />
              <span className="text-2xs text-surface-500">
                {eventForm.customColor
                  ? `Custom color · ${EVENT_TYPE_LABELS[eventForm.type]}`
                  : `Default ${EVENT_TYPE_LABELS[eventForm.type]} color`}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-surface-200">
            <div>
              {editingEvent && (
                <button type="button" onClick={deleteEvent} className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setShowEventModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {editingEvent ? "Save Changes" : "Create Event"}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  )
}
