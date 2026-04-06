"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/dashboard/header"
import { apiMutate } from "@/hooks/use-api"
import type { Item, ItemType } from "@/types"
import { ArrowLeft, Download, Upload, AlertCircle, CheckCircle } from "lucide-react"

type TabType = "single" | "bulk"

const ITEM_TYPES: { value: ItemType; label: string }[] = [
  { value: "SERVICE", label: "Service" },
  { value: "PRODUCT", label: "Product" },
  { value: "API_COST", label: "API Cost" },
  { value: "AI_TOKEN", label: "AI Token" },
]

const UNITS = ["hour", "license", "month", "transaction", "1M tokens", "unit"]

export default function ItemsNewPage() {
  const router = useRouter()
  const [tab, setTab] = useState<TabType>("single")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Single item form state
  const [singleItem, setSingleItem] = useState({
    name: "",
    type: "SERVICE" as ItemType,
    unit: "hour",
    rate: 65,
    description: "",
    isActive: true,
  })

  // Bulk import state
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [parsedRows, setParsedRows] = useState<Record<string, string>[]>([])
  const [importProgress, setImportProgress] = useState(0)
  const [importComplete, setImportComplete] = useState(false)
  const [importResults, setImportResults] = useState<{ success: number; failed: number; errors: string[] }>({
    success: 0,
    failed: 0,
    errors: [],
  })

  // ─── Single Item Form ────────────────────────

  const saveSingleItem = async () => {
    if (!singleItem.name) {
      setError("Item name is required")
      return
    }

    setLoading(true)
    setError(null)

    try {
      await apiMutate("/api/items", "POST", singleItem)
      router.push("/items")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create item")
    } finally {
      setLoading(false)
    }
  }

  // ─── CSV Download ───────────────────────────

  const downloadTemplate = () => {
    const csv = `name,type,unit,rate,description
Web Development,SERVICE,hour,65,Full-stack web development (Next.js)
UI/UX Design,SERVICE,hour,55,Interface design and prototyping
SaaS Starter Kit,PRODUCT,license,2500,Next.js boilerplate with auth and payments
Vercel API Hosting,API_COST,month,20,Serverless function invocations
Claude API (Opus),AI_TOKEN,1M tokens,75,Anthropic Claude Opus — $15/1M input $75/1M output`

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "items-import-template.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  // ─── CSV Parsing ────────────────────────────

  const parseCSV = (text: string) => {
    const lines = text.trim().split("\n")
    if (lines.length < 2) return []

    const headers = lines[0].split(",").map((h) => h.trim())
    return lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim())
      return headers.reduce(
        (obj, h, i) => ({ ...obj, [h]: values[i] || "" }),
        {} as Record<string, string>
      )
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith(".csv")) {
      setError("Please upload a CSV file")
      return
    }

    setCsvFile(file)
    setError(null)
    setImportComplete(false)

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const rows = parseCSV(text)
      if (rows.length === 0) {
        setError("CSV file is empty or invalid")
        return
      }
      setParsedRows(rows)
    }
    reader.readAsText(file)
  }

  const handleDragDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    const file = e.dataTransfer.files?.[0]
    if (file) {
      const input = document.createElement("input")
      input.type = "file"
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)
      input.files = dataTransfer.files
      const event = new Event("change", { bubbles: true })
      Object.defineProperty(event, "target", { value: input, enumerable: true })
      handleFileChange(event as any)
    }
  }

  // ─── Bulk Import ────────────────────────────

  const importAllRows = async () => {
    if (parsedRows.length === 0) {
      setError("No rows to import")
      return
    }

    setLoading(true)
    setError(null)
    setImportProgress(0)
    setImportResults({ success: 0, failed: 0, errors: [] })

    let success = 0
    let failed = 0
    const errors: string[] = []

    for (let i = 0; i < parsedRows.length; i++) {
      const row = parsedRows[i]

      // Validate required fields
      if (!row.name) {
        failed++
        errors.push(`Row ${i + 1}: Missing name`)
        continue
      }

      if (!row.type || !ITEM_TYPES.find((t) => t.value === row.type)) {
        failed++
        errors.push(`Row ${i + 1}: Invalid type "${row.type}"`)
        continue
      }

      if (!row.unit) {
        failed++
        errors.push(`Row ${i + 1}: Missing unit`)
        continue
      }

      const rate = parseFloat(row.rate)
      if (isNaN(rate)) {
        failed++
        errors.push(`Row ${i + 1}: Invalid rate "${row.rate}"`)
        continue
      }

      try {
        await apiMutate("/api/items", "POST", {
          name: row.name,
          type: row.type as ItemType,
          unit: row.unit,
          rate,
          description: row.description || "",
          isActive: true,
        })
        success++
      } catch (err) {
        failed++
        errors.push(`Row ${i + 1} (${row.name}): ${err instanceof Error ? err.message : "Unknown error"}`)
      }

      setImportProgress(Math.round(((i + 1) / parsedRows.length) * 100))
    }

    setImportResults({ success, failed, errors })
    setImportComplete(true)
    setLoading(false)

    if (success > 0) {
      setTimeout(() => {
        router.push("/items")
      }, 2000)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-surface-50">
      {/* Header */}
      <header className="flex h-12 items-center border-b border-surface-200 bg-white px-6">
        <button
          onClick={() => router.push("/items")}
          className="flex items-center gap-2 text-sm font-semibold text-surface-600 hover:text-surface-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Items
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto">
          {/* Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-surface-800">Add Items</h1>
            <p className="text-sm text-surface-400 mt-1">Create single items or bulk import from CSV</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-surface-200">
            <button
              onClick={() => {
                setTab("single")
                setError(null)
                setImportComplete(false)
              }}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === "single"
                  ? "border-brand-600 text-brand-600"
                  : "border-transparent text-surface-500 hover:text-surface-700"
              }`}
            >
              Single Item
            </button>
            <button
              onClick={() => {
                setTab("bulk")
                setError(null)
              }}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === "bulk"
                  ? "border-brand-600 text-brand-600"
                  : "border-transparent text-surface-500 hover:text-surface-700"
              }`}
            >
              Bulk Import
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 flex gap-3 rounded-lg bg-red-50 p-4 border border-red-200">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-900">{error}</p>
              </div>
            </div>
          )}

          {/* Single Item Tab */}
          {tab === "single" && (
            <div className="card p-6">
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); saveSingleItem() }}>
                <div>
                  <label className="label">Item Name *</label>
                  <input
                    type="text"
                    className="input w-full"
                    placeholder="e.g. Web Development, SaaS License"
                    value={singleItem.name}
                    onChange={(e) => setSingleItem((v) => ({ ...v, name: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Type *</label>
                    <select
                      className="input w-full"
                      value={singleItem.type}
                      onChange={(e) => setSingleItem((v) => ({ ...v, type: e.target.value as ItemType }))}
                    >
                      {ITEM_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Unit *</label>
                    <select
                      className="input w-full"
                      value={singleItem.unit}
                      onChange={(e) => setSingleItem((v) => ({ ...v, unit: e.target.value }))}
                    >
                      {UNITS.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label">Rate (USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input w-full"
                    placeholder="65.00"
                    value={singleItem.rate}
                    onChange={(e) => setSingleItem((v) => ({ ...v, rate: parseFloat(e.target.value) || 0 }))}
                  />
                </div>

                <div>
                  <label className="label">Description</label>
                  <textarea
                    className="input w-full"
                    rows={3}
                    placeholder="What does this item cover?"
                    value={singleItem.description}
                    onChange={(e) => setSingleItem((v) => ({ ...v, description: e.target.value }))}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="active"
                    className="rounded"
                    checked={singleItem.isActive}
                    onChange={(e) => setSingleItem((v) => ({ ...v, isActive: e.target.checked }))}
                  />
                  <label htmlFor="active" className="text-sm text-surface-600">
                    Item is active
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-surface-200">
                  <button
                    type="button"
                    onClick={() => router.push("/items")}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? "Creating..." : "Create Item"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Bulk Import Tab */}
          {tab === "bulk" && (
            <div className="space-y-6">
              {/* Template Download */}
              <div className="card p-6">
                <h3 className="text-sm font-semibold text-surface-800 mb-3">Step 1: Download Template</h3>
                <p className="text-xs text-surface-500 mb-4">
                  Download a CSV template with example data to guide your bulk import.
                </p>
                <button onClick={downloadTemplate} className="btn-secondary flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download Template
                </button>
              </div>

              {/* File Upload */}
              <div className="card p-6">
                <h3 className="text-sm font-semibold text-surface-800 mb-3">Step 2: Upload CSV</h3>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDragDrop}
                  className="border-2 border-dashed border-surface-300 rounded-lg p-8 text-center hover:border-brand-300 hover:bg-brand-50/30 transition-colors"
                >
                  <Upload className="h-8 w-8 text-surface-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-surface-600 mb-1">Drag & drop your CSV file here</p>
                  <p className="text-xs text-surface-400 mb-4">or click to browse</p>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                    id="csv-upload"
                  />
                  <label htmlFor="csv-upload" className="btn-secondary cursor-pointer inline-block">
                    Choose File
                  </label>
                  {csvFile && <p className="text-xs text-emerald-600 mt-3 font-medium">✓ {csvFile.name}</p>}
                </div>
              </div>

              {/* Preview */}
              {parsedRows.length > 0 && (
                <div className="card p-6">
                  <h3 className="text-sm font-semibold text-surface-800 mb-3">
                    Step 3: Preview ({parsedRows.length} rows)
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="table-compact w-full text-xs">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Type</th>
                          <th>Unit</th>
                          <th>Rate</th>
                          <th>Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedRows.slice(0, 5).map((row, idx) => (
                          <tr key={idx}>
                            <td className="font-medium">{row.name}</td>
                            <td>{row.type}</td>
                            <td>{row.unit}</td>
                            <td>{row.rate}</td>
                            <td className="text-surface-500">{row.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {parsedRows.length > 5 && (
                      <p className="text-xs text-surface-400 mt-2">
                        ... and {parsedRows.length - 5} more rows
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Import Progress */}
              {loading && (
                <div className="card p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
                    <p className="text-sm font-semibold text-surface-800">Importing items...</p>
                  </div>
                  <div className="w-full bg-surface-200 rounded-full h-2">
                    <div
                      className="bg-brand-600 h-2 rounded-full transition-all"
                      style={{ width: `${importProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-surface-500 mt-2">{importProgress}% complete</p>
                </div>
              )}

              {/* Import Results */}
              {importComplete && (
                <div className="card p-6 border border-emerald-200 bg-emerald-50/50">
                  <div className="flex items-start gap-3 mb-4">
                    <CheckCircle className="h-6 w-6 text-emerald-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-emerald-900">Import Complete</p>
                      <p className="text-xs text-emerald-700 mt-1">
                        {importResults.success} imported, {importResults.failed} failed
                      </p>
                    </div>
                  </div>

                  {importResults.errors.length > 0 && (
                    <div className="bg-white rounded p-3 text-xs text-surface-600 max-h-32 overflow-y-auto">
                      {importResults.errors.map((err, idx) => (
                        <div key={idx} className="text-red-600">
                          {err}
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-surface-500 mt-4">Redirecting to items in 2 seconds...</p>
                </div>
              )}

              {/* Action Buttons */}
              {parsedRows.length > 0 && !loading && !importComplete && (
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setParsedRows([])
                      setCsvFile(null)
                      setError(null)
                    }}
                    className="btn-secondary"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={importAllRows}
                    className="btn-primary"
                  >
                    Import All ({parsedRows.length})
                  </button>
                </div>
              )}

              {!parsedRows.length && !loading && !importComplete && (
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => router.push("/items")}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
