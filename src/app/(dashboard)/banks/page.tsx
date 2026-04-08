"use client"

/**
 * banks/page.tsx
 * WAT:    Bank accounts, crypto wallets, transacties + CSV import
 * WAAROM: Centraal overzicht van alle financiële accounts incl. crypto
 * GEBRUIK: /banks route
 */

import { useState, useMemo, useCallback, useRef } from "react"
import { Header } from "@/components/dashboard/header"
import { Modal } from "@/components/ui/modal"
import { useApi, apiMutate } from "@/hooks/use-api"
import type { BankAccount, Transaction } from "@/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import {
  Landmark, ArrowUpRight, ArrowDownRight, ArrowLeftRight, AlertCircle, Bitcoin, Shield,
  Upload, FileSpreadsheet, CheckCircle2, XCircle, ChevronRight, ArrowRight, Eye,
  Download, Trash2, AlertTriangle, RefreshCw, FileText, Filter
} from "lucide-react"

// ─── CSV Import Types ──────────────────────────
interface CsvRow {
  [key: string]: string
}

interface ColumnMapping {
  date: string
  description: string
  amount: string
  type: string        // column that indicates debit/credit (optional)
  reference: string   // reference/memo column (optional)
  balance: string     // running balance column (optional)
}

interface ParsedTransaction {
  id: string
  date: string
  description: string
  amount: number
  type: "DEPOSIT" | "WITHDRAWAL"
  reference: string
  selected: boolean
  raw: CsvRow
}

interface BankStatement {
  id: string
  accountId: string
  accountName: string
  importDate: string
  periodStart: string
  periodEnd: string
  openingBalance: number
  closingBalance: number
  totalDeposits: number
  totalWithdrawals: number
  transactionCount: number
  transactions: ParsedTransaction[]
}

// ─── CSV Parser ────────────────────────────────
function parseCsv(text: string): { headers: string[]; rows: CsvRow[] } {
  const lines = text.split(/\r?\n/).filter(l => l.trim())
  if (lines.length < 2) return { headers: [], rows: [] }

  // Detect delimiter (comma, semicolon, tab)
  const firstLine = lines[0]
  const delimiters = [",", ";", "\t"]
  let delimiter = ","
  let maxCount = 0
  for (const d of delimiters) {
    const count = (firstLine.match(new RegExp(d === "\t" ? "\\t" : "\\" + d, "g")) || []).length
    if (count > maxCount) { maxCount = count; delimiter = d }
  }

  const parseRow = (line: string): string[] => {
    const result: string[] = []
    let current = ""
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
        else inQuotes = !inQuotes
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim()); current = ""
      } else {
        current += char
      }
    }
    result.push(current.trim())
    return result
  }

  const headers = parseRow(lines[0])
  const rows = lines.slice(1).map(line => {
    const values = parseRow(line)
    const row: CsvRow = {}
    headers.forEach((h, i) => { row[h] = values[i] || "" })
    return row
  }).filter(row => Object.values(row).some(v => v.trim()))

  return { headers, rows }
}

// ─── Auto-detect column mapping ────────────────
function autoDetectMapping(headers: string[]): Partial<ColumnMapping> {
  const mapping: Partial<ColumnMapping> = {}
  const lower = headers.map(h => h.toLowerCase())

  // Date
  const datePatterns = ["date", "datum", "booking date", "value date", "transaction date", "boekdatum"]
  for (const p of datePatterns) {
    const idx = lower.findIndex(h => h.includes(p))
    if (idx !== -1) { mapping.date = headers[idx]; break }
  }

  // Description
  const descPatterns = ["description", "omschrijving", "memo", "narrative", "details", "name", "naam", "particulars"]
  for (const p of descPatterns) {
    const idx = lower.findIndex(h => h.includes(p))
    if (idx !== -1) { mapping.description = headers[idx]; break }
  }

  // Amount
  const amtPatterns = ["amount", "bedrag", "value", "sum", "debit/credit"]
  for (const p of amtPatterns) {
    const idx = lower.findIndex(h => h.includes(p))
    if (idx !== -1) { mapping.amount = headers[idx]; break }
  }
  // Check for separate debit/credit columns
  if (!mapping.amount) {
    const debitIdx = lower.findIndex(h => h.includes("debit") || h.includes("af"))
    const creditIdx = lower.findIndex(h => h.includes("credit") || h.includes("bij"))
    if (debitIdx !== -1) mapping.amount = headers[debitIdx]
  }

  // Type indicator
  const typePatterns = ["type", "transaction type", "credit/debit", "dc", "d/c", "soort"]
  for (const p of typePatterns) {
    const idx = lower.findIndex(h => h === p || h.includes(p))
    if (idx !== -1) { mapping.type = headers[idx]; break }
  }

  // Reference
  const refPatterns = ["reference", "ref", "referentie", "kenmerk", "transaction id"]
  for (const p of refPatterns) {
    const idx = lower.findIndex(h => h.includes(p))
    if (idx !== -1) { mapping.reference = headers[idx]; break }
  }

  // Balance
  const balPatterns = ["balance", "saldo", "running balance"]
  for (const p of balPatterns) {
    const idx = lower.findIndex(h => h.includes(p))
    if (idx !== -1) { mapping.balance = headers[idx]; break }
  }

  return mapping
}

// ─── Parse amount from various formats ─────────
function parseAmount(value: string): number {
  if (!value) return 0
  // Remove currency symbols and spaces
  let cleaned = value.replace(/[€$£¥₿\s]/g, "").trim()
  // Handle European format: 1.234,56 → 1234.56
  if (/^\d{1,3}(\.\d{3})*,\d{2}$/.test(cleaned)) {
    cleaned = cleaned.replace(/\./g, "").replace(",", ".")
  }
  // Handle comma as thousands separator: 1,234.56
  else if (/^\d{1,3}(,\d{3})*\.\d{2}$/.test(cleaned)) {
    cleaned = cleaned.replace(/,/g, "")
  }
  // Simple comma decimal: 123,45
  else if (/^-?\d+,\d{2}$/.test(cleaned)) {
    cleaned = cleaned.replace(",", ".")
  }
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}

// ─── Parse date from various formats ───────────
function parseDate(value: string): string {
  if (!value) return new Date().toISOString().split("T")[0]
  // Try ISO format first
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.substring(0, 10)
  // DD/MM/YYYY or DD-MM-YYYY
  const euMatch = value.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/)
  if (euMatch) return `${euMatch[3]}-${euMatch[2].padStart(2, "0")}-${euMatch[1].padStart(2, "0")}`
  // MM/DD/YYYY
  const usMatch = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (usMatch) {
    const m = parseInt(usMatch[1]), d = parseInt(usMatch[2])
    if (m <= 12 && d > 12) return `${usMatch[3]}-${usMatch[1].padStart(2, "0")}-${usMatch[2].padStart(2, "0")}`
  }
  // Fallback: let JS parse it
  const parsed = new Date(value)
  if (!isNaN(parsed.getTime())) return parsed.toISOString().split("T")[0]
  return new Date().toISOString().split("T")[0]
}

export default function BanksPage() {
  const [showAdd, setShowAdd] = useState(false)
  const [activeTab, setActiveTab] = useState<"accounts" | "crypto" | "transactions" | "import" | "statements">("accounts")
  const { data: bankAccountsAll, loading, refresh } = useApi<BankAccount[]>("/api/bank-accounts", [])
  const { data: transactions, loading: loadingTx } = useApi<Transaction[]>("/api/transactions", [])

  // ─── Add Account Form State ──────────────────
  const [accName, setAccName] = useState("")
  const [accBank, setAccBank] = useState("")
  const [accType, setAccType] = useState("CHECKING")
  const [accNumber, setAccNumber] = useState("")
  const [accCurrency, setAccCurrency] = useState("USD")
  const [accBalance, setAccBalance] = useState("0")
  const [accLoading, setAccLoading] = useState(false)
  const [accError, setAccError] = useState("")

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!accName || !accBank || !accNumber) { setAccError("Name, Bank/Network, and Account Number are required"); return }
    try {
      setAccError("")
      setAccLoading(true)
      await apiMutate("/api/bank-accounts", "POST", {
        name: accName,
        bankName: accBank,
        accountNumber: accNumber,
        type: accType,
        currency: accCurrency,
        balance: parseFloat(accBalance) || 0,
      })
      setShowAdd(false)
      setAccName(""); setAccBank(""); setAccType("CHECKING"); setAccNumber(""); setAccCurrency("USD"); setAccBalance("0")
      refresh()
    } catch (err) {
      setAccError(err instanceof Error ? err.message : "Failed to create account")
    } finally {
      setAccLoading(false)
    }
  }

  // ─── CSV Import State ──────────────────────────
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importStep, setImportStep] = useState<"upload" | "map" | "preview" | "done">("upload")
  const [csvHeaders, setCsvHeaders] = useState<string[]>([])
  const [csvRows, setCsvRows] = useState<CsvRow[]>([])
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({ date: "", description: "", amount: "", type: "", reference: "", balance: "" })
  const [parsedTransactions, setParsedTransactions] = useState<ParsedTransaction[]>([])
  const [selectedAccountId, setSelectedAccountId] = useState("")
  const [importedStatements, setImportedStatements] = useState<BankStatement[]>([])
  const [fileName, setFileName] = useState("")
  const [importError, setImportError] = useState("")
  const [viewingStatement, setViewingStatement] = useState<BankStatement | null>(null)
  const [statementFilter, setStatementFilter] = useState("")

  // ─── CSV File Handler ─────────────────────────
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImportError("")
    setFileName(file.name)

    if (!file.name.endsWith(".csv") && !file.name.endsWith(".txt")) {
      setImportError("Only CSV files are supported. Please upload a .csv file.")
      return
    }

    const reader = new FileReader()
    reader.onload = (evt) => {
      const text = evt.target?.result as string
      if (!text) { setImportError("Could not read file"); return }

      const { headers, rows } = parseCsv(text)
      if (headers.length === 0 || rows.length === 0) {
        setImportError("No data found in CSV file. Make sure it has headers and at least one row.")
        return
      }

      setCsvHeaders(headers)
      setCsvRows(rows)

      // Auto-detect column mapping
      const detected = autoDetectMapping(headers)
      setColumnMapping({
        date: detected.date || "",
        description: detected.description || "",
        amount: detected.amount || "",
        type: detected.type || "",
        reference: detected.reference || "",
        balance: detected.balance || "",
      })
      setImportStep("map")
    }
    reader.onerror = () => setImportError("Error reading file")
    reader.readAsText(file)
  }, [])

  // ─── Process CSV rows into transactions ──────
  const processTransactions = useCallback(() => {
    if (!columnMapping.date || !columnMapping.description || !columnMapping.amount) {
      setImportError("Date, Description and Amount columns are required.")
      return
    }
    setImportError("")

    const txs: ParsedTransaction[] = csvRows.map((row, i) => {
      const rawAmount = parseAmount(row[columnMapping.amount] || "0")
      const isDeposit = rawAmount > 0 ||
        (columnMapping.type && (row[columnMapping.type] || "").toLowerCase().match(/credit|bij|cr|deposit|in/))

      return {
        id: `import-${Date.now()}-${i}`,
        date: parseDate(row[columnMapping.date] || ""),
        description: row[columnMapping.description] || "Unknown",
        amount: Math.abs(rawAmount),
        type: isDeposit ? "DEPOSIT" as const : "WITHDRAWAL" as const,
        reference: columnMapping.reference ? (row[columnMapping.reference] || "") : "",
        selected: true,
        raw: row,
      }
    }).filter(tx => tx.amount > 0)

    setParsedTransactions(txs)
    setImportStep("preview")
  }, [csvRows, columnMapping])

  // ─── Toggle transaction selection ────────────
  const toggleTransaction = (id: string) => {
    setParsedTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, selected: !tx.selected } : tx))
  }
  const toggleAll = (selected: boolean) => {
    setParsedTransactions(prev => prev.map(tx => ({ ...tx, selected })))
  }

  // ─── Confirm import → create bank statement ──
  const confirmImport = useCallback(() => {
    const selected = parsedTransactions.filter(tx => tx.selected)
    if (selected.length === 0) { setImportError("Select at least one transaction to import."); return }

    const account = bankAccountsAll.find(a => a.id === selectedAccountId)
    if (!account) { setImportError("Please select a bank account."); return }

    const sorted = [...selected].sort((a, b) => a.date.localeCompare(b.date))
    const totalDeposits = sorted.filter(t => t.type === "DEPOSIT").reduce((s, t) => s + t.amount, 0)
    const totalWithdrawals = sorted.filter(t => t.type === "WITHDRAWAL").reduce((s, t) => s + t.amount, 0)

    const statement: BankStatement = {
      id: `stmt-${Date.now()}`,
      accountId: account.id,
      accountName: account.name,
      importDate: new Date().toISOString(),
      periodStart: sorted[0].date,
      periodEnd: sorted[sorted.length - 1].date,
      openingBalance: account.balance,
      closingBalance: account.balance + totalDeposits - totalWithdrawals,
      totalDeposits,
      totalWithdrawals,
      transactionCount: sorted.length,
      transactions: sorted,
    }

    setImportedStatements(prev => [statement, ...prev])
    setImportStep("done")
  }, [parsedTransactions, selectedAccountId, bankAccountsAll])

  // ─── Reset import flow ───────────────────────
  const resetImport = () => {
    setImportStep("upload")
    setCsvHeaders([])
    setCsvRows([])
    setParsedTransactions([])
    setFileName("")
    setImportError("")
    setColumnMapping({ date: "", description: "", amount: "", type: "", reference: "", balance: "" })
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  // ─── Loading state ───────────────────────────
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
  const totalBankBalance = bankAccounts.reduce((s, b) => s + (parseFloat(String(b.balance)) || 0), 0)
  const totalCryptoBalance = cryptoAccounts.reduce((s, b) => s + (parseFloat(String(b.balance)) || 0), 0)
  const totalBalance = mockBankAccounts.reduce((s, b) => s + (parseFloat(String(b.balance)) || 0), 0)

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

  // ─── Import Step Stats ───────────────────────
  const selectedCount = parsedTransactions.filter(t => t.selected).length
  const selectedDeposits = parsedTransactions.filter(t => t.selected && t.type === "DEPOSIT").reduce((s, t) => s + t.amount, 0)
  const selectedWithdrawals = parsedTransactions.filter(t => t.selected && t.type === "WITHDRAWAL").reduce((s, t) => s + t.amount, 0)

  // ─── Filtered statements ─────────────────────
  const filteredStatements = importedStatements.filter(s =>
    !statementFilter || s.accountName.toLowerCase().includes(statementFilter.toLowerCase())
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
            { key: "import" as const, label: "Import CSV", icon: Upload },
            { key: "statements" as const, label: "Bank Statements", icon: FileText },
          ]).map(({ key, label, icon: TabIcon }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 -mb-px transition-colors ${activeTab === key ? "border-brand-600 text-brand-600" : "border-transparent text-surface-400 hover:text-surface-600"}`}>
              {TabIcon && <TabIcon className="h-3 w-3" />}
              {label}
              {key === "statements" && importedStatements.length > 0 && (
                <span className="rounded-full bg-brand-100 px-1.5 text-2xs font-medium text-brand-700">{importedStatements.length}</span>
              )}
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

        {/* ═══════════════════════════════════════════════ */}
        {/* CSV IMPORT TAB                                 */}
        {/* ═══════════════════════════════════════════════ */}
        {activeTab === "import" && (
          <div className="space-y-4">
            {/* Progress Steps */}
            <div className="card p-4">
              <div className="flex items-center justify-between">
                {(["upload", "map", "preview", "done"] as const).map((step, i) => {
                  const stepLabels = ["Upload CSV", "Map Columns", "Preview & Select", "Complete"]
                  const stepIcons = [Upload, ArrowRight, Eye, CheckCircle2]
                  const StepIcon = stepIcons[i]
                  const isActive = importStep === step
                  const isDone = (["upload", "map", "preview", "done"] as const).indexOf(importStep) > i

                  return (
                    <div key={step} className="flex items-center">
                      <div className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                        isActive ? "bg-brand-50 text-brand-700" :
                        isDone ? "bg-emerald-50 text-emerald-700" :
                        "bg-surface-50 text-surface-400"
                      }`}>
                        <StepIcon className="h-3.5 w-3.5" />
                        {stepLabels[i]}
                      </div>
                      {i < 3 && <ChevronRight className="h-4 w-4 mx-2 text-surface-300" />}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Error display */}
            {importError && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                {importError}
                <button onClick={() => setImportError("")} className="ml-auto"><XCircle className="h-3.5 w-3.5" /></button>
              </div>
            )}

            {/* STEP 1: Upload */}
            {importStep === "upload" && (
              <div className="card p-6">
                <div className="text-center space-y-4">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
                    <FileSpreadsheet className="h-8 w-8 text-brand-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-surface-800">Import Bank Transactions</h3>
                    <p className="text-xs text-surface-400 mt-1">Upload a CSV file from your bank to import transactions and generate a bank statement.</p>
                  </div>

                  <div className="border-2 border-dashed border-surface-200 rounded-lg p-8 hover:border-brand-300 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-brand-400", "bg-brand-50/30") }}
                    onDragLeave={(e) => { e.currentTarget.classList.remove("border-brand-400", "bg-brand-50/30") }}
                    onDrop={(e) => {
                      e.preventDefault()
                      e.currentTarget.classList.remove("border-brand-400", "bg-brand-50/30")
                      const file = e.dataTransfer.files[0]
                      if (file && fileInputRef.current) {
                        const dt = new DataTransfer()
                        dt.items.add(file)
                        fileInputRef.current.files = dt.files
                        handleFileUpload({ target: fileInputRef.current } as React.ChangeEvent<HTMLInputElement>)
                      }
                    }}
                  >
                    <Upload className="h-8 w-8 text-surface-300 mx-auto mb-3" />
                    <p className="text-xs font-medium text-surface-600">Drop your CSV file here or click to browse</p>
                    <p className="text-2xs text-surface-400 mt-1">Supports .csv files from any bank</p>
                  </div>

                  <input ref={fileInputRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleFileUpload} />

                  <div className="text-left space-y-2 pt-2">
                    <p className="text-2xs font-semibold text-surface-500 uppercase tracking-wider">Supported Formats</p>
                    <div className="grid grid-cols-3 gap-2">
                      {["ING / ABN AMRO", "Rabobank", "Republic Bank", "Generic CSV", "Semicolon-separated", "Tab-separated"].map(f => (
                        <div key={f} className="flex items-center gap-1.5 text-2xs text-surface-500">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" /> {f}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Column Mapping */}
            {importStep === "map" && (
              <div className="space-y-4">
                <div className="card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-semibold text-surface-800">Map CSV Columns</h3>
                      <p className="text-2xs text-surface-400 mt-0.5">
                        File: <span className="font-medium text-surface-600">{fileName}</span> · {csvRows.length} rows detected · {csvHeaders.length} columns
                      </p>
                    </div>
                    <button onClick={resetImport} className="btn-ghost text-2xs">
                      <RefreshCw className="h-3 w-3 mr-1" /> Start Over
                    </button>
                  </div>

                  {/* Select target account */}
                  <div className="mb-4 p-3 rounded-lg bg-brand-50/50 border border-brand-100">
                    <label className="label text-brand-700">Import to Bank Account *</label>
                    <select className="input mt-1" value={selectedAccountId} onChange={e => setSelectedAccountId(e.target.value)}>
                      <option value="">Select an account...</option>
                      {mockBankAccounts.map(acc => (
                        <option key={acc.id} value={acc.id}>{acc.name} ({acc.bankName} · {formatCurrency(acc.balance)})</option>
                      ))}
                    </select>
                  </div>

                  {/* Column mapping fields */}
                  <div className="grid grid-cols-3 gap-3">
                    {([
                      { key: "date" as const, label: "Date Column *", required: true },
                      { key: "description" as const, label: "Description Column *", required: true },
                      { key: "amount" as const, label: "Amount Column *", required: true },
                      { key: "type" as const, label: "Type / D/C Column", required: false },
                      { key: "reference" as const, label: "Reference Column", required: false },
                      { key: "balance" as const, label: "Balance Column", required: false },
                    ]).map(({ key, label, required }) => (
                      <div key={key}>
                        <label className="label">{label}</label>
                        <select
                          className={`input mt-1 ${required && !columnMapping[key] ? "border-red-300" : columnMapping[key] ? "border-emerald-300" : ""}`}
                          value={columnMapping[key]}
                          onChange={e => setColumnMapping(prev => ({ ...prev, [key]: e.target.value }))}
                        >
                          <option value="">{required ? "— Required —" : "— Optional —"}</option>
                          {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>

                  {/* Preview first 3 rows of raw CSV */}
                  <div className="mt-4">
                    <p className="text-2xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Raw CSV Preview (first 3 rows)</p>
                    <div className="overflow-x-auto rounded-lg border border-surface-200">
                      <table className="table-compact w-full">
                        <thead>
                          <tr>{csvHeaders.map(h => <th key={h} className="text-2xs">{h}</th>)}</tr>
                        </thead>
                        <tbody>
                          {csvRows.slice(0, 3).map((row, i) => (
                            <tr key={i}>{csvHeaders.map(h => <td key={h} className="text-2xs font-mono">{row[h]}</td>)}</tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button onClick={resetImport} className="btn-secondary">Cancel</button>
                  <button
                    onClick={processTransactions}
                    disabled={!columnMapping.date || !columnMapping.description || !columnMapping.amount || !selectedAccountId}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Process Transactions <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Preview & Select */}
            {importStep === "preview" && (
              <div className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="card p-3">
                    <p className="text-2xs text-surface-400">Total Parsed</p>
                    <p className="text-lg font-bold text-surface-800">{parsedTransactions.length}</p>
                  </div>
                  <div className="card p-3">
                    <p className="text-2xs text-surface-400">Selected</p>
                    <p className="text-lg font-bold text-brand-600">{selectedCount}</p>
                  </div>
                  <div className="card p-3">
                    <p className="text-2xs text-surface-400">Deposits</p>
                    <p className="text-lg font-bold text-emerald-600">+{formatCurrency(selectedDeposits)}</p>
                  </div>
                  <div className="card p-3">
                    <p className="text-2xs text-surface-400">Withdrawals</p>
                    <p className="text-lg font-bold text-red-500">-{formatCurrency(selectedWithdrawals)}</p>
                  </div>
                </div>

                {/* Transaction list */}
                <div className="card">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-surface-200">
                    <div className="flex items-center gap-3">
                      <input type="checkbox"
                        checked={parsedTransactions.every(t => t.selected)}
                        onChange={(e) => toggleAll(e.target.checked)}
                        className="rounded border-surface-300 text-brand-600 focus:ring-brand-500"
                      />
                      <span className="text-xs font-medium text-surface-600">Select All</span>
                    </div>
                    <p className="text-2xs text-surface-400">
                      Importing to: <span className="font-medium text-surface-700">{mockBankAccounts.find(a => a.id === selectedAccountId)?.name}</span>
                    </p>
                  </div>

                  <div className="max-h-[400px] overflow-y-auto divide-y divide-surface-100">
                    {parsedTransactions.map((tx) => (
                      <div key={tx.id} className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${tx.selected ? "" : "opacity-50"}`}>
                        <input type="checkbox" checked={tx.selected} onChange={() => toggleTransaction(tx.id)}
                          className="rounded border-surface-300 text-brand-600 focus:ring-brand-500" />
                        <div className="rounded-full bg-surface-50 p-1.5">
                          {tx.type === "DEPOSIT"
                            ? <ArrowUpRight className="h-3 w-3 text-emerald-600" />
                            : <ArrowDownRight className="h-3 w-3 text-red-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-surface-700 truncate">{tx.description}</p>
                          <p className="text-2xs text-surface-400">
                            {formatDate(tx.date)}
                            {tx.reference && <> · Ref: {tx.reference}</>}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs font-semibold ${tx.type === "DEPOSIT" ? "text-emerald-600" : "text-red-500"}`}>
                            {tx.type === "DEPOSIT" ? "+" : "-"}{formatCurrency(tx.amount)}
                          </span>
                          <p className="text-2xs text-surface-400">{tx.type}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between">
                  <button onClick={() => setImportStep("map")} className="btn-secondary">
                    Back to Mapping
                  </button>
                  <div className="flex gap-2">
                    <button onClick={resetImport} className="btn-ghost">Cancel</button>
                    <button onClick={confirmImport} className="btn-primary" disabled={selectedCount === 0}>
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                      Import {selectedCount} Transaction{selectedCount !== 1 ? "s" : ""} & Create Statement
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Done */}
            {importStep === "done" && (
              <div className="card p-8 text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-sm font-semibold text-surface-800">Import Complete!</h3>
                <p className="text-xs text-surface-500">
                  {parsedTransactions.filter(t => t.selected).length} transactions imported successfully.
                  A bank statement has been generated.
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <button onClick={() => { resetImport(); setActiveTab("statements") }} className="btn-primary">
                    <FileText className="h-3.5 w-3.5 mr-1" /> View Bank Statements
                  </button>
                  <button onClick={resetImport} className="btn-secondary">
                    <Upload className="h-3.5 w-3.5 mr-1" /> Import Another File
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════ */}
        {/* BANK STATEMENTS TAB                            */}
        {/* ═══════════════════════════════════════════════ */}
        {activeTab === "statements" && (
          <div className="space-y-4">
            {viewingStatement ? (
              /* Statement Detail View */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <button onClick={() => setViewingStatement(null)} className="btn-ghost text-xs">
                    ← Back to Statements
                  </button>
                  <button className="btn-secondary text-xs" onClick={() => {
                    // Generate CSV export
                    const s = viewingStatement
                    const header = "Date,Description,Type,Amount,Reference\n"
                    const rows = s.transactions.map(t =>
                      `${t.date},"${t.description}",${t.type},${t.type === "DEPOSIT" ? "" : "-"}${t.amount.toFixed(2)},"${t.reference}"`
                    ).join("\n")
                    const blob = new Blob([header + rows], { type: "text/csv" })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement("a")
                    a.href = url; a.download = `statement-${s.accountName.replace(/\s+/g, "-")}-${s.periodStart}-${s.periodEnd}.csv`
                    a.click(); URL.revokeObjectURL(url)
                  }}>
                    <Download className="h-3 w-3 mr-1" /> Export CSV
                  </button>
                </div>

                {/* Statement header */}
                <div className="card p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-surface-800">Bank Statement</h3>
                      <p className="text-xs text-surface-500 mt-0.5">{viewingStatement.accountName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xs text-surface-400">Statement Period</p>
                      <p className="text-xs font-medium text-surface-700">
                        {formatDate(viewingStatement.periodStart)} — {formatDate(viewingStatement.periodEnd)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 rounded-lg bg-surface-50 p-3">
                    <div>
                      <p className="text-2xs text-surface-400">Opening Balance</p>
                      <p className="text-sm font-bold text-surface-800">{formatCurrency(viewingStatement.openingBalance)}</p>
                    </div>
                    <div>
                      <p className="text-2xs text-surface-400">Total Deposits</p>
                      <p className="text-sm font-bold text-emerald-600">+{formatCurrency(viewingStatement.totalDeposits)}</p>
                    </div>
                    <div>
                      <p className="text-2xs text-surface-400">Total Withdrawals</p>
                      <p className="text-sm font-bold text-red-500">-{formatCurrency(viewingStatement.totalWithdrawals)}</p>
                    </div>
                    <div>
                      <p className="text-2xs text-surface-400">Closing Balance</p>
                      <p className="text-sm font-bold text-brand-700">{formatCurrency(viewingStatement.closingBalance)}</p>
                    </div>
                  </div>
                </div>

                {/* Statement transactions */}
                <div className="card">
                  <div className="px-4 py-3 border-b border-surface-200">
                    <p className="text-xs font-semibold text-surface-700">{viewingStatement.transactionCount} Transactions</p>
                  </div>
                  <div className="divide-y divide-surface-100">
                    {viewingStatement.transactions.map((tx, i) => (
                      <div key={tx.id} className="flex items-center gap-3 px-4 py-2.5">
                        <span className="text-2xs text-surface-400 w-6 text-right">{i + 1}</span>
                        <div className="rounded-full bg-surface-50 p-1.5">
                          {tx.type === "DEPOSIT"
                            ? <ArrowUpRight className="h-3 w-3 text-emerald-600" />
                            : <ArrowDownRight className="h-3 w-3 text-red-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-surface-700 truncate">{tx.description}</p>
                          <p className="text-2xs text-surface-400">{formatDate(tx.date)}{tx.reference && <> · {tx.reference}</>}</p>
                        </div>
                        <span className={`text-xs font-semibold ${tx.type === "DEPOSIT" ? "text-emerald-600" : "text-red-500"}`}>
                          {tx.type === "DEPOSIT" ? "+" : "-"}{formatCurrency(tx.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Statement List */
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-surface-800">Bank Statements</h3>
                    <p className="text-2xs text-surface-400">{importedStatements.length} statement{importedStatements.length !== 1 ? "s" : ""} generated from CSV imports</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {importedStatements.length > 0 && (
                      <div className="relative">
                        <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-surface-400" />
                        <input type="text" className="input pl-8 text-xs w-48" placeholder="Filter by account..."
                          value={statementFilter} onChange={e => setStatementFilter(e.target.value)} />
                      </div>
                    )}
                    <button onClick={() => setActiveTab("import")} className="btn-primary text-xs">
                      <Upload className="h-3.5 w-3.5 mr-1" /> Import CSV
                    </button>
                  </div>
                </div>

                {importedStatements.length === 0 ? (
                  <div className="card p-8 text-center">
                    <FileText className="h-10 w-10 text-surface-300 mx-auto mb-3" />
                    <p className="text-xs font-medium text-surface-600">No bank statements yet</p>
                    <p className="text-2xs text-surface-400 mt-1">Import a CSV file to generate your first bank statement.</p>
                    <button onClick={() => setActiveTab("import")} className="btn-primary text-xs mt-4">
                      <Upload className="h-3.5 w-3.5 mr-1" /> Import CSV
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredStatements.map((s) => (
                      <div key={s.id} className="card p-4 hover:bg-surface-50/50 transition-colors cursor-pointer"
                        onClick={() => setViewingStatement(s)}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-brand-50 p-2">
                              <FileText className="h-5 w-5 text-brand-600" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-surface-800">{s.accountName}</p>
                              <p className="text-2xs text-surface-400">
                                {formatDate(s.periodStart)} — {formatDate(s.periodEnd)} · {s.transactionCount} transactions
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-2xs text-surface-400">Net Change</p>
                              <p className={`text-xs font-semibold ${s.totalDeposits - s.totalWithdrawals >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                                {s.totalDeposits - s.totalWithdrawals >= 0 ? "+" : ""}{formatCurrency(s.totalDeposits - s.totalWithdrawals)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xs text-surface-400">Closing</p>
                              <p className="text-xs font-bold text-surface-800">{formatCurrency(s.closingBalance)}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <button onClick={(e) => { e.stopPropagation(); setViewingStatement(s) }} className="rounded p-1 hover:bg-surface-100" title="View">
                                <Eye className="h-3.5 w-3.5 text-surface-400" />
                              </button>
                              <button onClick={(e) => {
                                e.stopPropagation()
                                setImportedStatements(prev => prev.filter(st => st.id !== s.id))
                              }} className="rounded p-1 hover:bg-red-50" title="Delete">
                                <Trash2 className="h-3.5 w-3.5 text-surface-400 hover:text-red-500" />
                              </button>
                            </div>
                            <ChevronRight className="h-4 w-4 text-surface-300" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Account">
        <form className="space-y-4" onSubmit={handleCreateAccount}>
          {accError && <div className="p-2 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">{accError}</div>}
          <div><label className="label">Account Name *</label><input type="text" className="input" placeholder="e.g. USDT Wallet (TRC-20)" value={accName} onChange={(e) => setAccName(e.target.value)} required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Network / Bank *</label><input type="text" className="input" placeholder="e.g. Tron Network" value={accBank} onChange={(e) => setAccBank(e.target.value)} required /></div>
            <div><label className="label">Account Type</label>
              <select className="input" value={accType} onChange={(e) => setAccType(e.target.value)}>
                <option value="CHECKING">Checking</option><option value="SAVINGS">Savings</option><option value="CASH">Cash</option><option value="CRYPTO">Crypto</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Wallet / Account Number *</label><input type="text" className="input" placeholder="Address or account #" value={accNumber} onChange={(e) => setAccNumber(e.target.value)} required /></div>
            <div><label className="label">Currency</label>
              <select className="input" value={accCurrency} onChange={(e) => setAccCurrency(e.target.value)}>
                <option value="USD">USD</option><option value="EUR">EUR</option><option value="USDT">USDT</option><option value="BTC">BTC</option><option value="ETH">ETH</option>
              </select>
            </div>
          </div>
          <div><label className="label">Opening Balance</label><input type="number" className="input" step="0.01" value={accBalance} onChange={(e) => setAccBalance(e.target.value)} /></div>
          <div className="flex justify-end gap-2 pt-3 border-t border-surface-200">
            <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={accLoading} className="btn-primary">{accLoading ? "Saving..." : "Add Account"}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
