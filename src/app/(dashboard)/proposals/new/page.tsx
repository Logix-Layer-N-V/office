"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/dashboard/header"
import { useApi, apiMutate } from "@/hooks/use-api"
import type { Client, Proposal } from "@/types"
import { formatCurrency } from "@/lib/utils"
import { X, Send, ArrowLeft } from "lucide-react"
import { ClientSelect } from "@/components/ui/client-select"

interface LineItem {
  description: string
  hours: number
  rate: number
  amount: number
}

export default function NewProposalPage() {
  const router = useRouter()
  const { data: clients, refresh: refreshClients } = useApi<Client[]>("/api/clients", [])

  const [clientId, setClientId] = useState("")
  const [validUntil, setValidUntil] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [taxRate, setTaxRate] = useState(0)
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: "", hours: 0, rate: 65, amount: 0 },
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const addLineItem = () => {
    setLineItems([...lineItems, { description: "", hours: 0, rate: 65, amount: 0 }])
  }

  const updateLineItem = (index: number, field: string, value: string | number) => {
    const updated = [...lineItems]
    updated[index] = { ...updated[index], [field]: value }
    if (field === "hours" || field === "rate") {
      updated[index].amount = Number(updated[index].hours) * Number(updated[index].rate)
    }
    setLineItems(updated)
  }

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index))
    }
  }

  const subtotal = lineItems.reduce((s, item) => s + item.amount, 0)
  const taxAmount = subtotal * (taxRate / 100)
  const total = subtotal + taxAmount

  const handleSaveDraft = async () => {
    try {
      setError("")
      setLoading(true)

      if (!clientId || !title) {
        setError("Client and Title are required")
        return
      }

      const proposalData = {
        clientId,
        title,
        description,
        validUntil: validUntil || undefined,
        taxRate,
        items: lineItems.map((item) => ({
          description: item.description,
          hours: Number(item.hours),
          rate: Number(item.rate),
          amount: item.amount,
        })),
        status: "DRAFT",
      }

      await apiMutate<Proposal>("/api/proposals", "POST", proposalData)
      router.push("/proposals")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save proposal")
    } finally {
      setLoading(false)
    }
  }

  const handleSendProposal = async () => {
    try {
      setError("")
      setLoading(true)

      if (!clientId || !title) {
        setError("Client and Title are required")
        return
      }

      const proposalData = {
        clientId,
        title,
        description,
        validUntil: validUntil || undefined,
        taxRate,
        items: lineItems.map((item) => ({
          description: item.description,
          hours: Number(item.hours),
          rate: Number(item.rate),
          amount: item.amount,
        })),
        status: "SENT",
      }

      await apiMutate<Proposal>("/api/proposals", "POST", proposalData)
      router.push("/proposals")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send proposal")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-surface-50">
      <Header
        title="New Proposal"
        action={{
          label: "Back",
          onClick: () => router.back(),
        }}
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form className="space-y-6">
            {/* Client & Valid Until Row */}
            <div className="grid grid-cols-2 gap-4">
              <ClientSelect
                clients={clients}
                value={clientId}
                onChange={setClientId}
                onClientCreated={() => refreshClients()}
                required
              />
              <div>
                <label className="label">Valid Until</label>
                <input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="input w-full"
                />
              </div>
            </div>

            {/* Title Row */}
            <div>
              <label className="label">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input w-full"
                placeholder="e.g. Website Redesign & Development"
                required
              />
            </div>

            {/* Description Row */}
            <div>
              <label className="label">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input w-full"
                rows={3}
                placeholder="Project description..."
              />
            </div>

            {/* Line Items Section */}
            <div>
              <label className="label mb-2 block">Line Items</label>
              <div className="rounded-md border border-surface-200 overflow-hidden">
                <table className="table-compact w-full">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th className="w-24">Hours</th>
                      <th className="w-28">Rate (USD)</th>
                      <th className="w-32 text-right">Amount</th>
                      <th className="w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item, idx) => (
                      <tr key={idx}>
                        <td>
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateLineItem(idx, "description", e.target.value)}
                            className="input"
                            placeholder="Service description"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={item.hours}
                            onChange={(e) => updateLineItem(idx, "hours", parseFloat(e.target.value) || 0)}
                            className="input"
                            min="0"
                            step="0.5"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={item.rate}
                            onChange={(e) => updateLineItem(idx, "rate", parseFloat(e.target.value) || 0)}
                            className="input"
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td className="text-right font-medium">{formatCurrency(item.amount)}</td>
                        <td className="text-center">
                          {lineItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeLineItem(idx)}
                              className="inline-flex items-center justify-center rounded p-1 hover:bg-red-50 text-red-400"
                              title="Remove item"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                type="button"
                onClick={addLineItem}
                className="btn-ghost text-2xs mt-2"
              >
                + Add Line Item
              </button>
            </div>

            {/* Tax Rate */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="label">Tax Rate (%)</label>
                <input
                  type="number"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  className="input w-full"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
            </div>

            {/* Summary Section */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2 rounded-md border border-surface-200 bg-surface-50 p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-surface-600">Subtotal</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                {taxRate > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-600">Tax ({taxRate}%)</span>
                    <span className="font-medium">{formatCurrency(taxAmount)}</span>
                  </div>
                )}
                <div className="border-t border-surface-200 pt-2 flex justify-between">
                  <span className="font-semibold text-surface-800">Total</span>
                  <span className="text-lg font-semibold text-brand-600">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center border-t border-surface-200 pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn-secondary flex items-center gap-2"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Cancel
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={loading}
                  className="btn-secondary"
                >
                  {loading ? "Saving..." : "Save Draft"}
                </button>
                <button
                  type="button"
                  onClick={handleSendProposal}
                  disabled={loading}
                  className="btn-primary flex items-center gap-2"
                >
                  <Send className="h-3.5 w-3.5" />
                  {loading ? "Sending..." : "Send Proposal"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
