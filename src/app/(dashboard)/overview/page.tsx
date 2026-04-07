"use client"

/**
 * Overview / Dashboard Page
 * WAT:    Hoofdoverzicht met KPIs, charts en recente activiteit
 * WAAROM: Eerste view die je ziet — totaaloverzicht finance
 */

import { useState, useRef } from "react"
import { Header } from "@/components/dashboard/header"
import { StatCard } from "@/components/ui/stat-card"
import { formatCurrency } from "@/lib/utils"
import { useApi } from "@/hooks/use-api"
import type { DashboardKPIs, MonthlyRevenue, Invoice, Payment } from "@/types"
import { DollarSign, FileText, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight } from "lucide-react"

export default function OverviewPage() {
  const [activeCard, setActiveCard] = useState(0)
  const totalCards = 4
  const touchStartX = useRef<number | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) {
      if (diff > 0) setActiveCard((p) => Math.min(totalCards - 1, p + 1))
      else setActiveCard((p) => Math.max(0, p - 1))
    }
    touchStartX.current = null
  }

  const { data: dashboardKPIs, loading: loadingKPIs } = useApi<DashboardKPIs>(
    "/api/dashboard",
    { totalRevenue: 0, revenueChange: "+0%", outstandingInvoices: 0, totalExpenses: 0, expenseChange: "+0%", cashOnHand: 0, invoicesPaid: 0, invoicesPending: 0, proposalsWon: 0, proposalsTotal: 0, netIncome: 0 }
  )
  const { data: monthlyRevenue, loading: loadingRevenue } = useApi<MonthlyRevenue[]>("/api/dashboard/revenue", [])
  const { data: invoices, loading: loadingInvoices } = useApi<Invoice[]>("/api/invoices", [])
  const { data: payments, loading: loadingPayments } = useApi<Payment[]>("/api/payments", [])

  const loading = loadingKPIs || loadingRevenue || loadingInvoices || loadingPayments

  if (loading) {
    return (
      <div>
        <Header title="Dashboard" subtitle="Financial overview — Logix Layer N.V." />
        <div className="flex items-center justify-center p-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      </div>
    )
  }

  const mockInvoices = invoices
  const mockPayments = payments

  return (
    <div>
      <Header title="Dashboard" subtitle="Financial overview — Logix Layer N.V." />

      <div className="p-4 md:p-6 space-y-6">
        {/* KPI Cards — carousel on mobile, 4-col grid on desktop */}
        <div className="hidden md:grid md:grid-cols-4 gap-4">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(dashboardKPIs.totalRevenue)}
            change={{ value: dashboardKPIs.revenueChange, positive: true }}
            icon={DollarSign}
            iconColor="text-emerald-600"
          />
          <StatCard
            title="Outstanding"
            value={formatCurrency(dashboardKPIs.outstandingInvoices)}
            icon={FileText}
            iconColor="text-amber-600"
          />
          <StatCard
            title="Expenses"
            value={formatCurrency(dashboardKPIs.totalExpenses)}
            change={{ value: dashboardKPIs.expenseChange, positive: false }}
            icon={TrendingDown}
            iconColor="text-red-500"
          />
          <StatCard
            title="Cash on Hand"
            value={formatCurrency(dashboardKPIs.cashOnHand)}
            icon={Wallet}
            iconColor="text-brand-600"
          />
        </div>
        {/* Mobile carousel */}
        <div className="md:hidden relative" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${activeCard * 100}%)` }}
            >
              {[
                <StatCard key="revenue" title="Total Revenue" value={formatCurrency(dashboardKPIs.totalRevenue)} change={{ value: dashboardKPIs.revenueChange, positive: true }} icon={DollarSign} iconColor="text-emerald-600" />,
                <StatCard key="outstanding" title="Outstanding" value={formatCurrency(dashboardKPIs.outstandingInvoices)} icon={FileText} iconColor="text-amber-600" />,
                <StatCard key="expenses" title="Expenses" value={formatCurrency(dashboardKPIs.totalExpenses)} change={{ value: dashboardKPIs.expenseChange, positive: false }} icon={TrendingDown} iconColor="text-red-500" />,
                <StatCard key="cash" title="Cash on Hand" value={formatCurrency(dashboardKPIs.cashOnHand)} icon={Wallet} iconColor="text-brand-600" />,
              ].map((card, i) => (
                <div key={i} className="w-full flex-shrink-0">
                  {card}
                </div>
              ))}
            </div>
          </div>
          {/* Dots + Arrows inline */}
          <div className="flex items-center justify-center gap-2 mt-3">
            <button
              onClick={() => setActiveCard((p) => Math.max(0, p - 1))}
              disabled={activeCard === 0}
              className="rounded-full p-0.5 text-surface-400 disabled:opacity-25 hover:text-surface-600 transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            {Array.from({ length: totalCards }).map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveCard(i)}
                className={`h-1.5 rounded-full transition-all ${i === activeCard ? "w-4 bg-brand-600" : "w-1.5 bg-surface-300"}`}
              />
            ))}
            <button
              onClick={() => setActiveCard((p) => Math.min(totalCards - 1, p + 1))}
              disabled={activeCard === totalCards - 1}
              className="rounded-full p-0.5 text-surface-400 disabled:opacity-25 hover:text-surface-600 transition-colors"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Revenue Chart + Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Revenue Chart */}
          <div className="card col-span-2 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold text-surface-700">Revenue vs Expenses</h3>
              <span className="text-2xs text-surface-400">Last 6 months</span>
            </div>
            <div className="flex items-end gap-3 h-40">
              {monthlyRevenue.map((m) => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex gap-0.5 items-end justify-center" style={{ height: "120px" }}>
                    <div
                      className="w-3 rounded-t bg-brand-500"
                      style={{ height: `${(m.revenue / 60000) * 120}px` }}
                      title={`Revenue: ${formatCurrency(m.revenue)}`}
                    />
                    <div
                      className="w-3 rounded-t bg-red-300"
                      style={{ height: `${(m.expenses / 60000) * 120}px` }}
                      title={`Expenses: ${formatCurrency(m.expenses)}`}
                    />
                  </div>
                  <span className="text-2xs text-surface-400">{m.month}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-4 text-2xs text-surface-400">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-brand-500" /> Revenue</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-300" /> Expenses</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-4">
            <div className="card p-4">
              <h3 className="text-xs font-semibold text-surface-700 mb-3">Invoice Status</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xs text-surface-500">Paid</span>
                  <span className="text-xs font-medium text-emerald-600">{dashboardKPIs.invoicesPaid}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-surface-100">
                  <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${(dashboardKPIs.invoicesPaid / mockInvoices.length) * 100}%` }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xs text-surface-500">Pending</span>
                  <span className="text-xs font-medium text-amber-600">{dashboardKPIs.invoicesPending}</span>
                </div>
              </div>
            </div>
            <div className="card p-4">
              <h3 className="text-xs font-semibold text-surface-700 mb-3">Proposals</h3>
              <div className="flex items-center justify-between">
                <span className="text-2xs text-surface-500">Won rate</span>
                <span className="text-xs font-semibold text-brand-600">
                  {dashboardKPIs.proposalsTotal > 0 ? Math.round((dashboardKPIs.proposalsWon / dashboardKPIs.proposalsTotal) * 100) : 0}%
                </span>
              </div>
              <p className="text-2xs text-surface-400 mt-1">
                {dashboardKPIs.proposalsWon} of {dashboardKPIs.proposalsTotal} proposals approved
              </p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Recent Invoices */}
          <div className="card">
            <div className="flex items-center justify-between px-4 py-3 border-b border-surface-100">
              <h3 className="text-xs font-semibold text-surface-700">Recent Invoices</h3>
              <a href="/invoices" className="text-2xs text-brand-600 hover:underline">View all</a>
            </div>
            <div className="divide-y divide-surface-100">
              {mockInvoices.slice(0, 4).map((inv) => (
                <div key={inv.id} className="flex items-center justify-between px-4 py-2.5">
                  <div>
                    <p className="text-xs font-medium text-surface-700">{inv.number}</p>
                    <p className="text-2xs text-surface-400">{inv.client?.name || "-"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-surface-700">{formatCurrency(inv.total)}</p>
                    <span className={`badge-${inv.status === "PAID" ? "success" : inv.status === "OVERDUE" ? "danger" : inv.status === "PARTIAL" ? "warning" : "info"}`}>
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Payments */}
          <div className="card">
            <div className="flex items-center justify-between px-4 py-3 border-b border-surface-100">
              <h3 className="text-xs font-semibold text-surface-700">Recent Payments</h3>
              <a href="/payments" className="text-2xs text-brand-600 hover:underline">View all</a>
            </div>
            <div className="divide-y divide-surface-100">
              {mockPayments.map((pay) => (
                <div key={pay.id} className="flex items-center justify-between px-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className={`rounded-full p-1 ${pay.status === "COMPLETED" ? "bg-emerald-50" : "bg-amber-50"}`}>
                      {pay.status === "COMPLETED" ? (
                        <ArrowUpRight className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 text-amber-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-surface-700">{pay.client?.name || "-"}</p>
                      <p className="text-2xs text-surface-400">{pay.invoice?.number || "-"}</p>
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-emerald-600">+{formatCurrency(pay.amount)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
