"use client"

/**
 * status-dropdown.tsx
 * WAT:    Inline status wijzigen dropdown
 * WAAROM: Snel status updaten vanuit detail pages
 */

import { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import { cn, getStatusColor } from "@/lib/utils"

interface StatusDropdownProps {
  current: string
  options: string[]
  onChange: (status: string) => void
}

export function StatusDropdown({ current, options, onChange }: StatusDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  return (
    <div ref={ref} className="relative inline-block">
      <button onClick={() => setOpen(!open)} className={cn(getStatusColor(current), "flex items-center gap-1 cursor-pointer")}>
        {current} <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-36 rounded-md border border-surface-200 bg-white py-1 shadow-lg">
          {options.map((opt) => (
            <button key={opt} onClick={() => { onChange(opt); setOpen(false) }}
              className={cn("block w-full px-3 py-1.5 text-left text-xs hover:bg-surface-50", opt === current && "font-medium bg-surface-50")}>
              <span className={getStatusColor(opt)}>{opt}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
