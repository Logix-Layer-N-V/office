"use client"

/**
 * sidebar.tsx
 * WAT:    Compacte sidebar navigatie met collapsible groepen
 * WAAROM: Hoofd navigatie van de finance app
 */

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { navigation } from "@/constants/navigation"
import { LogixLogo } from "@/components/ui/logix-logo"
import { ChevronLeft, ChevronDown, ChevronRight } from "lucide-react"
import { useState, useEffect } from "react"

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()

  // Track which nav groups are open (default: all open)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    navigation.forEach((group) => {
      initial[group.title] = true
    })
    return initial
  })

  // Auto-expand group containing active route
  useEffect(() => {
    navigation.forEach((group) => {
      const hasActive = group.items.some(
        (item) => pathname === item.href || pathname.startsWith(item.href + "/")
      )
      if (hasActive) {
        setOpenGroups((prev) => ({ ...prev, [group.title]: true }))
      }
    })
  }, [pathname])

  const toggleGroup = (title: string) => {
    if (collapsed) return
    setOpenGroups((prev) => ({ ...prev, [title]: !prev[title] }))
  }

  const collapseAll = () => {
    const allClosed: Record<string, boolean> = {}
    navigation.forEach((group) => { allClosed[group.title] = false })
    setOpenGroups(allClosed)
  }

  const expandAll = () => {
    const allOpen: Record<string, boolean> = {}
    navigation.forEach((group) => { allOpen[group.title] = true })
    setOpenGroups(allOpen)
  }

  const allExpanded = Object.values(openGroups).every(Boolean)

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-surface-200 bg-white transition-all duration-200",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex h-12 items-center border-b border-surface-200",
        collapsed ? "justify-center px-1" : "justify-between px-3"
      )}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <LogixLogo size={28} />
            <div>
              <p className="text-xs font-semibold text-[#3B2D8E]">Logix Layer</p>
              <p className="text-2xs text-surface-400">Finance Dept.</p>
            </div>
          </div>
        )}
        <button
          onClick={onToggle}
          className="rounded p-1 text-surface-400 hover:bg-surface-100 hover:text-surface-600"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <LogixLogo size={24} />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* Expand/Collapse all toggle */}
      {!collapsed && (
        <div className="flex items-center justify-end px-3 pt-2 pb-0.5">
          <button
            onClick={allExpanded ? collapseAll : expandAll}
            className="text-2xs text-surface-400 hover:text-surface-600 transition-colors"
          >
            {allExpanded ? "Collapse all" : "Expand all"}
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className={cn(
        "flex-1 overflow-y-auto",
        collapsed ? "px-1.5 py-2" : "px-2 py-2"
      )}>
        {navigation.map((group, groupIndex) => {
          const isOpen = openGroups[group.title] ?? true
          const hasActive = group.items.some(
            (item) => pathname === item.href || pathname.startsWith(item.href + "/")
          )

          return (
            <div key={group.title} className={collapsed ? "" : "mb-1"}>
              {/* Group header */}
              {!collapsed ? (
                <button
                  onClick={() => toggleGroup(group.title)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-2xs font-semibold uppercase tracking-wider transition-colors",
                    hasActive && !isOpen
                      ? "text-brand-600 bg-brand-50/50"
                      : "text-surface-400 hover:text-surface-600 hover:bg-surface-50"
                  )}
                >
                  <span>{group.title}</span>
                  <div className="flex items-center gap-1">
                    {hasActive && !isOpen && (
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
                    )}
                    {isOpen ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )}
                  </div>
                </button>
              ) : (
                /* Collapsed: thin separator only between groups, not before first */
                groupIndex > 0 && <div className="my-1 mx-2 border-t border-surface-100" />
              )}

              {/* Group items */}
              <div
                className={cn(
                  "overflow-hidden transition-all duration-200",
                  !collapsed && !isOpen ? "max-h-0 opacity-0" : "max-h-[500px] opacity-100"
                )}
              >
                <ul className={cn("mt-0.5", collapsed ? "space-y-0" : "space-y-0.5")}>
                  {group.items.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                    const Icon = item.icon
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center rounded-md text-xs font-medium transition-colors",
                            collapsed
                              ? "justify-center py-1.5 mx-0.5"
                              : "gap-2.5 px-2 py-1.5",
                            isActive
                              ? "bg-brand-50 text-brand-700"
                              : "text-surface-500 hover:bg-surface-50 hover:text-surface-700"
                          )}
                          title={collapsed ? item.label : undefined}
                        >
                          <Icon className={cn("flex-shrink-0", collapsed ? "h-4.5 w-4.5" : "h-4 w-4")} />
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
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
