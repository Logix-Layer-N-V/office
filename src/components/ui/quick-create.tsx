"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import {
  Plus,
  Users,
  Package,
  FileText,
  Calculator,
  Receipt,
  CreditCard,
  FolderKanban,
  ClipboardList,
  ListTodo,
  CalendarDays,
  type LucideIcon,
} from "lucide-react"

interface QuickCreateItem {
  label: string
  href: string
  icon: LucideIcon
  color: string
}

const QUICK_CREATE_GROUPS: { title: string; items: QuickCreateItem[] }[] = [
  {
    title: "CRM",
    items: [
      { label: "New Client", href: "/clients/new", icon: Users, color: "text-brand-600" },
      { label: "New Item", href: "/items/new", icon: Package, color: "text-purple-600" },
    ],
  },
  {
    title: "Sales",
    items: [
      { label: "New Proposal", href: "/proposals/new", icon: FileText, color: "text-blue-600" },
      { label: "New Estimate", href: "/estimates/new", icon: Calculator, color: "text-cyan-600" },
      { label: "New Invoice", href: "/invoices/new", icon: Receipt, color: "text-amber-600" },
      { label: "New Payment", href: "/payments/new", icon: CreditCard, color: "text-emerald-600" },
    ],
  },
  {
    title: "Projects",
    items: [
      { label: "New Project", href: "/projects/new", icon: FolderKanban, color: "text-indigo-600" },
      { label: "New Work Order", href: "/work-orders/new", icon: ClipboardList, color: "text-orange-600" },
      { label: "New Task", href: "/tasks/new", icon: ListTodo, color: "text-pink-600" },
    ],
  },
]

export function QuickCreate() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Click outside
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center justify-center h-8 w-8 rounded-lg transition-colors ${
          open ? "bg-brand-600 text-white" : "bg-brand-50 text-brand-600 hover:bg-brand-100"
        }`}
        title="Create new..."
      >
        <Plus className={`h-4 w-4 transition-transform ${open ? "rotate-45" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-surface-200 bg-white shadow-xl z-50 overflow-hidden">
          <div className="px-3 py-2 border-b border-surface-100">
            <p className="text-2xs font-semibold text-surface-500 uppercase tracking-wider">Quick Create</p>
          </div>

          <div className="py-1 max-h-[400px] overflow-y-auto">
            {QUICK_CREATE_GROUPS.map((group) => (
              <div key={group.title}>
                <div className="px-3 py-1.5">
                  <span className="text-2xs font-medium text-surface-400 uppercase tracking-wider">{group.title}</span>
                </div>
                {group.items.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-surface-700 hover:bg-surface-50 transition-colors"
                    >
                      <Icon className={`h-4 w-4 ${item.color}`} />
                      <span className="text-xs font-medium">{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
