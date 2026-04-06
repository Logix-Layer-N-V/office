"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Search, X, FileText, Calculator, Receipt, CreditCard, Users, Package, FolderKanban, ClipboardList, ListTodo, Landmark, TrendingDown, Wallet, BookOpen, CalendarDays, BarChart3, Settings, type LucideIcon } from "lucide-react"

// ─── Searchable routes ──────────────────────────────
interface SearchItem {
  label: string
  href: string
  icon: LucideIcon
  category: string
  keywords: string[]
}

const SEARCH_ITEMS: SearchItem[] = [
  // CRM
  { label: "Clients", href: "/clients", icon: Users, category: "CRM", keywords: ["client", "customer", "contact", "company", "klant"] },
  { label: "New Client", href: "/clients/new", icon: Users, category: "CRM", keywords: ["new client", "add client", "create client", "nieuwe klant"] },
  { label: "Items / Services", href: "/items", icon: Package, category: "CRM", keywords: ["item", "service", "product", "dienst"] },
  { label: "New Item", href: "/items/new", icon: Package, category: "CRM", keywords: ["new item", "add item", "create item", "nieuw item"] },
  // Sales
  { label: "Proposals", href: "/proposals", icon: FileText, category: "Sales", keywords: ["proposal", "voorstel", "offerte", "quote"] },
  { label: "New Proposal", href: "/proposals/new", icon: FileText, category: "Sales", keywords: ["new proposal", "create proposal", "nieuw voorstel"] },
  { label: "Estimates", href: "/estimates", icon: Calculator, category: "Sales", keywords: ["estimate", "schatting", "raming", "quote"] },
  { label: "New Estimate", href: "/estimates/new", icon: Calculator, category: "Sales", keywords: ["new estimate", "create estimate"] },
  { label: "Invoices", href: "/invoices", icon: Receipt, category: "Sales", keywords: ["invoice", "factuur", "bill", "rekening"] },
  { label: "New Invoice", href: "/invoices/new", icon: Receipt, category: "Sales", keywords: ["new invoice", "create invoice", "nieuwe factuur"] },
  { label: "Payments", href: "/payments", icon: CreditCard, category: "Sales", keywords: ["payment", "betaling", "pay", "received"] },
  { label: "New Payment", href: "/payments/new", icon: CreditCard, category: "Sales", keywords: ["new payment", "record payment", "nieuwe betaling"] },
  // Project Management
  { label: "Projects", href: "/projects", icon: FolderKanban, category: "Projects", keywords: ["project", "projecten"] },
  { label: "New Project", href: "/projects/new", icon: FolderKanban, category: "Projects", keywords: ["new project", "create project", "nieuw project"] },
  { label: "Work Orders", href: "/work-orders", icon: ClipboardList, category: "Projects", keywords: ["work order", "werkorder", "order"] },
  { label: "New Work Order", href: "/work-orders/new", icon: ClipboardList, category: "Projects", keywords: ["new work order", "create work order"] },
  { label: "Tasks", href: "/tasks", icon: ListTodo, category: "Projects", keywords: ["task", "taak", "todo", "taken"] },
  { label: "New Task", href: "/tasks/new", icon: ListTodo, category: "Projects", keywords: ["new task", "create task", "nieuwe taak"] },
  // Banking
  { label: "Bank Accounts", href: "/banks", icon: Landmark, category: "Banking", keywords: ["bank", "account", "rekening", "bankrekening"] },
  { label: "Transactions", href: "/banks?tab=transactions", icon: Landmark, category: "Banking", keywords: ["transaction", "transactie", "transfer"] },
  // Accounting
  { label: "Expenses", href: "/expenses", icon: TrendingDown, category: "Accounting", keywords: ["expense", "uitgave", "kosten", "cost"] },
  { label: "Credits", href: "/credits", icon: Wallet, category: "Accounting", keywords: ["credit", "tegoed"] },
  { label: "Loans", href: "/loans", icon: Landmark, category: "Accounting", keywords: ["loan", "lening", "debt"] },
  { label: "General Ledger", href: "/general-ledger", icon: BookOpen, category: "Accounting", keywords: ["ledger", "grootboek", "journal"] },
  // Other
  { label: "Calendar", href: "/calendar", icon: CalendarDays, category: "Overview", keywords: ["calendar", "agenda", "kalender", "schedule"] },
  { label: "Reports", href: "/reports", icon: BarChart3, category: "Reports", keywords: ["report", "rapport", "analytics", "statistieken"] },
  { label: "Team Members", href: "/users", icon: Users, category: "Settings", keywords: ["team", "member", "user", "medewerker", "gebruiker"] },
  { label: "Settings", href: "/settings", icon: Settings, category: "Settings", keywords: ["settings", "instellingen", "config"] },
  { label: "Dashboard", href: "/overview", icon: BarChart3, category: "Overview", keywords: ["dashboard", "overview", "overzicht", "home"] },
]

export function GlobalSearch() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Ctrl+K listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen(true)
        setQuery("")
        setSelectedIndex(0)
      }
      if (e.key === "Escape") {
        setOpen(false)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  // Auto-focus when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Click outside
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  // Filter results
  const results = query.trim()
    ? SEARCH_ITEMS.filter((item) => {
        const q = query.toLowerCase()
        return (
          item.label.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.keywords.some((k) => k.includes(q))
        )
      })
    : SEARCH_ITEMS.slice(0, 8) // Show popular items when no query

  // Group by category
  const grouped = results.reduce<Record<string, SearchItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault()
      router.push(results[selectedIndex].href)
      setOpen(false)
    }
  }

  const navigate = (href: string) => {
    router.push(href)
    setOpen(false)
  }

  // Inline trigger (for header)
  const SearchTrigger = (
    <button
      onClick={() => { setOpen(true); setQuery(""); setSelectedIndex(0) }}
      className="flex items-center gap-2 rounded-lg border border-surface-200 bg-surface-50 px-3 py-1.5 text-xs text-surface-400 hover:border-surface-300 hover:bg-white transition-colors w-full"
    >
      <Search className="h-3.5 w-3.5" />
      <span className="flex-1 text-left">Search anywhere...</span>
      <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-surface-200 bg-white px-1.5 py-0.5 text-2xs font-mono text-surface-400">
        Ctrl K
      </kbd>
    </button>
  )

  return (
    <>
      {SearchTrigger}

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

          {/* Dialog */}
          <div className="flex items-start justify-center pt-[15vh]">
            <div
              ref={containerRef}
              className="relative w-full max-w-lg mx-4 rounded-xl border border-surface-200 bg-white shadow-2xl overflow-hidden"
            >
              {/* Search input */}
              <div className="flex items-center gap-3 border-b border-surface-200 px-4 py-3">
                <Search className="h-5 w-5 text-surface-400 flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0) }}
                  onKeyDown={handleKeyDown}
                  placeholder="Search pages, actions, entities..."
                  className="flex-1 bg-transparent text-sm text-surface-800 placeholder:text-surface-400 outline-none"
                />
                {query && (
                  <button onClick={() => setQuery("")} className="text-surface-400 hover:text-surface-600">
                    <X className="h-4 w-4" />
                  </button>
                )}
                <kbd className="rounded border border-surface-200 px-1.5 py-0.5 text-2xs text-surface-400">ESC</kbd>
              </div>

              {/* Results */}
              <div className="max-h-[400px] overflow-y-auto py-2">
                {results.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <p className="text-sm text-surface-400">No results for &quot;{query}&quot;</p>
                    <p className="text-2xs text-surface-300 mt-1">Try a different search term</p>
                  </div>
                ) : (
                  Object.entries(grouped).map(([category, items]) => (
                    <div key={category}>
                      <div className="px-4 py-1.5">
                        <span className="text-2xs font-semibold uppercase tracking-wider text-surface-400">{category}</span>
                      </div>
                      {items.map((item) => {
                        const globalIdx = results.indexOf(item)
                        const isSelected = globalIdx === selectedIndex
                        const Icon = item.icon
                        return (
                          <button
                            key={item.href}
                            onClick={() => navigate(item.href)}
                            onMouseEnter={() => setSelectedIndex(globalIdx)}
                            className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                              isSelected ? "bg-brand-50 text-brand-700" : "text-surface-700 hover:bg-surface-50"
                            }`}
                          >
                            <Icon className={`h-4 w-4 flex-shrink-0 ${isSelected ? "text-brand-600" : "text-surface-400"}`} />
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-medium">{item.label}</span>
                            </div>
                            {isSelected && (
                              <span className="text-2xs text-brand-400">Enter ↵</span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-surface-200 px-4 py-2 flex items-center gap-4 text-2xs text-surface-400">
                <span className="flex items-center gap-1"><kbd className="rounded border px-1">↑↓</kbd> Navigate</span>
                <span className="flex items-center gap-1"><kbd className="rounded border px-1">↵</kbd> Open</span>
                <span className="flex items-center gap-1"><kbd className="rounded border px-1">esc</kbd> Close</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
