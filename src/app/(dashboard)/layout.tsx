"use client"

import { useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <main
        className="flex-1 transition-all duration-200"
        style={{ marginLeft: sidebarCollapsed ? 64 : 224 }}
      >
        {children}
      </main>
    </div>
  )
}
