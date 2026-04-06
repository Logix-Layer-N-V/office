"use client"

/**
 * detail-header.tsx
 * WAT:    Herbruikbare header voor detail pages
 * WAAROM: Consistente layout voor proposal/estimate/invoice detail
 */

import Link from "next/link"
import { ArrowLeft, Pencil, Eye, Trash2, MoreHorizontal } from "lucide-react"

interface DetailHeaderProps {
  backHref: string
  backLabel: string
  title: string
  subtitle?: string
  editHref?: string
  previewHref?: string
  onDelete?: () => void
  actions?: React.ReactNode
}

export function DetailHeader({ backHref, backLabel, title, subtitle, editHref, previewHref, onDelete, actions }: DetailHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-surface-200 bg-white px-6 py-3">
      <div className="flex items-center gap-4">
        <Link href={backHref} className="flex items-center gap-1 text-xs text-surface-400 hover:text-surface-600">
          <ArrowLeft className="h-3.5 w-3.5" /> {backLabel}
        </Link>
        <div className="h-4 w-px bg-surface-200" />
        <div>
          <h1 className="text-sm font-semibold text-surface-800">{title}</h1>
          {subtitle && <p className="text-2xs text-surface-400">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {actions}
        {previewHref && (
          <Link href={previewHref} className="btn-secondary"><Eye className="h-3.5 w-3.5" /> Preview</Link>
        )}
        {editHref && (
          <Link href={editHref} className="btn-secondary"><Pencil className="h-3.5 w-3.5" /> Edit</Link>
        )}
        {onDelete && (
          <button onClick={onDelete} className="btn-ghost text-red-500 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
        )}
      </div>
    </header>
  )
}
