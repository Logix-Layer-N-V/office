"use client"

import { useState } from "react"
import { Header } from "@/components/dashboard/header"
import { Bell, Check, CheckCheck, Trash2, Filter, Search } from "lucide-react"

type NotificationType = "info" | "success" | "warning" | "alert"
type NotificationCategory = "all" | "unread" | "payments" | "invoices" | "tasks" | "system"

interface Notification {
  id: string
  title: string
  message: string
  time: string
  date: string
  read: boolean
  type: NotificationType
  category: string
}

const TYPE_COLORS: Record<NotificationType, { dot: string; bg: string }> = {
  info: { dot: "bg-blue-500", bg: "bg-blue-50" },
  success: { dot: "bg-emerald-500", bg: "bg-emerald-50" },
  warning: { dot: "bg-amber-500", bg: "bg-amber-50" },
  alert: { dot: "bg-red-500", bg: "bg-red-50" },
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: "1", title: "Invoice Paid", message: "Invoice #INV-0042 has been paid by Acme Corp. Amount: $4,500.00 received via bank transfer.", time: "5 min ago", date: "2026-04-06", read: false, type: "success", category: "payments" },
  { id: "2", title: "New Proposal Request", message: "Client TechFlow BV requested a new proposal for their Q3 infrastructure project. Please review and respond within 48 hours.", time: "1 hour ago", date: "2026-04-06", read: false, type: "info", category: "invoices" },
  { id: "3", title: "Payment Overdue", message: "Invoice #INV-0038 for Digital Solutions Ltd is 7 days overdue. Outstanding amount: $2,300.00. Consider sending a reminder.", time: "3 hours ago", date: "2026-04-06", read: false, type: "warning", category: "payments" },
  { id: "4", title: "Task Completed", message: "Design Review task for Project Alpha has been marked as done by Sarah. All deliverables approved.", time: "5 hours ago", date: "2026-04-06", read: true, type: "success", category: "tasks" },
  { id: "5", title: "System Update", message: "Platform maintenance scheduled for tonight between 02:00 - 04:00 CET. Expected downtime: 15 minutes.", time: "Yesterday", date: "2026-04-05", read: true, type: "info", category: "system" },
  { id: "6", title: "New Client Added", message: "CloudNine Technologies has been added as a new client by Kento. Status: Active. Currency: EUR.", time: "Yesterday", date: "2026-04-05", read: true, type: "info", category: "invoices" },
  { id: "7", title: "Sprint 24 Started", message: "Sprint 24 has been activated with 45 story points committed. Goal: Complete GL automation and cash flow dashboard.", time: "Yesterday", date: "2026-04-05", read: true, type: "info", category: "tasks" },
  { id: "8", title: "Expense Approved", message: "Your expense claim for Adobe Creative Cloud subscription ($54.99/mo) has been approved.", time: "2 days ago", date: "2026-04-04", read: true, type: "success", category: "payments" },
  { id: "9", title: "Work Order Assigned", message: "Work Order #WO-0023 'API Integration for TechFlow' has been assigned to you by David. Due: April 12.", time: "2 days ago", date: "2026-04-04", read: true, type: "info", category: "tasks" },
  { id: "10", title: "Low Balance Alert", message: "Business checking account balance dropped below $5,000 threshold. Current balance: $4,230.50.", time: "3 days ago", date: "2026-04-03", read: true, type: "alert", category: "payments" },
  { id: "11", title: "Estimate Accepted", message: "Estimate #EST-0015 for GreenTech Solutions has been accepted. Total: $12,000. Ready to convert to invoice.", time: "3 days ago", date: "2026-04-03", read: true, type: "success", category: "invoices" },
  { id: "12", title: "Backup Completed", message: "Weekly database backup completed successfully. Size: 245MB. Next backup: April 10, 2026.", time: "4 days ago", date: "2026-04-02", read: true, type: "info", category: "system" },
]

const CATEGORIES: { key: NotificationCategory; label: string }[] = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "payments", label: "Payments" },
  { key: "invoices", label: "Sales" },
  { key: "tasks", label: "Tasks" },
  { key: "system", label: "System" },
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS)
  const [activeCategory, setActiveCategory] = useState<NotificationCategory>("all")
  const [searchQuery, setSearchQuery] = useState("")

  const unreadCount = notifications.filter((n) => !n.read).length

  const filtered = notifications.filter((n) => {
    if (activeCategory === "unread") return !n.read
    if (activeCategory !== "all") return n.category === activeCategory
    return true
  }).filter((n) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q)
  })

  // Group by date
  const grouped = filtered.reduce<Record<string, Notification[]>>((acc, n) => {
    const label = n.date === "2026-04-06" ? "Today" : n.date === "2026-04-05" ? "Yesterday" : n.date
    if (!acc[label]) acc[label] = []
    acc[label].push(n)
    return acc
  }, {})

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const deleteAllRead = () => {
    setNotifications((prev) => prev.filter((n) => !n.read))
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <Header title="Notifications" />
      <div className="p-6 max-w-4xl mx-auto">

        {/* Top bar: stats + actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-surface-400" />
              <span className="text-sm text-surface-600">
                <span className="font-semibold text-surface-800">{unreadCount}</span> unread
              </span>
            </div>
            <span className="text-surface-300">|</span>
            <span className="text-sm text-surface-500">{notifications.length} total</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={markAllRead} className="btn-ghost flex items-center gap-1.5" disabled={unreadCount === 0}>
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </button>
            <button onClick={deleteAllRead} className="btn-ghost text-red-500 hover:text-red-600 hover:bg-red-50 flex items-center gap-1.5">
              <Trash2 className="h-3.5 w-3.5" />
              Clear read
            </button>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-surface-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-9"
            />
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-1 mb-6 border-b border-surface-200">
          {CATEGORIES.map((cat) => {
            const count = cat.key === "all"
              ? notifications.length
              : cat.key === "unread"
                ? unreadCount
                : notifications.filter((n) => n.category === cat.key).length
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${
                  activeCategory === cat.key
                    ? "border-b-2 border-brand-600 text-brand-600"
                    : "text-surface-500 hover:text-surface-700"
                }`}
              >
                {cat.label}
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  activeCategory === cat.key ? "bg-brand-100 text-brand-700" : "bg-surface-100 text-surface-500"
                }`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Notification groups */}
        {Object.keys(grouped).length === 0 ? (
          <div className="card p-12 text-center">
            <Bell className="h-10 w-10 text-surface-200 mx-auto mb-3" />
            <p className="text-sm text-surface-500">No notifications found</p>
            <p className="text-2xs text-surface-400 mt-1">
              {searchQuery ? "Try a different search term" : "You're all caught up!"}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([dateLabel, items]) => (
              <div key={dateLabel}>
                <h3 className="text-2xs font-semibold uppercase tracking-wider text-surface-400 mb-2 px-1">
                  {dateLabel}
                </h3>
                <div className="card divide-y divide-surface-100">
                  {items.map((notif) => (
                    <div
                      key={notif.id}
                      className={`flex gap-3 px-4 py-3 group transition-colors hover:bg-surface-50 ${
                        !notif.read ? "bg-brand-50/20" : ""
                      }`}
                    >
                      {/* Type indicator */}
                      <div className={`mt-1.5 h-2.5 w-2.5 rounded-full flex-shrink-0 ${TYPE_COLORS[notif.type].dot}`} />

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className={`text-sm ${!notif.read ? "font-semibold text-surface-800" : "font-medium text-surface-600"}`}>
                              {notif.title}
                            </p>
                            <p className="text-xs text-surface-400 mt-0.5 leading-relaxed">{notif.message}</p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0 pt-0.5">
                            <span className="text-2xs text-surface-300 whitespace-nowrap">{notif.time}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notif.read && (
                            <button
                              onClick={() => markAsRead(notif.id)}
                              className="flex items-center gap-1 text-2xs text-brand-600 hover:text-brand-700"
                            >
                              <Check className="h-3 w-3" />
                              Mark read
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notif.id)}
                            className="flex items-center gap-1 text-2xs text-red-400 hover:text-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
