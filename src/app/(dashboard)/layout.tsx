"use client"

import { useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Menu, Bell, Plus } from "lucide-react"
import { LogixLogo } from "@/components/ui/logix-logo"
import { UserButton, useUser } from "@clerk/nextjs"
import Link from "next/link"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

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
          <div className="rounded-lg p-1.5">
            <UserButton afterSignOutUrl="/sign-in" />
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
    </div>
  )
}
