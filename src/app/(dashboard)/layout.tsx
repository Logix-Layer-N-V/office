"use client"

import { useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Menu, Bell, Plus } from "lucide-react"
import { LogixLogo } from "@/components/ui/logix-logo"
import { useClerk, useUser } from "@clerk/nextjs"
import { InactivityGuard } from "@/components/dashboard/inactivity-guard"
import Link from "next/link"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const { signOut } = useClerk()
  const { user } = useUser()

  const initials = user?.firstName?.[0] || user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() || "U"
  const displayName = user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] || "User"
  const email = user?.emailAddresses?.[0]?.emailAddress || ""

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Mobile top bar */}
      <header className="fixed top-0 left-0 right-0 z-30 flex h-12 items-center gap-2 border-b border-surface-200 bg-white px-3 md:hidden">
        {/* Hamburger */}
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-md p-1.5 text-surface-500 hover:bg-surface-100"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Logo + name */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <LogixLogo size={20} />
          <span className="text-sm font-semibold text-[#3B2D8E] truncate">Logix Layer</span>
        </div>

        {/* Actions: Quick create + Bell + Profile */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <Link
            href="/invoices/new"
            className="rounded-lg p-2 text-surface-500 hover:bg-surface-100"
            aria-label="Quick create"
          >
            <Plus className="h-4.5 w-4.5" />
          </Link>
          <Link
            href="/notifications"
            className="relative rounded-lg p-2 text-surface-500 hover:bg-surface-100"
            aria-label="Notifications"
          >
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">3</span>
          </Link>
          {/* Custom profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-1.5 rounded-lg p-1 hover:bg-surface-100 transition-colors"
            >
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-[11px] font-bold">
                {initials}
              </div>
            </button>
            {profileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 top-full mt-1 z-50 w-56 rounded-xl border border-surface-200 bg-white py-2 shadow-xl">
                  <div className="px-3 py-2 border-b border-surface-100 mb-1">
                    <p className="text-sm font-semibold text-surface-900">{displayName}</p>
                    <p className="text-xs text-surface-500 truncate">{email}</p>
                  </div>
                  <button
                    onClick={() => { setProfileOpen(false); signOut({ redirectUrl: "/sign-in" }) }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3-3h-9m0 0l3-3m-3 3l3 3" />
                    </svg>
                    Log Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* pt-12 for mobile topbar, md:pt-0 removes it on desktop */}
      <main
        className="transition-all duration-200 pt-12 md:pt-0"
        style={{ marginLeft: `var(--sidebar-width, 0px)` }}
      >
        {/* CSS variable set per breakpoint via a hidden element */}
        <style>{`
          @media (min-width: 768px) {
            :root { --sidebar-width: ${sidebarCollapsed ? "64px" : "224px"}; }
          }
          @media (max-width: 767px) {
            :root { --sidebar-width: 0px; }
          }
        `}</style>
        {children}
      </main>

      {/* Auto-logout after 10 min inactivity */}
      <InactivityGuard />
    </div>
  )
}
