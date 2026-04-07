"use client"

import { useState } from "react"
import { Header } from "@/components/dashboard/header"
import { Modal } from "@/components/ui/modal"
import { useApi } from "@/hooks/use-api"
import type { ChartOfAccount, LedgerEntry } from "@/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { BookOpen, ChevronRight } from "lucide-react"

// Fallback Chart of Accounts Data
const defaultChartOfAccounts: ChartOfAccount[] = [
  // ASSETS — Current
  { code: "1000", name: "Cash — Bank Accounts", type: "ASSET", subtype: "Current", balance: 134800.00 },
  { code: "1010", name: "Cash — Crypto / USDT", type: "ASSET", subtype: "Current", balance: 25600.00 },
  { code: "1100", name: "Accounts Receivable", type: "ASSET", subtype: "Current", balance: 17900.00 },
  { code: "1200", name: "Prepaid Expenses", type: "ASSET", subtype: "Current", balance: 2400.00 },
  // ASSETS — Infrastructure (INFRA)
  { code: "1300", name: "Cloud Infrastructure", type: "ASSET", subtype: "INFRA", balance: 4800.00 },
  { code: "1310", name: "Domain Names & SSL", type: "ASSET", subtype: "INFRA", balance: 650.00 },
  { code: "1320", name: "API Subscriptions", type: "ASSET", subtype: "INFRA", balance: 1580.00 },
  { code: "1330", name: "AI/ML Credits & Tokens", type: "ASSET", subtype: "INFRA", balance: 2200.00 },
  { code: "1340", name: "SaaS Licenses", type: "ASSET", subtype: "INFRA", balance: 3600.00 },
  // ASSETS — Hardware & Tools
  { code: "1500", name: "MacBook Pro M4 (Dev)", type: "ASSET", subtype: "Hardware", balance: 3499.00 },
  { code: "1510", name: "MacBook Pro M3 (Design)", type: "ASSET", subtype: "Hardware", balance: 2799.00 },
  { code: "1520", name: "Monitors & Peripherals", type: "ASSET", subtype: "Hardware", balance: 1850.00 },
  { code: "1530", name: "Server / NAS Storage", type: "ASSET", subtype: "Hardware", balance: 2200.00 },
  { code: "1540", name: "Networking Equipment", type: "ASSET", subtype: "Hardware", balance: 450.00 },
  { code: "1550", name: "Mobile Devices (Testing)", type: "ASSET", subtype: "Hardware", balance: 1200.00 },
  { code: "1590", name: "Acc. Depreciation — Hardware", type: "ASSET", subtype: "Hardware", balance: -2400.00 },
  // LIABILITIES
  { code: "2000", name: "Accounts Payable", type: "LIABILITY", subtype: "Current", balance: 4500.00 },
  { code: "2100", name: "Accrued Liabilities", type: "LIABILITY", subtype: "Current", balance: 1200.00 },
  { code: "2200", name: "Tax Payable", type: "LIABILITY", subtype: "Current", balance: 3200.00 },
  { code: "2500", name: "Loans Payable — Equipment", type: "LIABILITY", subtype: "Long-term", balance: 18750.00 },
  { code: "2510", name: "Loans Payable — Working Capital", type: "LIABILITY", subtype: "Long-term", balance: 35000.00 },
  // EQUITY
  { code: "3000", name: "Owner's Equity", type: "EQUITY", subtype: "", balance: 50000.00 },
  { code: "3100", name: "Retained Earnings", type: "EQUITY", subtype: "", balance: 18316.00 },
  // REVENUE
  { code: "4000", name: "Service Revenue", type: "REVENUE", subtype: "Operating", balance: 54625.00 },
  { code: "4100", name: "Product Revenue", type: "REVENUE", subtype: "Operating", balance: 7500.00 },
  { code: "4200", name: "Crypto Income", type: "REVENUE", subtype: "Operating", balance: 4550.00 },
  { code: "4900", name: "Interest Income", type: "REVENUE", subtype: "Other", balance: 125.00 },
  // EXPENSES
  { code: "5000", name: "Salary Expense", type: "EXPENSE", subtype: "Personnel", balance: 0 },
  { code: "5100", name: "Rent Expense", type: "EXPENSE", subtype: "Operating", balance: 3200.00 },
  { code: "5200", name: "Software & Tools", type: "EXPENSE", subtype: "Operating", balance: 492.00 },
  { code: "5300", name: "Marketing Expense", type: "EXPENSE", subtype: "Operating", balance: 1500.00 },
  { code: "5400", name: "Contractor Expense", type: "EXPENSE", subtype: "Personnel", balance: 2600.00 },
  { code: "5500", name: "Hardware Depreciation", type: "EXPENSE", subtype: "Depreciation", balance: 400.00 },
  { code: "5600", name: "API & Hosting Costs", type: "EXPENSE", subtype: "INFRA", balance: 838.00 },
  { code: "5700", name: "AI Token Costs", type: "EXPENSE", subtype: "INFRA", balance: 672.00 },
  { code: "5800", name: "Network & Gas Fees", type: "EXPENSE", subtype: "Crypto", balance: 57.50 },
]

const defaultLedgerEntries: LedgerEntry[] = [
  { id: "le1", date: "2026-03-28", description: "Payment received - TechFlow INV-0001", account: "1000 Cash — Bank Accounts", debit: 6175.00, credit: 0, ref: "PAY-0001" },
  { id: "le2", date: "2026-03-28", description: "Payment received - TechFlow INV-0001", account: "1100 Accounts Receivable", debit: 0, credit: 6175.00, ref: "PAY-0001" },
  { id: "le3", date: "2026-03-25", description: "Payment received - BlockPay INV-0003", account: "1000 Cash — Bank Accounts", debit: 7500.00, credit: 0, ref: "PAY-0002" },
  { id: "le4", date: "2026-03-25", description: "Payment received - BlockPay INV-0003", account: "1100 Accounts Receivable", debit: 0, credit: 7500.00, ref: "PAY-0002" },
  { id: "le5", date: "2026-03-20", description: "Crypto payment - BlockPay INV-0004 (USDT)", account: "1010 Cash — Crypto / USDT", debit: 4550.00, credit: 0, ref: "PAY-0003" },
  { id: "le6", date: "2026-03-20", description: "Crypto payment - BlockPay INV-0004", account: "4200 Crypto Income", debit: 0, credit: 4550.00, ref: "PAY-0003" },
  { id: "le7", date: "2026-03-20", description: "Tron network gas fee", account: "5800 Network & Gas Fees", debit: 12.50, credit: 0, ref: "GAS-001" },
  { id: "le8", date: "2026-03-20", description: "Gas fee payment", account: "1010 Cash — Crypto / USDT", debit: 0, credit: 12.50, ref: "GAS-001" },
  { id: "le9", date: "2026-03-15", description: "Vercel + GitHub subscriptions", account: "5600 API & Hosting Costs", debit: 492.00, credit: 0, ref: "EXP-001" },
  { id: "le10", date: "2026-03-15", description: "Software subscriptions payment", account: "1000 Cash — Bank Accounts", debit: 0, credit: 492.00, ref: "EXP-001" },
  { id: "le11", date: "2026-03-15", description: "Claude API usage (Opus + Sonnet)", account: "5700 AI Token Costs", debit: 620.00, credit: 0, ref: "AI-001" },
  { id: "le12", date: "2026-03-15", description: "AI token cost payment", account: "1000 Cash — Bank Accounts", debit: 0, credit: 620.00, ref: "AI-001" },
  { id: "le13", date: "2026-03-10", description: "MacBook Pro M4 purchase", account: "1500 MacBook Pro M4 (Dev)", debit: 3499.00, credit: 0, ref: "HW-001" },
  { id: "le14", date: "2026-03-10", description: "MacBook Pro M4 payment", account: "1000 Cash — Bank Accounts", debit: 0, credit: 3499.00, ref: "HW-001" },
  { id: "le15", date: "2026-03-01", description: "Office rent payment", account: "5100 Rent Expense", debit: 3200.00, credit: 0, ref: "EXP-002" },
  { id: "le16", date: "2026-03-01", description: "Office rent payment", account: "1000 Cash — Bank Accounts", debit: 0, credit: 3200.00, ref: "EXP-002" },
  { id: "le17", date: "2026-03-01", description: "Monthly hardware depreciation", account: "5500 Hardware Depreciation", debit: 400.00, credit: 0, ref: "DEP-001" },
  { id: "le18", date: "2026-03-01", description: "Accumulated depreciation", account: "1590 Acc. Depreciation — Hardware", debit: 0, credit: 400.00, ref: "DEP-001" },
]

const typeColors: Record<string, string> = {
  ASSET: "text-blue-600 bg-blue-50",
  LIABILITY: "text-red-600 bg-red-50",
  EQUITY: "text-purple-600 bg-purple-50",
  REVENUE: "text-emerald-600 bg-emerald-50",
  EXPENSE: "text-amber-600 bg-amber-50",
}

export default function GeneralLedgerPage() {
  const [showEntry, setShowEntry] = useState(false)
  const [activeTab, setActiveTab] = useState<"coa" | "journal">("coa")
  const { data: accounts, loading: loadingAccounts } = useApi<ChartOfAccount[]>("/api/accounts", defaultChartOfAccounts)
  const { data: entries, loading: loadingEntries } = useApi<LedgerEntry[]>("/api/ledger", defaultLedgerEntries)

  if (loadingAccounts || loadingEntries) {
    return (
      <div>
        <Header title="General Ledger" subtitle="Chart of accounts and journal entries" action={{ label: "New Entry", onClick: () => setShowEntry(true) }} />
        <div className="flex items-center justify-center p-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      </div>
    )
  }

  const chartOfAccounts = accounts
  const ledgerEntries = entries

  const totalDebits = ledgerEntries.reduce((s, e) => s + (parseFloat(String(e.debit)) || 0), 0)
  const totalCredits = ledgerEntries.reduce((s, e) => s + (parseFloat(String(e.credit)) || 0), 0)

  const grouped = chartOfAccounts.reduce((acc, a) => {
    if (!acc[a.type]) acc[a.type] = []
    acc[a.type].push(a)
    return acc
  }, {} as Record<string, ChartOfAccount[]>)

  return (
    <div>
      <Header title="General Ledger" subtitle="Chart of accounts and journal entries" action={{ label: "New Entry", onClick: () => setShowEntry(true) }} />

      <div className="p-4 md:p-6 space-y-4">
        {/* Tabs */}
        <div className="flex gap-1 border-b border-surface-200">
          {([["coa", "Chart of Accounts"], ["journal", "Journal Entries"]] as const).map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`px-3 py-2 text-xs font-medium border-b-2 -mb-px transition-colors ${activeTab === key ? "border-brand-600 text-brand-600" : "border-transparent text-surface-400 hover:text-surface-600"}`}>
              {label}
            </button>
          ))}
        </div>

        {activeTab === "coa" ? (
          <div className="space-y-4">
            {(["ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE"] as const).map((type) => {
              const accounts = grouped[type] || []
              const subtypes = [...new Set(accounts.map(a => a.subtype || "General"))]

              return (
                <div key={type} className="card">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-surface-100">
                    <div className="flex items-center gap-2">
                      <span className={`badge ${typeColors[type]}`}>{type}</span>
                      <span className="text-xs font-medium text-surface-700">{type.charAt(0) + type.slice(1).toLowerCase()}s</span>
                    </div>
                    <span className="text-xs font-semibold text-surface-700">
                      {formatCurrency(accounts.reduce((s, a) => s + (a.balance ?? 0), 0))}
                    </span>
                  </div>
                  {subtypes.map((sub) => {
                    const subAccounts = accounts.filter(a => (a.subtype || "General") === sub)
                    return (
                      <div key={sub}>
                        {subtypes.length > 1 && (
                          <div className="flex items-center justify-between px-4 py-1.5 bg-surface-50 border-b border-surface-100">
                            <span className="text-2xs font-semibold uppercase tracking-wider text-surface-400">{sub}</span>
                            <span className="text-2xs font-medium text-surface-500">
                              {formatCurrency(subAccounts.reduce((s, a) => s + (a.balance ?? 0), 0))}
                            </span>
                          </div>
                        )}
                        <div className="divide-y divide-surface-50">
                          {subAccounts.map((acc) => (
                            <div key={acc.code} className="flex items-center justify-between px-4 py-2 hover:bg-surface-50">
                              <div className="flex items-center gap-3">
                                <span className="text-2xs font-mono text-surface-400 w-10">{acc.code}</span>
                                <span className="text-xs text-surface-700">{acc.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-medium ${(acc.balance ?? 0) < 0 ? "text-red-500" : "text-surface-700"}`}>
                                  {formatCurrency(acc.balance ?? 0)}
                                </span>
                                <ChevronRight className="h-3 w-3 text-surface-300" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="card">
            <div className="flex items-center justify-between px-4 py-3 border-b border-surface-100">
              <span className="text-xs font-medium text-surface-500">Journal Entries</span>
              <div className="flex items-center gap-4 text-2xs">
                <span>Total Debits: <strong className="text-surface-800">{formatCurrency(totalDebits)}</strong></span>
                <span>Total Credits: <strong className="text-surface-800">{formatCurrency(totalCredits)}</strong></span>
                <span className={totalDebits === totalCredits ? "text-emerald-600 font-medium" : "text-red-600 font-medium"}>
                  {totalDebits === totalCredits ? "Balanced" : "Unbalanced"}
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
            <table className="table-compact">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Account</th>
                  <th>Ref</th>
                  <th className="text-right">Debit</th>
                  <th className="text-right">Credit</th>
                </tr>
              </thead>
              <tbody>
                {ledgerEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td>{formatDate(entry.date)}</td>
                    <td>{entry.description}</td>
                    <td><span className="font-mono text-2xs">{typeof entry.account === 'string' ? entry.account : entry.account?.name}</span></td>
                    <td><span className="text-brand-600">{entry.ref}</span></td>
                    <td className="text-right font-medium">{entry.debit > 0 ? formatCurrency(entry.debit) : "—"}</td>
                    <td className="text-right font-medium">{entry.credit > 0 ? formatCurrency(entry.credit) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </div>

      <Modal open={showEntry} onClose={() => setShowEntry(false)} title="New Journal Entry" size="lg">
        <form className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="label">Date</label><input type="date" className="input" /></div>
            <div><label className="label">Reference</label><input type="text" className="input" placeholder="e.g. PAY-0005" /></div>
          </div>
          <div><label className="label">Description</label><input type="text" className="input" placeholder="Entry description" /></div>
          <div>
            <label className="label">Line Items</label>
            <div className="rounded-md border border-surface-200">
              <div className="overflow-x-auto">
              <table className="table-compact">
                <thead><tr><th>Account</th><th className="w-32 text-right">Debit</th><th className="w-32 text-right">Credit</th></tr></thead>
                <tbody>
                  <tr>
                    <td><select className="input">{chartOfAccounts.map(a => <option key={a.code} value={a.code}>{a.code} — {a.name}</option>)}</select></td>
                    <td><input type="number" className="input text-right" step="0.01" defaultValue={0} /></td>
                    <td><input type="number" className="input text-right" step="0.01" defaultValue={0} /></td>
                  </tr>
                  <tr>
                    <td><select className="input">{chartOfAccounts.map(a => <option key={a.code} value={a.code}>{a.code} — {a.name}</option>)}</select></td>
                    <td><input type="number" className="input text-right" step="0.01" defaultValue={0} /></td>
                    <td><input type="number" className="input text-right" step="0.01" defaultValue={0} /></td>
                  </tr>
                </tbody>
              </table>
              </div>
            </div>
            <button type="button" className="btn-ghost mt-2 text-2xs">+ Add line</button>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-surface-200">
            <button type="button" onClick={() => setShowEntry(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Post Entry</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
