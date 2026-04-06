"use client"

/**
 * banks/page.tsx
 * WAT:    Bank accounts, crypto wallets en transacties
 * WAAROM: Centraal overzicht van alle financiële accounts incl. crypto
 * GEBRUIK: /banks route
 */

import { useState } from "react"
import { Header } from "@/components/dashboard/header"
import { Modal } from "@/components/ui/modal"
import { useApi } from "@/hooks/use-api"
import type { BankAccount, Transaction } from "@/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Landmark, ArrowUpRight, ArrowDownRight, ArrowLeftRight, AlertCircle, Bitcoin, Shield } from "lucide-react"

export default function BanksPage() {
  const [showAdd, setShowAdd] = useState(false)
  const [activeTab, setActiveTab] = useState<"accounts" | "crypto" | "transactions">("accounts")
  const { data: bankAccountsAll, loading } = useApi<BankAccount[]>("/api/bank-accounts", [])
  const { data: transactions, loading: loadingTx } = useApi<Transaction[]>("/api/transactions", [])

  if (loading || loadingTx) {
    return (
      <div>
        <Header title="Banking" subtitle="Bank accounts, crypto wallets & transactions" action={{ label: "Add Account", onClick: () => setShowAdd(true) }} />
        <div className="flex items-center justify-center p-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      </div>
    )
  }

  const mockBankAccounts = bankAccountsAll
  const mockTransactions = transactions

  const bankAccounts = mockBankAccounts.filter(b => b.type !== "CRYPTO")
  const cryptoAccounts = mockBankAccounts.filter(b => b.type === "CRYPTO")
  const totalBankBalance = bankAccounts.reduce((s, b) => s + b.balance, 0)
  const totalCryptoBalance = cryptoAccounts.reduce((s, b) => s + b.balance, 0)
  const totalBalance = mockBankAccounts.reduce((s, b) => s + b.balance, 0)

  const cryptoTx = mockTransactions.filter(tx =>
    cryptoAccounts.some(ca => ca.name === tx.bank)
  )
  const bankTx = mockTransactions.filter(tx =>
    !cryptoAccounts.some(ca => ca.name === tx.bank)
  )

  const txIcon = (type: string) => {
    if (type === "DEPOSIT") return <ArrowUpRight className="h-3 w-3 text-emerald-600" />
    if (type === "WITHDRAWAL") return <ArrowDownRight className="h-3 w-3 text-red-500" />
    if (type === "TRANSFER") return <ArrowLeftRight className="h-3 w-3 text-brand-600" />
    return <AlertCircle className="h-3 w-3 text-amber-600" />
  }

  const renderTransactions = (txs: Transaction[]) => (
    <div className="card divide-y divide-surface-100">
      {txs.length === 0 ? (
        <div className="py-8 text-center text-surface-400 text-xs">No transactions</div>
      ) : txs.map((tx) => (
        <div key={tx.id} className="flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-surface-50 p-1.5">{txIcon(tx.type)}</div>
            <div>
              <p className="text-xs font-medium text-surface-700">{tx.description}</p>
              <p className="text-2xs text-surface-400">{tx.bank} · {formatDate(tx.date)}</p>
            </div>
          </div>
          <span className={`text-xs font-semibold ${tx.type === "DEPOSIT" ? "text-emerald-600" : tx.type === "WITHDRAWAL" || tx.type === "FEE" ? "text-red-500" : "text-surface-700"}`}>
            {tx.type === "DEPOSIT" ? "+" : "-"}{formatCurrency(tx.amount)}
          </span>
        </div>
      ))}
    </div>
  )

  return (
    <div>
      <Header title="Banking" subtitle="Bank accounts, crypto wallets & transactions" action={{ label: "Add Account", onClick: () => setShowAdd(true) }} />

      <div className="p-6 space-y-4">
        {/* Balance overview */}
        <div className="grid grid-cols-3 gap-3">
          <div className="card p-4">
            <p className="text-2xs text-surface-400 uppercase tracking-wider">Total Balance</p>
            <p className="text-2xl font-bold text-surface-800">{formatCurrency(totalBalance)}</p>
          </div>
          <div className="card p-4 flex items-center gap-3">
            <Landmark className="h-6 w-6 text-brand-500" />
            <div>
              <p className="text-2xs text-surface-400">Bank Accounts</p>
              <p className="text-lg font-bold text-surface-800">{formatCurrency(totalBankBalance)}</p>
            </div>
          </div>
          <div className="card p-4 flex items-center gap-3">
            <Bitcoin className="h-6 w-6 text-amber-500" />
            <div>
              <p className="text-2xs text-surface-400">Crypto / USDT</p>
              <p className="text-lg font-bold text-amber-600">{formatCurrency(totalCryptoBalance)}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-surface-200">
          {([
            { key: "accounts" as const, label: "Bank Accounts" },
            { key: "crypto" as const, label: "Crypto / USDT" },
            { key: "transactions" as const, label: "All Transactions" },
          ]).map(({ key, label }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`px-3 py-2 text-xs font-medium border-b-2 -mb-px transition-colors ${activeTab === key ? "border-brand-600 text-brand-600" : "border-transparent text-surface-400 hover:text-surface-600"}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Bank Accounts Tab */}
        {activeTab === "accounts" && (
          <>
            <div className="grid grid-cols-3 gap-3">
              {bankAccounts.map((acc) => (
                <div key={acc.id} className="card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="badge-neutral">{acc.type}</span>
                    {acc.isDefault && <span className="badge-info">Default</span>}
                  </div>
                  <p className="text-xs font-semibold text-surface-800">{acc.name}</p>
                  <p className="text-2xs text-surface-400">{acc.bankName} · {acc.accountNumber}</p>
                  <p className="mt-2 text-lg font-bold text-surface-800">{formatCurrency(acc.balance)}</p>
                </div>
              ))}
            </div>
            <h3 className="text-xs font-semibold text-surface-700 mt-4">Recent Bank Transactions</h3>
            {renderTransactions(bankTx)}
          </>
        )}

        {/* Crypto Tab */}
        {activeTab === "crypto" && (
          <>
            <div className="grid grid-cols-3 gap-3">
              {cryptoAccounts.map((acc) => (
                <div key={acc.id} className="card p-4 border-amber-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="badge bg-amber-50 text-amber-700">{acc.currency}</span>
                    <Shield className="h-3.5 w-3.5 text-surface-300" />
                  </div>
                  <p className="text-xs font-semibold text-surface-800">{acc.name}</p>
                  <p className="text-2xs text-surface-400 font-mono">{acc.bankName} · {acc.accountNumber}</p>
                  <p className="mt-2 text-lg font-bold text-amber-600">{formatCurrency(acc.balance)}</p>
                </div>
              ))}
            </div>
            <h3 className="text-xs font-semibold text-surface-700 mt-4">Crypto Transactions</h3>
            {renderTransactions(cryptoTx)}
          </>
        )}

        {/* All Transactions Tab */}
        {activeTab === "transactions" && renderTransactions(mockTransactions)}
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Account">
        <form className="space-y-4">
          <div><label className="label">Account Name</label><input type="text" className="input" placeholder="e.g. USDT Wallet (TRC-20)" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Network / Bank</label><input type="text" className="input" placeholder="e.g. Tron Network" /></div>
            <div><label className="label">Account Type</label>
              <select className="input"><option>Checking</option><option>Savings</option><option>Cash</option><option>Crypto</option></select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Wallet / Account Number</label><input type="text" className="input" placeholder="Address or account #" /></div>
            <div><label className="label">Currency</label>
              <select className="input"><option>USD</option><option>EUR</option><option>USDT</option><option>BTC</option><option>ETH</option></select>
            </div>
          </div>
          <div><label className="label">Opening Balance</label><input type="number" className="input" step="0.01" defaultValue={0} /></div>
          <div className="flex justify-end gap-2 pt-3 border-t border-surface-200">
            <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Add Account</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
