"use client"

import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { Search, Package, ChevronDown } from "lucide-react"

interface CatalogItem {
  id: string
  name: string
  type: string
  description: string | null
  unit: string
  rate: string
  isActive: boolean
}

interface ItemPickerProps {
  value: string
  onChange: (value: string) => void
  onItemSelect: (item: { description: string; rate: number }) => void
  items: CatalogItem[]
  placeholder?: string
}

export function ItemPicker({ value, onChange, onItemSelect, items, placeholder = "Search items or type description..." }: ItemPickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 })
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // Update dropdown position when opening
  useEffect(() => {
    if (open && ref.current) {
      const rect = ref.current.getBoundingClientRect()
      setDropdownPos({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      })
    }
  }, [open])

  const activeItems = items.filter((i) => i.isActive)
  const filtered = activeItems.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(search.toLowerCase())) ||
      item.type.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = (item: CatalogItem) => {
    onItemSelect({ description: item.name, rate: parseFloat(item.rate) || 65 })
    setOpen(false)
    setSearch("")
  }

  const typeLabel: Record<string, string> = {
    SERVICE: "Service",
    PRODUCT: "Product",
    API_COST: "API Cost",
    AI_TOKEN: "AI Token",
  }

  const dropdown = open && activeItems.length > 0 ? createPortal(
    <div
      className="fixed z-[9999] rounded-lg border border-surface-200 bg-white shadow-xl max-h-64 overflow-hidden"
      style={{ top: dropdownPos.top, left: dropdownPos.left, width: Math.max(dropdownPos.width, 320) }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-2 border-b border-surface-100 px-3 py-2">
        <Search className="h-3.5 w-3.5 text-surface-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search catalog..."
          className="flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-surface-400"
          autoFocus
        />
      </div>
      <div className="overflow-auto max-h-48">
        {filtered.length === 0 ? (
          <div className="px-3 py-4 text-center text-xs text-surface-400">
            No items found. Type a custom description instead.
          </div>
        ) : (
          filtered.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item)}
              className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-brand-50 transition-colors"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <Package className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-surface-800 truncate">{item.name}</p>
                <p className="text-xs text-surface-400">
                  {typeLabel[item.type] || item.type} &middot; ${parseFloat(item.rate).toFixed(2)}/{item.unit}
                </p>
              </div>
              <span className="text-sm font-semibold text-brand-600">${parseFloat(item.rate).toFixed(2)}</span>
            </button>
          ))
        )}
      </div>
    </div>,
    document.body
  ) : null

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center gap-0">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => { if (activeItems.length > 0) setOpen(true) }}
          placeholder={placeholder}
          className="input flex-1 pr-8"
        />
        {activeItems.length > 0 && (
          <button
            type="button"
            onClick={() => { setOpen(!open); if (!open) inputRef.current?.focus() }}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-surface-400 hover:text-surface-600 hover:bg-surface-100"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {dropdown}
    </div>
  )
}
