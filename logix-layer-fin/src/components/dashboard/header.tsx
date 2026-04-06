"use client"

/**
 * header.tsx
 * WAT:    Compact top header met breadcrumbs en acties
 * WAAROM: Context en quick actions per pagina
 */

import { Bell, Search, Plus } from "lucide-react"

interface HeaderProps {
  title: string
  subtitle?: string
  action?: {
    label: string
    onClick?: () => void
    href?: string
  }
}

export function Header({ title, subtitle, action }: HeaderProps) {
  return (
    <header className="flex h-12 items-center justify-between border-b border-surface-200 bg-white px-6">
      <div>
        <h1 className="text-sm font-semibold text-surface-800">{title}</h1>
        {subtitle && <p className="text-2xs text-surface-400">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        <button className="rounded-md p-1.5 text-surface-400 hover:bg-surface-100 hover:text-surface-600">
          <Search className="h-4 w-4" />
        </button>
        <button className="relative rounded-md p-1.5 text-surface-400 hover:bg-surface-100 hover:text-surface-600">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-brand-600" />
        </button>
        {action && action.href ? (
          <a href={action.href} className="btn-primary">
            <Plus className="h-3.5 w-3.5" />
            {action.label}
          </a>
        ) : action && action.onClick ? (
          <button onClick={action.onClick} className="btn-primary">
            <Plus className="h-3.5 w-3.5" />
            {action.label}
          </button>
        ) : null}
      </div>
    </header>
  )
}
