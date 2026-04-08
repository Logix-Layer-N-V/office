"use client"

import { useState, useRef, useEffect } from "react"
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

      {open && activeItems.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-surface-200 bg-white shadow-lg max-h-56 overflow-hidden">
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
          <div className="overflow-auto max-h-44">
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
                  className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-surface-50 transition-colors"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-600">
                    <Package className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-800 truncate">{item.name}</p>
                    <p className="text-2xs text-surface-400">
                      {typeLabel[item.type] || item.type} &middot; ${parseFloat(item.rate).toFixed(2)}/{item.unit}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-surface-500">${parseFloat(item.rate).toFixed(2)}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
