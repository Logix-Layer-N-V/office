"use client"

import { useState } from "react"
import { Header } from "@/components/dashboard/header"
import {
  Building2, Globe, CreditCard, Shield, Bell, Palette, Key,
  Trash2, Plus, GripVertical, Settings as SettingsIcon,
  Download, Upload, FileSpreadsheet, AlertCircle, Check,
} from "lucide-react"

// ─── Types ──────────────────────────────────────────
type GeneralTab = "company" | "currency" | "tax" | "integrations" | "notifications" | "appearance" | "api" | "import-export"

// ─── Currencies ─────────────────────────────────────
const defaultCurrencies = [
  { code: "USD", name: "US Dollar", symbol: "$", rate: 1.0, isBase: true },
  { code: "EUR", name: "Euro", symbol: "€", rate: 0.92, isBase: false },
  { code: "GBP", name: "British Pound", symbol: "£", rate: 0.79, isBase: false },
  { code: "USDT", name: "Tether", symbol: "₮", rate: 1.0, isBase: false },
  { code: "BTC", name: "Bitcoin", symbol: "₿", rate: 0.000012, isBase: false },
  { code: "SRD", name: "Surinaamse Dollar", symbol: "SRD", rate: 36.25, isBase: false },
]

// ─── Entities for import/export ─────────────────────
const ENTITIES = [
  { key: "clients", label: "Clients", endpoint: "/api/clients", fields: ["name", "company", "email", "phone", "address", "taxId", "currency", "status"] },
  { key: "items", label: "Items / Services", endpoint: "/api/items", fields: ["name", "description", "type", "rate", "unit", "taxable"] },
  { key: "proposals", label: "Proposals", endpoint: "/api/proposals", fields: ["title", "clientId", "status", "total", "validUntil"] },
  { key: "estimates", label: "Estimates", endpoint: "/api/estimates", fields: ["title", "clientId", "status", "total", "validUntil"] },
  { key: "invoices", label: "Invoices", endpoint: "/api/invoices", fields: ["number", "clientId", "status", "total", "dueDate"] },
  { key: "payments", label: "Payments", endpoint: "/api/payments", fields: ["clientId", "invoiceId", "amount", "method", "receivedAt", "reference"] },
  { key: "expenses", label: "Expenses", endpoint: "/api/expenses", fields: ["description", "amount", "category", "date", "vendor", "status"] },
  { key: "projects", label: "Projects", endpoint: "/api/projects", fields: ["name", "clientId", "status", "priority", "budget", "startDate", "deadline"] },
  { key: "tasks", label: "Tasks", endpoint: "/api/tasks", fields: ["title", "projectId", "status", "priority", "assignee", "dueDate"] },
]

function ImportExportPanel() {
  const [importing, setImporting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [importEntity, setImportEntity] = useState("clients")
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importPreview, setImportPreview] = useState<Record<string, string>[]>([])
  const [importResult, setImportResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null)

  const selectedEntity = ENTITIES.find((e) => e.key === importEntity)!

  // CSV parser
  const parseCSV = (text: string): Record<string, string>[] => {
    const lines = text.trim().split("\n")
    if (lines.length < 2) return []
    const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""))
    return lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""))
      const row: Record<string, string> = {}
      headers.forEach((h, i) => { row[h] = values[i] || "" })
      return row
    })
  }

  // Handle file select
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImportFile(file)
    setImportResult(null)
    const reader = new FileReader()
    reader.onload = (evt) => {
      const text = evt.target?.result as string
      const rows = parseCSV(text)
      setImportPreview(rows.slice(0, 10))
    }
    reader.readAsText(file)
  }

  // Download CSV template
  const downloadTemplate = () => {
    const headers = selectedEntity.fields.join(",")
    const example = selectedEntity.fields.map((f) => `example_${f}`).join(",")
    const blob = new Blob([headers + "\n" + example + "\n"], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${selectedEntity.key}_template.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Bulk import
  const handleImport = async () => {
    if (!importFile) return
    setImporting(true)
    setImportResult(null)

    const reader = new FileReader()
    reader.onload = async (evt) => {
      const text = evt.target?.result as string
      const rows = parseCSV(text)
      let success = 0
      let failed = 0
      const errors: string[] = []

      for (let i = 0; i < rows.length; i++) {
        try {
          const res = await fetch(selectedEntity.endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(rows[i]),
          })
          if (res.ok) success++
          else {
            failed++
            errors.push(`Row ${i + 1}: ${res.statusText}`)
          }
        } catch {
          failed++
          errors.push(`Row ${i + 1}: Network error`)
        }
      }

      setImportResult({ success, failed, errors })
      setImporting(false)
    }
    reader.readAsText(importFile)
  }

  // Export
  const handleExport = async (entityKey: string) => {
    const entity = ENTITIES.find((e) => e.key === entityKey)!
    setExporting(true)
    try {
      const res = await fetch(entity.endpoint)
      const data = await res.json()
      if (!Array.isArray(data) || data.length === 0) {
        setExporting(false)
        return
      }

      // Build CSV
      const headers = Object.keys(data[0])
      const csvRows = [headers.join(",")]
      data.forEach((row: Record<string, unknown>) => {
        const values = headers.map((h) => {
          const val = row[h]
          if (val === null || val === undefined) return ""
          const str = String(val)
          return str.includes(",") || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str
        })
        csvRows.push(values.join(","))
      })

      const blob = new Blob([csvRows.join("\n")], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${entityKey}_export_${new Date().toISOString().split("T")[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error("Export failed:", e)
    }
    setExporting(false)
  }

  // Export all
  const handleExportAll = async () => {
    for (const entity of ENTITIES) {
      await handleExport(entity.key)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-surface-800 mb-1">Import & Export</h2>
        <p className="text-2xs text-surface-400">Bulk import data via CSV or export your data for backup.</p>
      </div>

      {/* ── IMPORT ── */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Upload className="h-4 w-4 text-brand-600" />
          <h3 className="text-xs font-semibold text-surface-700">Bulk Import</h3>
        </div>

        {/* Entity select */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Entity Type</label>
            <select
              value={importEntity}
              onChange={(e) => { setImportEntity(e.target.value); setImportFile(null); setImportPreview([]); setImportResult(null) }}
              className="input w-full"
            >
              {ENTITIES.map((e) => (
                <option key={e.key} value={e.key}>{e.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">CSV File</label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="input w-full text-xs file:mr-2 file:rounded file:border-0 file:bg-brand-50 file:px-2 file:py-1 file:text-2xs file:font-medium file:text-brand-700"
            />
          </div>
        </div>

        {/* Expected fields */}
        <div className="rounded-md bg-surface-50 p-3">
          <p className="text-2xs font-medium text-surface-500 mb-1">Expected CSV columns for {selectedEntity.label}:</p>
          <div className="flex flex-wrap gap-1">
            {selectedEntity.fields.map((f) => (
              <span key={f} className="inline-flex rounded-full bg-white border border-surface-200 px-2 py-0.5 text-2xs text-surface-600 font-mono">{f}</span>
            ))}
          </div>
        </div>

        {/* Download template */}
        <button onClick={downloadTemplate} className="btn-secondary text-xs">
          <Download className="h-3 w-3" />
          Download CSV Template
        </button>

        {/* Preview */}
        {importPreview.length > 0 && (
          <div>
            <p className="text-2xs font-medium text-surface-500 mb-2">Preview (first {Math.min(importPreview.length, 10)} rows):</p>
            <div className="overflow-x-auto rounded-md border border-surface-200">
              <table className="table-compact text-2xs">
                <thead>
                  <tr>{Object.keys(importPreview[0]).map((h) => <th key={h}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {importPreview.map((row, i) => (
                    <tr key={i}>{Object.values(row).map((v, j) => <td key={j} className="max-w-[150px] truncate">{v}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Import button */}
        {importFile && (
          <button
            onClick={handleImport}
            disabled={importing}
            className="btn-primary"
          >
            <Upload className="h-3.5 w-3.5" />
            {importing ? "Importing..." : `Import ${importPreview.length}+ rows`}
          </button>
        )}

        {/* Result */}
        {importResult && (
          <div className={`rounded-md p-3 ${importResult.failed > 0 ? "bg-amber-50 border border-amber-200" : "bg-emerald-50 border border-emerald-200"}`}>
            <div className="flex items-center gap-2 mb-1">
              {importResult.failed > 0 ? <AlertCircle className="h-4 w-4 text-amber-600" /> : <Check className="h-4 w-4 text-emerald-600" />}
              <p className="text-xs font-semibold">{importResult.success} imported, {importResult.failed} failed</p>
            </div>
            {importResult.errors.length > 0 && (
              <ul className="text-2xs text-amber-700 mt-1 space-y-0.5">
                {importResult.errors.slice(0, 5).map((e, i) => <li key={i}>{e}</li>)}
                {importResult.errors.length > 5 && <li>...and {importResult.errors.length - 5} more errors</li>}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* ── EXPORT ── */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Download className="h-4 w-4 text-emerald-600" />
            <h3 className="text-xs font-semibold text-surface-700">Bulk Export</h3>
          </div>
          <button onClick={handleExportAll} disabled={exporting} className="btn-secondary text-xs">
            <Download className="h-3 w-3" />
            {exporting ? "Exporting..." : "Export All"}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {ENTITIES.map((entity) => (
            <button
              key={entity.key}
              onClick={() => handleExport(entity.key)}
              disabled={exporting}
              className="flex items-center gap-2 rounded-md border border-surface-200 bg-white px-3 py-2.5 text-left hover:bg-surface-50 transition-colors disabled:opacity-50"
            >
              <FileSpreadsheet className="h-4 w-4 text-surface-400" />
              <div>
                <p className="text-xs font-medium text-surface-700">{entity.label}</p>
                <p className="text-2xs text-surface-400">Export CSV</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Component ──────────────────────────────────────
export default function SettingsPage() {
  const [generalTab, setGeneralTab] = useState<GeneralTab>("company")
  const [currencies, setCurrencies] = useState(defaultCurrencies)

  const generalTabs: { key: GeneralTab; label: string; icon: typeof Building2 }[] = [
    { key: "company", label: "Company", icon: Building2 },
    { key: "currency", label: "Currencies", icon: Globe },
    { key: "tax", label: "Tax Settings", icon: CreditCard },
    { key: "integrations", label: "Integrations", icon: Shield },
    { key: "notifications", label: "Notifications", icon: Bell },
    { key: "appearance", label: "Appearance", icon: Palette },
    { key: "api", label: "API Keys", icon: Key },
    { key: "import-export", label: "Import / Export", icon: FileSpreadsheet },
  ]

  return (
    <div>
      <Header title="Settings" subtitle="Configure your finance department" />

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-48 border-r border-surface-200 bg-white min-h-[calc(100vh-96px)]">
          <div className="p-2 space-y-0.5">
            {generalTabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setGeneralTab(key)}
                className={`flex items-center gap-2 w-full rounded-md px-3 py-2 text-2xs font-medium transition-colors ${
                  generalTab === key ? "bg-surface-100 text-surface-800" : "text-surface-400 hover:text-surface-600"
                }`}
              >
                <Icon className="h-3 w-3" />
                {label}
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 p-6 max-w-4xl">

          {/* ═══ COMPANY ═══ */}
          {generalTab === "company" && (
            <div className="space-y-6">
              <div><h2 className="text-sm font-semibold text-surface-800 mb-1">Company Information</h2><p className="text-2xs text-surface-400">This appears on your invoices, proposals and reports.</p></div>
              <div className="card p-5 space-y-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-brand-600 text-white text-lg font-bold">LL</div>
                  <div><button className="btn-secondary text-2xs">Upload Logo</button><p className="text-2xs text-surface-400 mt-1">PNG, JPG up to 2MB</p></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="label">Company Name</label><input type="text" className="input" defaultValue="Logix Layer N.V." /></div>
                  <div><label className="label">Website</label><input type="url" className="input" defaultValue="https://logixlayer.com" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="label">CEO</label><input type="text" className="input" defaultValue="Jason Walcott" /></div>
                  <div><label className="label">CTO</label><input type="text" className="input" defaultValue="Kenscky Alimoestar" /></div>
                </div>
                <div><label className="label">Address</label><textarea className="input" rows={2} defaultValue="" placeholder="Street, City, Country" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="label">Email</label><input type="email" className="input" defaultValue="" placeholder="finance@logixlayer.com" /></div>
                  <div><label className="label">Phone</label><input type="tel" className="input" defaultValue="" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="label">Tax ID / VAT</label><input type="text" className="input" defaultValue="" /></div>
                  <div><label className="label">Registration Number</label><input type="text" className="input" defaultValue="" /></div>
                </div>
              </div>
              <div className="flex justify-end"><button className="btn-primary">Save Changes</button></div>
            </div>
          )}

          {/* ═══ CURRENCIES ═══ */}
          {generalTab === "currency" && (
            <div className="space-y-6">
              <div><h2 className="text-sm font-semibold text-surface-800 mb-1">Multi-Currency Settings</h2><p className="text-2xs text-surface-400">Manage currencies and exchange rates.</p></div>
              <div className="card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div><h3 className="text-xs font-semibold text-surface-700">Base Currency</h3><p className="text-2xs text-surface-400">All amounts converted to this for reporting</p></div>
                  <select className="input w-40" defaultValue="USD">{currencies.map(c => <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>)}</select>
                </div>
              </div>
              <div className="card">
                <div className="flex items-center justify-between px-4 py-3 border-b border-surface-100">
                  <h3 className="text-xs font-semibold text-surface-700">Active Currencies</h3>
                  <button className="btn-ghost text-2xs"><Plus className="h-3 w-3" /> Add Currency</button>
                </div>
                <table className="table-compact">
                  <thead><tr><th className="w-6"></th><th>Currency</th><th>Symbol</th><th className="text-right">Rate</th><th>Status</th><th className="w-8"></th></tr></thead>
                  <tbody>
                    {currencies.map((cur) => (
                      <tr key={cur.code}>
                        <td><GripVertical className="h-3 w-3 text-surface-300" /></td>
                        <td><div className="flex items-center gap-2"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-100 text-2xs font-bold text-surface-600">{cur.symbol}</span><div><p className="text-xs font-medium text-surface-800">{cur.code}</p><p className="text-2xs text-surface-400">{cur.name}</p></div></div></td>
                        <td className="font-mono text-xs">{cur.symbol}</td>
                        <td className="text-right">{cur.isBase ? <span className="badge-info">Base</span> : <input type="number" className="input w-24 text-right text-xs" step="0.0001" defaultValue={cur.rate} />}</td>
                        <td><span className="badge-success">Active</span></td>
                        <td>{!cur.isBase && <button className="rounded p-1 text-surface-300 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end"><button className="btn-primary">Save Currency Settings</button></div>
            </div>
          )}

          {/* ═══ TAX SETTINGS ═══ */}
          {generalTab === "tax" && (
            <div className="space-y-6">
              <div><h2 className="text-sm font-semibold text-surface-800 mb-1">Tax Settings</h2><p className="text-2xs text-surface-400">Configure tax rates for invoices and proposals.</p></div>
              <div className="card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div><h3 className="text-xs font-semibold text-surface-700">Enable Tax</h3></div>
                  <label className="relative inline-flex cursor-pointer items-center"><input type="checkbox" className="peer sr-only" /><div className="h-5 w-9 rounded-full bg-surface-200 peer-checked:bg-brand-600 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full" /></label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="label">Default Tax Rate (%)</label><input type="number" className="input" step="0.1" defaultValue={0} /></div>
                  <div><label className="label">Tax Label</label><input type="text" className="input" defaultValue="VAT" /></div>
                </div>
              </div>
              <div className="card p-5 space-y-3">
                <h3 className="text-xs font-semibold text-surface-700">Tax Rates</h3>
                <div className="space-y-2">
                  {[{ name: "Standard", rate: 21 }, { name: "Reduced", rate: 9 }, { name: "Zero", rate: 0 }].map((t) => (
                    <div key={t.name} className="flex items-center gap-3 p-2 rounded-md border border-surface-100">
                      <input type="text" className="input flex-1" defaultValue={t.name} />
                      <input type="number" className="input w-20 text-right" defaultValue={t.rate} /><span className="text-2xs text-surface-400">%</span>
                      <button className="text-surface-300 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  ))}
                </div>
                <button className="btn-ghost text-2xs"><Plus className="h-3 w-3" /> Add Tax Rate</button>
              </div>
              <div className="flex justify-end"><button className="btn-primary">Save Tax Settings</button></div>
            </div>
          )}

          {/* ═══ INTEGRATIONS ═══ */}
          {generalTab === "integrations" && (
            <div className="space-y-6">
              <div><h2 className="text-sm font-semibold text-surface-800 mb-1">Integrations</h2><p className="text-2xs text-surface-400">Connect external services.</p></div>
              {[
                { name: "Clerk", desc: "Authentication & user management", status: "connected", color: "bg-purple-50 text-purple-700" },
                { name: "Neon", desc: "PostgreSQL serverless database", status: "connected", color: "bg-emerald-50 text-emerald-700" },
                { name: "Resend", desc: "Transactional email delivery", status: "not_connected", color: "bg-surface-100 text-surface-500" },
                { name: "Stripe", desc: "Payment processing", status: "not_connected", color: "bg-surface-100 text-surface-500" },
                { name: "Vercel", desc: "Hosting & deployment", status: "connected", color: "bg-black/5 text-surface-800" },
              ].map((int) => (
                <div key={int.name} className="card p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-md ${int.color} text-xs font-bold`}>{int.name.slice(0, 2)}</div>
                    <div><p className="text-xs font-semibold text-surface-800">{int.name}</p><p className="text-2xs text-surface-400">{int.desc}</p></div>
                  </div>
                  {int.status === "connected" ? <div className="flex items-center gap-2"><span className="badge-success">Connected</span><button className="btn-ghost text-2xs">Configure</button></div> : <button className="btn-secondary text-2xs">Connect</button>}
                </div>
              ))}
            </div>
          )}

          {/* ═══ NOTIFICATIONS ═══ */}
          {generalTab === "notifications" && (
            <div className="space-y-6">
              <div><h2 className="text-sm font-semibold text-surface-800 mb-1">Notifications</h2><p className="text-2xs text-surface-400">Configure email and in-app notifications.</p></div>
              <div className="card p-5 space-y-4">
                {[
                  { label: "Invoice paid", desc: "When a client pays an invoice" },
                  { label: "Invoice overdue", desc: "When an invoice passes its due date" },
                  { label: "Proposal approved", desc: "When a client approves a proposal" },
                  { label: "New payment received", desc: "When a payment is recorded" },
                  { label: "Low balance alert", desc: "Bank account below threshold" },
                  { label: "Monthly report ready", desc: "Monthly financial report generated" },
                ].map((n) => (
                  <div key={n.label} className="flex items-center justify-between py-1">
                    <div><p className="text-xs text-surface-700">{n.label}</p><p className="text-2xs text-surface-400">{n.desc}</p></div>
                    <div className="flex gap-3">
                      <label className="flex items-center gap-1 text-2xs text-surface-500"><input type="checkbox" defaultChecked className="rounded border-surface-300" /> Email</label>
                      <label className="flex items-center gap-1 text-2xs text-surface-500"><input type="checkbox" defaultChecked className="rounded border-surface-300" /> In-app</label>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end"><button className="btn-primary">Save Notifications</button></div>
            </div>
          )}

          {/* ═══ APPEARANCE ═══ */}
          {generalTab === "appearance" && (
            <div className="space-y-6">
              <div><h2 className="text-sm font-semibold text-surface-800 mb-1">Appearance</h2><p className="text-2xs text-surface-400">Customize the look and feel.</p></div>
              <div className="card p-5 space-y-4">
                <div><label className="label">Brand Color</label>
                  <div className="flex gap-2">{["#3B2D8E", "#2563eb", "#7c3aed", "#059669", "#d97706", "#dc2626"].map((c) => (<button key={c} className="h-8 w-8 rounded-full border-2 border-white shadow-sm ring-1 ring-surface-200 hover:ring-brand-500" style={{ backgroundColor: c }} />))}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="label">Date Format</label><select className="input"><option>MMM D, YYYY</option><option>DD/MM/YYYY</option><option>YYYY-MM-DD</option></select></div>
                  <div><label className="label">Number Format</label><select className="input"><option>1,234.56</option><option>1.234,56</option></select></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="label">Default Hourly Rate</label><input type="number" className="input" step="0.01" defaultValue={65} /></div>
                  <div><label className="label">Invoice Prefix</label><input type="text" className="input" defaultValue="INV-" /></div>
                </div>
              </div>
              <div className="flex justify-end"><button className="btn-primary">Save Appearance</button></div>
            </div>
          )}

          {/* ═══ API KEYS ═══ */}
          {generalTab === "api" && (
            <div className="space-y-6">
              <div><h2 className="text-sm font-semibold text-surface-800 mb-1">API Keys</h2><p className="text-2xs text-surface-400">Manage API keys for external integrations.</p></div>
              <div className="card p-5 space-y-3">
                {[
                  { name: "Production API Key", key: "ll_live_****...3f9a", created: "Mar 1, 2026" },
                  { name: "Development API Key", key: "ll_test_****...7b2c", created: "Feb 15, 2026" },
                ].map((k) => (
                  <div key={k.name} className="flex items-center justify-between p-3 rounded-md border border-surface-100">
                    <div><p className="text-xs font-medium text-surface-800">{k.name}</p><p className="text-2xs font-mono text-surface-400">{k.key}</p><p className="text-2xs text-surface-400">Created: {k.created}</p></div>
                    <div className="flex gap-2"><button className="btn-ghost text-2xs">Reveal</button><button className="btn-ghost text-2xs text-red-500">Revoke</button></div>
                  </div>
                ))}
              </div>
              <button className="btn-secondary"><Plus className="h-3.5 w-3.5" /> Generate New Key</button>
            </div>
          )}

          {/* ═══ IMPORT/EXPORT ═══ */}
          {generalTab === "import-export" && (
            <ImportExportPanel />
          )}
        </div>
      </div>
    </div>
  )
}
