"use client"

import { useState, useEffect, useRef } from "react"
import { Search, Filter, X, Bookmark, BookmarkCheck, ChevronDown, Plus, Trash2 } from "lucide-react"

// ─── Types ────────────────────────────────────

export interface FilterOption {
  key: string
  label: string
  type: "select" | "multiselect" | "daterange"
  options?: { value: string; label: string }[]
}

export interface ActiveFilter {
  key: string
  value: string | string[]
}

export interface SavedFilter {
  id: string
  name: string
  filters: ActiveFilter[]
  search: string
}

interface ListToolbarProps {
  /** Unique key for localStorage saved filters, e.g. "invoices" */
  storageKey: string
  /** Placeholder for search input */
  searchPlaceholder?: string
  /** Available filter definitions */
  filterOptions: FilterOption[]
  /** Quick filter tabs (e.g. status tabs) */
  quickFilters?: { value: string; label: string; count?: number }[]
  /** Current quick filter value */
  activeQuickFilter?: string
  /** Called when quick filter changes */
  onQuickFilterChange?: (value: string) => void
  /** Called when search or filters change */
  onChange: (search: string, filters: ActiveFilter[]) => void
}

// ─── Component ────────────────────────────────

export function ListToolbar({
  storageKey,
  searchPlaceholder = "Search...",
  filterOptions,
  quickFilters,
  activeQuickFilter,
  onQuickFilterChange,
  onChange,
}: ListToolbarProps) {
  const [search, setSearch] = useState("")
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [showSaved, setShowSaved] = useState(false)
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([])
  const [saveName, setSaveName] = useState("")
  const [showSaveInput, setShowSaveInput] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)
  const savedRef = useRef<HTMLDivElement>(null)

  // Load saved filters from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`filters:${storageKey}`)
      if (stored) setSavedFilters(JSON.parse(stored))
    } catch {}
  }, [storageKey])

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setShowFilters(false)
      if (savedRef.current && !savedRef.current.contains(e.target as Node)) {
        setShowSaved(false)
        setShowSaveInput(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // Notify parent on search/filter changes
  useEffect(() => {
    onChange(search, activeFilters)
  }, [search, activeFilters])

  const setFilter = (key: string, value: string | string[]) => {
    const isEmpty = Array.isArray(value) ? value.length === 0 : !value
    if (isEmpty) {
      setActiveFilters((f) => f.filter((af) => af.key !== key))
    } else {
      setActiveFilters((f) => {
        const existing = f.findIndex((af) => af.key === key)
        if (existing >= 0) {
          const copy = [...f]
          copy[existing] = { key, value }
          return copy
        }
        return [...f, { key, value }]
      })
    }
  }

  const clearAll = () => {
    setSearch("")
    setActiveFilters([])
  }

  const persistSaved = (filters: SavedFilter[]) => {
    setSavedFilters(filters)
    try { localStorage.setItem(`filters:${storageKey}`, JSON.stringify(filters)) } catch {}
  }

  const saveCurrentFilter = () => {
    if (!saveName.trim()) return
    const newFilter: SavedFilter = {
      id: Date.now().toString(36),
      name: saveName.trim(),
      filters: activeFilters,
      search,
    }
    persistSaved([...savedFilters, newFilter])
    setSaveName("")
    setShowSaveInput(false)
  }

  const loadSavedFilter = (sf: SavedFilter) => {
    setSearch(sf.search)
    setActiveFilters(sf.filters)
    setShowSaved(false)
  }

  const deleteSavedFilter = (id: string) => {
    persistSaved(savedFilters.filter((f) => f.id !== id))
  }

  const hasActiveFilters = search || activeFilters.length > 0

  return (
    <div className="space-y-3">
      {/* Row 1: Search + Filter button + Saved filters */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9 pr-8 h-9"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filter dropdown */}
        {filterOptions.length > 0 && (
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary h-9 ${activeFilters.length > 0 ? "border-brand-300 bg-brand-50 text-brand-700" : ""}`}
            >
              <Filter className="h-3.5 w-3.5" />
              Filters
              {activeFilters.length > 0 && (
                <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 text-white text-2xs px-1">
                  {activeFilters.length}
                </span>
              )}
            </button>

            {showFilters && (
              <div className="absolute right-0 top-full mt-1 z-20 w-72 bg-white rounded-lg shadow-xl border border-surface-200 p-3 space-y-3">
                {filterOptions.map((fo) => (
                  <div key={fo.key}>
                    <label className="label">{fo.label}</label>
                    {fo.type === "select" && fo.options && (
                      <select
                        className="input h-8 text-xs"
                        value={(activeFilters.find((af) => af.key === fo.key)?.value as string) || ""}
                        onChange={(e) => setFilter(fo.key, e.target.value)}
                      >
                        <option value="">All</option>
                        {fo.options.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    )}
                  </div>
                ))}
                {activeFilters.length > 0 && (
                  <button onClick={() => setActiveFilters([])} className="text-2xs text-red-500 hover:text-red-700">
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Saved filters */}
        <div className="relative" ref={savedRef}>
          <button
            onClick={() => setShowSaved(!showSaved)}
            className="btn-secondary h-9"
          >
            {savedFilters.length > 0 ? <BookmarkCheck className="h-3.5 w-3.5 text-brand-600" /> : <Bookmark className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">Saved</span>
            {savedFilters.length > 0 && (
              <span className="ml-1 text-2xs text-surface-500">{savedFilters.length}</span>
            )}
          </button>

          {showSaved && (
            <div className="absolute right-0 top-full mt-1 z-20 w-64 bg-white rounded-lg shadow-xl border border-surface-200">
              {savedFilters.length > 0 ? (
                <div className="max-h-48 overflow-y-auto">
                  {savedFilters.map((sf) => (
                    <div key={sf.id} className="flex items-center gap-2 px-3 py-2 hover:bg-surface-50 group">
                      <button onClick={() => loadSavedFilter(sf)} className="flex-1 text-left text-xs font-medium text-surface-700 truncate">
                        {sf.name}
                      </button>
                      <span className="text-2xs text-surface-400">{sf.filters.length}f</span>
                      <button onClick={() => deleteSavedFilter(sf.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="px-3 py-4 text-center text-2xs text-surface-400">No saved filters yet</p>
              )}

              <div className="border-t border-surface-200 p-2">
                {showSaveInput ? (
                  <div className="flex items-center gap-1">
                    <input
                      autoFocus
                      className="input h-7 text-xs flex-1"
                      placeholder="Filter name..."
                      value={saveName}
                      onChange={(e) => setSaveName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && saveCurrentFilter()}
                    />
                    <button onClick={saveCurrentFilter} className="btn-primary h-7 text-2xs px-2">Save</button>
                    <button onClick={() => { setShowSaveInput(false); setSaveName("") }} className="text-surface-400 hover:text-surface-600">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowSaveInput(true)}
                    disabled={!hasActiveFilters}
                    className="w-full text-left text-xs text-brand-600 hover:text-brand-800 disabled:text-surface-300 disabled:cursor-not-allowed flex items-center gap-1.5 px-1 py-1"
                  >
                    <Plus className="h-3.5 w-3.5" /> Save current filter
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Clear all */}
        {hasActiveFilters && (
          <button onClick={clearAll} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
            <X className="h-3 w-3" /> Clear
          </button>
        )}
      </div>

      {/* Row 2: Quick filter tabs */}
      {quickFilters && onQuickFilterChange && (
        <div className="flex items-center gap-1 border-b border-surface-200 -mb-1">
          {quickFilters.map((qf) => (
            <button
              key={qf.value}
              onClick={() => onQuickFilterChange(qf.value)}
              className={`px-3 py-1.5 text-xs font-medium border-b-2 transition-colors ${
                activeQuickFilter === qf.value
                  ? "border-brand-600 text-brand-700"
                  : "border-transparent text-surface-500 hover:text-surface-700"
              }`}
            >
              {qf.label}
              {qf.count !== undefined && (
                <span className="ml-1.5 text-2xs text-surface-400">{qf.count}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Row 3: Active filter chips */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {activeFilters.map((af) => {
            const def = filterOptions.find((fo) => fo.key === af.key)
            const label = def?.options?.find((o) => o.value === af.value)?.label || af.value
            return (
              <span key={af.key} className="inline-flex items-center gap-1 rounded-full bg-brand-50 border border-brand-200 px-2.5 py-0.5 text-2xs font-medium text-brand-700">
                {def?.label}: {label}
                <button onClick={() => setFilter(af.key, "")} className="text-brand-400 hover:text-brand-600">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Helper: apply search + filters to data ───

export function applyFilters<T extends Record<string, unknown>>(
  data: T[],
  search: string,
  filters: ActiveFilter[],
  searchFields: (keyof T)[],
): T[] {
  let result = data

  // Text search
  if (search) {
    const q = search.toLowerCase()
    result = result.filter((item) =>
      searchFields.some((field) => {
        const val = item[field]
        if (typeof val === "string") return val.toLowerCase().includes(q)
        if (typeof val === "number") return String(val).includes(q)
        if (val && typeof val === "object" && "name" in val) return String((val as { name: string }).name).toLowerCase().includes(q)
        return false
      })
    )
  }

  // Filters
  for (const af of filters) {
    if (!af.value || (Array.isArray(af.value) && af.value.length === 0)) continue
    result = result.filter((item) => {
      const val = item[af.key]
      if (Array.isArray(af.value)) return af.value.includes(String(val))
      return String(val) === af.value
    })
  }

  return result
}
