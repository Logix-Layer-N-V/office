"use client"

/**
 * sidebar.tsx
 * WAT:    Compacte sidebar navigatie met Logix Layer branding
 * WAAROM: Hoofd navigatie van de finance app
 */

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { navigation } from "@/constants/navigation"
import { LogixLogo } from "@/components/ui/logix-logo"
import { Settings, ChevronLeft } from "lucide-react"
import { useState } from "react"

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-surface-200 bg-white transition-all duration-200",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {/* Logo */}
      <div className="flex h-12 items-center justify-between border-b border-surface-200 px-3">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <LogixLogo size={28} />
            <div>
              <p className="text-xs font-semibold text-[#3B2D8E]">Logix Layer</p>
              <p className="text-2xs text-surface-400">Finance Dept.</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto">
            <LogixLogo size={28} />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded p-1 text-surface-400 hover:bg-surface-100 hover:text-surface-600"
        >
          <ChevronLeft className={cn("h-3.5 w-3.5 transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {navigation.map((group) => (
          <div key={group.title} className="mb-4">
            {!collapsed && (
              <p className="mb-1 px-2 text-2xs font-medium uppercase tracking-wider text-surface-400">
                {group.title}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                const Icon = item.icon
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                        isActive
                          ? "bg-brand-50 text-brand-700"
                          : "text-surface-500 hover:bg-surface-50 hover:text-surface-700"
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span>{item.label}</span>}
                      {!collapsed && item.badge !== undefined && (
                        <span className="ml-auto rounded-full bg-brand-100 px-1.5 py-0.5 text-2xs font-medium text-brand-700">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-surface-200 p-2">
        <Link
          href="/settings"
          className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-xs font-medium text-surface-500 hover:bg-surface-50 hover:text-surface-700"
        >
          <Settings className="h-4 w-4" />
          {!collapsed && <span>Settings</span>}
        </Link>
      </div>
    </aside>
  )
}
