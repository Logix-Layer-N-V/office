"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, ChevronRight, Home, User, Shield, FileText, LogOut, Settings, ChevronDown, X } from "lucide-react"
import { GlobalSearch } from "@/components/ui/global-search"
import { QuickCreate } from "@/components/ui/quick-create"
import { useClerk, useUser } from "@clerk/nextjs"

interface HeaderProps {
  title: string
  subtitle?: string
  action?: {
    label: string
    onClick?: () => void
    href?: string
  }
}

interface Notification {
  id: string
  title: string
  message: string
  time: string
  read: boolean
  type: "info" | "success" | "warning" | "alert"
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: "1", title: "Invoice Paid", message: "Invoice #INV-0042 has been paid by Acme Corp", time: "5 min ago", read: false, type: "success" },
  { id: "2", title: "New Proposal Request", message: "Client TechFlow requested a new proposal", time: "1 hour ago", read: false, type: "info" },
  { id: "3", title: "Payment Overdue", message: "Invoice #INV-0038 is 7 days overdue", time: "3 hours ago", read: false, type: "warning" },
  { id: "4", title: "Task Completed", message: "Design Review task marked as done", time: "Yesterday", read: true, type: "success" },
  { id: "5", title: "System Update", message: "Platform maintenance scheduled for tonight", time: "Yesterday", read: true, type: "info" },
]

const NOTIFICATION_COLORS = {
  info: "bg-blue-500",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  alert: "bg-red-500",
}

const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  overview: "Dashboard",
  clients: "Clients",
  items: "Items",
  proposals: "Proposals",
  estimates: "Estimates",
  invoices: "Invoices",
  payments: "Payments",
  projects: "Projects",
  "work-orders": "Work Orders",
  tasks: "Tasks",
  calendar: "Calendar",
  expenses: "Expenses",
  banks: "Bank Accounts",
  "bank-accounts": "Bank Accounts",
  transactions: "Transactions",
  credits: "Credits",
  loans: "Loans",
  "general-ledger": "General Ledger",
  ledger: "Ledger",
  accounts: "Chart of Accounts",
  users: "Team Members",
  settings: "Settings",
  docs: "Documentation",
  sprints: "Scrum Board",
  notifications: "Notifications",
  reports: "Reports",
  new: "New",
}

export function Header({ title, subtitle, action }: HeaderProps) {
  const pathname = usePathname()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS)
  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const { signOut } = useClerk()
  const { user } = useUser()

  const userInitial = user?.firstName?.[0] || user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() || "U"
  const userName = user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] || "User"
  const userEmail = user?.emailAddresses?.[0]?.emailAddress || ""

  const unreadCount = notifications.filter((n) => !n.read).length

  // Click outside handlers
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false)
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const segments = pathname
    .split("/")
    .filter(Boolean)
    .filter((s) => !s.startsWith("("))

  const breadcrumbs = segments.map((seg, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/")
    const label = ROUTE_LABELS[seg] || seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " ")
    const isLast = index === segments.length - 1
    return { label, href, isLast }
  })

  return (
    <header className="border-b border-surface-200 bg-white">
      {/* Top bar: Breadcrumb left — Search center — Actions right */}
      <div className="flex items-center gap-3 px-4 py-2.5">
        {/* Left: Breadcrumb */}
        <div className="hidden md:flex items-center gap-1.5 min-w-0 shrink">
          <Link href="/" className="text-surface-400 hover:text-brand-600 transition-colors flex-shrink-0">
            <Home className="h-3.5 w-3.5" />
          </Link>
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5 min-w-0">
              <ChevronRight className="h-3 w-3 text-surface-300 flex-shrink-0" />
              {crumb.isLast ? (
                <span className="text-2xs font-medium text-surface-700 truncate">{crumb.label}</span>
              ) : (
                <Link href={crumb.href} className="text-2xs font-medium text-surface-400 hover:text-brand-600 transition-colors truncate">
                  {crumb.label}
                </Link>
              )}
            </span>
          ))}
        </div>

        {/* Center: Global Search — full width on mobile */}
        <div className="flex-1 min-w-0 md:max-w-xs md:mx-auto">
          <GlobalSearch />
        </div>

        {/* Right: Quick create + Notifications + Profile — desktop only */}
        <div className="hidden md:flex items-center gap-1 flex-shrink-0">
          <QuickCreate />

          {/* Notification Bell */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false) }}
              className="relative rounded-lg p-1.5 text-surface-400 hover:bg-surface-100 hover:text-surface-600 transition-colors"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-1.5 w-72 rounded-lg border border-surface-200 bg-white shadow-xl z-50 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-3 py-2 border-b border-surface-100 bg-surface-50/50">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-surface-800">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-600 px-1 text-[9px] font-bold text-white">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-2xs text-brand-600 hover:text-brand-700">
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Notification list */}
                <div className="max-h-64 overflow-y-auto divide-y divide-surface-50">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-surface-400">
                      <Bell className="h-5 w-5 mb-1 opacity-30" />
                      <p className="text-2xs">No notifications</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markAsRead(notif.id)}
                        className={`group flex gap-2 px-3 py-2 cursor-pointer hover:bg-surface-50 transition-colors ${
                          !notif.read ? "bg-brand-50/20" : ""
                        }`}
                      >
                        <div className={`mt-1 h-1.5 w-1.5 rounded-full flex-shrink-0 ${NOTIFICATION_COLORS[notif.type]}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className={`text-2xs truncate ${!notif.read ? "font-semibold text-surface-800" : "font-medium text-surface-500"}`}>
                              {notif.title}
                            </p>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <span className="text-[10px] text-surface-300">{notif.time}</span>
                              <button
                                onClick={(e) => { e.stopPropagation(); dismissNotification(notif.id) }}
                                className="opacity-0 group-hover:opacity-100 text-surface-300 hover:text-surface-500 transition-all"
                              >
                                <X className="h-2.5 w-2.5" />
                              </button>
                            </div>
                          </div>
                          <p className="text-[10px] text-surface-400 mt-0.5 truncate">{notif.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                <div className="border-t border-surface-100 px-3 py-1.5">
                  <Link
                    href="/notifications"
                    onClick={() => setShowNotifications(false)}
                    className="block text-center text-2xs font-medium text-brand-600 hover:text-brand-700"
                  >
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-5 w-px bg-surface-200" />

          {/* Profile Dropdown */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => { setShowProfile(!showProfile); setShowNotifications(false) }}
              className="flex items-center gap-1.5 rounded-lg px-1.5 py-1 hover:bg-surface-100 transition-colors"
            >
              {user?.imageUrl ? (
                <img src={user.imageUrl} alt={userName} className="h-6 w-6 rounded-full object-cover" />
              ) : (
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-[10px] font-bold">
                  {userInitial}
                </div>
              )}
              <div className="hidden lg:block text-left">
                <p className="text-2xs font-medium text-surface-700 leading-tight">{userName}</p>
                <p className="text-[10px] text-surface-400 leading-tight">Admin</p>
              </div>
              <ChevronDown className={`hidden lg:block h-2.5 w-2.5 text-surface-400 transition-transform ${showProfile ? "rotate-180" : ""}`} />
            </button>

            {showProfile && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-surface-200 bg-white shadow-xl z-50 overflow-hidden">
                {/* Profile header */}
                <div className="px-4 py-3 border-b border-surface-100 bg-surface-50/50">
                  <div className="flex items-center gap-3">
                    {user?.imageUrl ? (
                      <img src={user.imageUrl} alt={userName} className="h-9 w-9 rounded-full object-cover shadow-sm" />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                        {userInitial}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-surface-800">{userName}</p>
                      <p className="text-2xs text-surface-400">{userEmail}</p>
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div className="py-1.5">
                  <Link
                    href="/profile"
                    onClick={() => setShowProfile(false)}
                    className="flex items-center gap-3 px-4 py-2 text-xs text-surface-600 hover:bg-surface-50 hover:text-surface-800 transition-colors"
                  >
                    <User className="h-3.5 w-3.5 text-surface-400" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    href="/settings?tab=general&sub=general"
                    onClick={() => setShowProfile(false)}
                    className="flex items-center gap-3 px-4 py-2 text-xs text-surface-600 hover:bg-surface-50 hover:text-surface-800 transition-colors"
                  >
                    <Shield className="h-3.5 w-3.5 text-surface-400" />
                    <span>Account & Security</span>
                  </Link>
                  <Link
                    href="/settings?tab=docs"
                    onClick={() => setShowProfile(false)}
                    className="flex items-center gap-3 px-4 py-2 text-xs text-surface-600 hover:bg-surface-50 hover:text-surface-800 transition-colors"
                  >
                    <FileText className="h-3.5 w-3.5 text-surface-400" />
                    <span>Documentation</span>
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setShowProfile(false)}
                    className="flex items-center gap-3 px-4 py-2 text-xs text-surface-600 hover:bg-surface-50 hover:text-surface-800 transition-colors"
                  >
                    <Settings className="h-3.5 w-3.5 text-surface-400" />
                    <span>Settings</span>
                  </Link>
                </div>

                {/* Logout */}
                <div className="border-t border-surface-100 py-1.5">
                  <button
                    onClick={() => { setShowProfile(false); signOut({ redirectUrl: "/sign-in" }) }}
                    className="flex w-full items-center gap-3 px-4 py-2 text-xs text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar: Title + Page action */}
      <div className="flex items-center justify-between px-4 py-2 md:px-6 border-t border-surface-100">
        <div>
          <h1 className="text-base font-bold text-surface-800">{title}</h1>
          {subtitle && <p className="text-2xs text-surface-400 mt-0.5">{subtitle}</p>}
        </div>
        {action && action.href ? (
          <Link href={action.href} className="btn-primary">
            {action.label}
          </Link>
        ) : action && action.onClick ? (
          <button onClick={action.onClick} className="btn-primary">
            {action.label}
          </button>
        ) : null}
      </div>
    </header>
  )
}
