"use client"

import { useState } from "react"
import { apiMutate } from "@/hooks/use-api"
import type { Client, ClientStatus } from "@/types"
import { X, Plus, AlertCircle } from "lucide-react"

interface ClientSelectProps {
  clients: Client[]
  value: string
  onChange: (clientId: string) => void
  onClientCreated?: (client: Client) => void
  required?: boolean
  label?: string
}

const emptyClient = {
  name: "",
  company: "",
  email: "",
  phone: "",
  address: "",
  taxId: "",
  currency: "USD",
  status: "ACTIVE" as ClientStatus,
  notes: "",
}

export function ClientSelect({
  clients,
  value,
  onChange,
  onClientCreated,
  required = false,
  label = "Client",
}: ClientSelectProps) {
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ ...emptyClient })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    if (val === "__CREATE_NEW__") {
      setForm({ ...emptyClient })
      setError("")
      setShowModal(true)
    } else {
      onChange(val)
    }
  }

  const handleCreate = async () => {
    if (!form.name || !form.email) {
      setError("Name and Email are required")
      return
    }

    setLoading(true)
    setError("")

    try {
      const newClient = await apiMutate<Client>("/api/clients", "POST", form)
      setShowModal(false)
      setForm({ ...emptyClient })

      // Select the newly created client
      if (newClient?.id) {
        onChange(newClient.id)
      }

      // Notify parent to refresh clients list
      if (onClientCreated) {
        onClientCreated(newClient)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create client")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div>
        <label className="label">{label}{required && " *"}</label>
        <select
          value={value}
          onChange={handleSelectChange}
          className="input w-full"
          required={required}
        >
          <option value="">Select client...</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}{c.company ? ` — ${c.company}` : ""}
            </option>
          ))}
          <option disabled>──────────</option>
          <option value="__CREATE_NEW__">+ Create New Client</option>
        </select>
      </div>

      {/* Create Client Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-lg mx-4 rounded-xl border border-surface-200 bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-surface-200 px-6 py-4">
              <div className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-brand-600" />
                <h2 className="text-lg font-semibold text-surface-800">New Client</h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-md p-1 text-surface-400 hover:bg-surface-100 hover:text-surface-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {error && (
                <div className="flex gap-2 rounded-lg bg-red-50 p-3 border border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Name + Company */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Name *</label>
                  <input
                    type="text"
                    className="input w-full"
                    placeholder="Client name"
                    value={form.name}
                    onChange={(e) => setForm((v) => ({ ...v, name: e.target.value }))}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="label">Company</label>
                  <input
                    type="text"
                    className="input w-full"
                    placeholder="Company name"
                    value={form.company}
                    onChange={(e) => setForm((v) => ({ ...v, company: e.target.value }))}
                  />
                </div>
              </div>

              {/* Email + Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Email *</label>
                  <input
                    type="email"
                    className="input w-full"
                    placeholder="email@company.com"
                    value={form.email}
                    onChange={(e) => setForm((v) => ({ ...v, email: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input
                    type="tel"
                    className="input w-full"
                    placeholder="+31 20 123 4567"
                    value={form.phone}
                    onChange={(e) => setForm((v) => ({ ...v, phone: e.target.value }))}
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="label">Address</label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="Street, City, Country"
                  value={form.address}
                  onChange={(e) => setForm((v) => ({ ...v, address: e.target.value }))}
                />
              </div>

              {/* Tax ID + Currency */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Tax ID</label>
                  <input
                    type="text"
                    className="input w-full"
                    placeholder="NL123456789B01"
                    value={form.taxId}
                    onChange={(e) => setForm((v) => ({ ...v, taxId: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label">Currency</label>
                  <select
                    className="input w-full"
                    value={form.currency}
                    onChange={(e) => setForm((v) => ({ ...v, currency: e.target.value }))}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="SRD">SRD</option>
                    <option value="GBP">GBP</option>
                    <option value="USDT">USDT</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-surface-200 px-6 py-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreate}
                className="btn-primary"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Client"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
