"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { apiMutate } from "@/hooks/use-api"
import type { ClientStatus } from "@/types"
import { ArrowLeft, AlertCircle } from "lucide-react"

export default function ClientsNewPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [client, setClient] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    address: "",
    taxId: "",
    currency: "USD",
    status: "ACTIVE" as ClientStatus,
    notes: "",
  })

  const saveClient = async () => {
    if (!client.name || !client.email) {
      setError("Name and Email are required")
      return
    }

    setLoading(true)
    setError(null)

    try {
      await apiMutate("/api/clients", "POST", client)
      router.push("/clients")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create client")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-surface-50">
      {/* Header */}
      <header className="flex h-12 items-center border-b border-surface-200 bg-white px-6">
        <button
          onClick={() => router.push("/clients")}
          className="flex items-center gap-2 text-sm font-semibold text-surface-600 hover:text-surface-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Clients
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto">
          {/* Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-surface-800">Add Client</h1>
            <p className="text-sm text-surface-400 mt-1">Create a new client record</p>
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

          {/* Form Card */}
          <div className="card p-6">
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); saveClient() }}>
              {/* Row 1: Name, Company */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Name *</label>
                  <input
                    type="text"
                    className="input w-full"
                    placeholder="Client name"
                    value={client.name}
                    onChange={(e) => setClient((v) => ({ ...v, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label">Company</label>
                  <input
                    type="text"
                    className="input w-full"
                    placeholder="Company name"
                    value={client.company}
                    onChange={(e) => setClient((v) => ({ ...v, company: e.target.value }))}
                  />
                </div>
              </div>

              {/* Row 2: Email, Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Email *</label>
                  <input
                    type="email"
                    className="input w-full"
                    placeholder="email@company.com"
                    value={client.email}
                    onChange={(e) => setClient((v) => ({ ...v, email: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input
                    type="tel"
                    className="input w-full"
                    placeholder="+31 20 123 4567"
                    value={client.phone}
                    onChange={(e) => setClient((v) => ({ ...v, phone: e.target.value }))}
                  />
                </div>
              </div>

              {/* Row 3: Address (full width) */}
              <div>
                <label className="label">Address</label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="Street, City, Country"
                  value={client.address}
                  onChange={(e) => setClient((v) => ({ ...v, address: e.target.value }))}
                />
              </div>

              {/* Row 4: Tax ID, Currency, Status */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label">Tax ID</label>
                  <input
                    type="text"
                    className="input w-full"
                    placeholder="NL123456789B01"
                    value={client.taxId}
                    onChange={(e) => setClient((v) => ({ ...v, taxId: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label">Currency</label>
                  <select
                    className="input w-full"
                    value={client.currency}
                    onChange={(e) => setClient((v) => ({ ...v, currency: e.target.value }))}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="SRD">SRD</option>
                    <option value="GBP">GBP</option>
                    <option value="USDT">USDT</option>
                  </select>
                </div>
                <div>
                  <label className="label">Status</label>
                  <select
                    className="input w-full"
                    value={client.status}
                    onChange={(e) => setClient((v) => ({ ...v, status: e.target.value as ClientStatus }))}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="LEAD">Lead</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
              </div>

              {/* Row 5: Notes (textarea) */}
              <div>
                <label className="label">Notes</label>
                <textarea
                  className="input w-full"
                  rows={3}
                  placeholder="Internal notes about this client..."
                  value={client.notes}
                  onChange={(e) => setClient((v) => ({ ...v, notes: e.target.value }))}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-surface-200">
                <button
                  type="button"
                  onClick={() => router.push("/clients")}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? "Creating..." : "Create Client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
