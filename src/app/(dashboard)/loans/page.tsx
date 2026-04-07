"use client"

import { useState } from "react"
import { Header } from "@/components/dashboard/header"
import { Modal } from "@/components/ui/modal"
import { useApi } from "@/hooks/use-api"
import type { Loan } from "@/types"
import { formatCurrency, formatDate, getStatusColor, calcPercentage, toNum } from "@/lib/utils"
import { ListToolbar, applyFilters, type ActiveFilter } from "@/components/ui/list-toolbar"
import { StatCard } from "@/components/ui/stat-card"
import { Landmark, CalendarClock } from "lucide-react"

export default function LoansPage() {
  const [showAdd, setShowAdd] = useState(false)
  const { data: loans, loading } = useApi<Loan[]>("/api/loans", [])
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState<ActiveFilter[]>([])
  const [activeTab, setActiveTab] = useState("all")

  if (loading) {
    return (
      <div>
        <Header title="Loans" subtitle="Track loans and repayment schedules" action={{ label: "Add Loan", onClick: () => setShowAdd(true) }} />
        <div className="flex items-center justify-center p-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      </div>
    )
  }

  const totalDebt = loans.reduce((s, l) => s + (parseFloat(String(l.remainingBalance)) || 0), 0)
  const monthlyTotal = loans.reduce((s, l) => s + (parseFloat(String(l.monthlyPayment)) || 0), 0)

  let filtered = applyFilters(
    loans as unknown as Record<string, unknown>[],
    search,
    filters,
    ["name", "lender", "notes"]
  ) as unknown as Loan[]

  if (activeTab !== "all") {
    filtered = filtered.filter(l => l.status === activeTab.toUpperCase())
  }

  const quickFilters = [
    { value: "all", label: "All", count: loans.length },
    { value: "active", label: "Active", count: loans.filter(l => l.status === "ACTIVE").length },
    { value: "paid_off", label: "Paid Off", count: loans.filter(l => l.status === "PAID_OFF").length },
  ]

  return (
    <div>
      <Header title="Loans" subtitle="Track loans and repayment schedules" action={{ label: "Add Loan", onClick: () => setShowAdd(true) }} />

      <div className="p-4 md:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <StatCard title="Total Outstanding" value={formatCurrency(totalDebt)} icon={Landmark} iconColor="text-surface-600" />
          <StatCard title="Monthly Payments" value={formatCurrency(monthlyTotal)} icon={CalendarClock} iconColor="text-amber-600" />
        </div>

        <div className="card p-4">
          <ListToolbar
            storageKey="loans"
            searchPlaceholder="Search loans..."
            filterOptions={[
              { key: "status", label: "Status", type: "select", options: [
                { value: "ACTIVE", label: "Active" }, { value: "PAID_OFF", label: "Paid Off" },
                { value: "DEFAULTED", label: "Defaulted" },
              ]},
            ]}
            quickFilters={quickFilters}
            activeQuickFilter={activeTab}
            onQuickFilterChange={setActiveTab}
            onChange={(s, f) => { setSearch(s); setFilters(f) }}
          />
        </div>

        <div className="space-y-3">
          {filtered.map((loan) => {
            const paidPercent = calcPercentage(toNum(loan.amount) - toNum(loan.remainingBalance), toNum(loan.amount))
            return (
              <div key={loan.id} className="card p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-surface-800">{loan.name}</p>
                    <p className="text-2xs text-surface-400">{loan.lender} · {loan.interestRate}% APR</p>
                  </div>
                  <span className={getStatusColor(loan.status)}>{loan.status}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-3">
                  <div><p className="text-2xs text-surface-400">Original</p><p className="text-xs font-semibold">{formatCurrency(loan.amount)}</p></div>
                  <div><p className="text-2xs text-surface-400">Remaining</p><p className="text-xs font-semibold text-amber-600">{formatCurrency(loan.remainingBalance)}</p></div>
                  <div><p className="text-2xs text-surface-400">Monthly</p><p className="text-xs font-semibold">{formatCurrency(loan.monthlyPayment)}</p></div>
                  <div><p className="text-2xs text-surface-400">End Date</p><p className="text-xs font-semibold">{formatDate(loan.endDate)}</p></div>
                </div>
                <div className="h-1.5 w-full rounded-full bg-surface-100">
                  <div className="h-1.5 rounded-full bg-brand-500 transition-all" style={{ width: `${paidPercent}%` }} />
                </div>
                <p className="text-2xs text-surface-400 mt-1">{paidPercent}% repaid</p>
              </div>
            )
          })}
        </div>
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Loan">
        <form className="space-y-4">
          <div><label className="label">Loan Name</label><input type="text" className="input" placeholder="e.g. Business Equipment Loan" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Lender</label><input type="text" className="input" /></div>
            <div><label className="label">Amount (USD)</label><input type="number" className="input" step="0.01" /></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="label">Interest Rate (%)</label><input type="number" className="input" step="0.1" /></div>
            <div><label className="label">Start Date</label><input type="date" className="input" /></div>
            <div><label className="label">End Date</label><input type="date" className="input" /></div>
          </div>
          <div><label className="label">Monthly Payment</label><input type="number" className="input" step="0.01" /></div>
          <div className="flex justify-end gap-2 pt-3 border-t border-surface-200">
            <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Add Loan</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
