"use client"

import { useEffect, useRef } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: "sm" | "md" | "lg"
}

export function Modal({ open, onClose, title, children, size = "md" }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (open) document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div
        ref={ref}
        className={cn(
          "relative z-10 max-h-[85vh] overflow-y-auto rounded-lg bg-white shadow-xl",
          size === "sm" && "w-full max-w-md",
          size === "md" && "w-full max-w-lg",
          size === "lg" && "w-full max-w-2xl"
        )}
      >
        <div className="flex items-center justify-between border-b border-surface-200 px-5 py-3">
          <h2 className="text-sm font-semibold text-surface-800">{title}</h2>
          <button onClick={onClose} className="rounded p-1 text-surface-400 hover:bg-surface-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
