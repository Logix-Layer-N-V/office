"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { DetailHeader } from "@/components/ui/detail-header"
import { LineItemsEditor, type LineItem } from "@/components/ui/line-items-editor"
import { useApi, apiMutate } from "@/hooks/use-api"
import { formatCurrency } from "@/lib/utils"
import { Save, Send } from "lucide-react"
import type { Proposal, Client } from "@/types"

export default function ProposalEditPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [items, setItems] = useState<LineItem[]>([])
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [clientId, setClientId] = useState("")
  const [validUntil, setValidUntil] = useState("")
  const [taxRate, setTaxRate] = useState(0)

  const { data: proposal, loading } = useApi<Proposal | null>(`/api/proposals/${id}`, null)
  const { data: clients = [] } = useApi<Client[]>("/api/clients", [])

  useEffect(() => {
    if (proposal) {
      setItems(proposal.items || [])
      setTitle(proposal.title)
      setDescription(proposal.description || "")
      setClientId(proposal.clientId)
      setValidUntil(proposal.validUntil || "")
      setTaxRate(proposal.taxRate || 0)
    }
  }, [proposal])

  if (loading) {
    return (
      <div>
        <DetailHeader backHref="/proposals" backLabel="Proposals" title="Loading..." />
        <div className="flex items-center justify-center p-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      </div>
    )
  }

  if (!proposal) {
    return (
      <div>
        <DetailHeader backHref="/proposals" backLabel="Proposals" title="Not Found" />
        <div className="flex flex-col items-center justify-center p-12 text-surface-400">
          <p>The requested proposal was not found.</p>
          <a href="/proposals" className="mt-2 text-brand-600 hover:underline">Back to proposals</a>
        </div>
      </div>
    )
  }

  const handleSave = async () => {
    try {
      await apiMutate(`/api/proposals/${id}`, "PUT", {
        title,
        description,
        clientId,
        validUntil,
        taxRate,
        items,
      })
      router.push(`/proposals/${id}`)
    } catch (error) {
      console.error("Failed to save proposal:", error)
    }
  }

  const subtotal = items.reduce((s, i) => s + i.amount, 0)


  return (
    <div>
      <DetailHeader
        backHref={`/proposals/${id}`} backLabel="Back to proposal"
        title={`Edit ${proposal?.number}`} subtitle="Edit proposal details and line items"
        actions={
          <>
            <button className="btn-secondary" onClick={handleSave}><Save className="h-3.5 w-3.5" /> Save Draft</button>
            <button className="btn-primary" onClick={handleSave}><Send className="h-3.5 w-3.5" /> Save & Send</button>
          </>
        }
      />

      <div className="p-6 space-y-6">
        <div className="card p-5 space-y-4">
          <h3 className="text-xs font-semibold text-surface-700">Proposal Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Client</label>
              <select className="input" value={clientId} onChange={(e) => setClientId(e.target.value)}>
                <option value="">Select a client</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name} — {c.company}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Valid Until</label>
              <input type="date" className="input" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Title</label>
            <input type="text" className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </div>

        <div className="card p-5 space-y-4">
          <h3 className="text-xs font-semibold text-surface-700">Line Items</h3>
          <LineItemsEditor items={items} onChange={setItems} defaultRate={65} />
        </div>

        {/* Totals */}
        <div className="card p-5">
          <div className="flex justify-between items-start">
            <div>
              <label className="label">Tax Rate (%)</label>
              <input type="number" className="input w-24" step="0.1" value={taxRate} onChange={(e) => setTaxRate(parseFloat(e.target.value))} />
            </div>
            <div className="text-right space-y-1">
              <div className="flex justify-between gap-8 text-xs">
                <span className="text-surface-400">Subtotal</span>
                <span className="font-medium text-surface-700">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between gap-8 text-xs">
                <span className="text-surface-400">Tax</span>
                <span className="text-surface-700">{formatCurrency(0)}</span>
              </div>
              <div className="flex justify-between gap-8 border-t border-surface-200 pt-1">
                <span className="text-sm font-bold text-surface-700">Total</span>
                <span className="text-lg font-bold text-surface-800">{formatCurrency(subtotal)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <label className="label">Notes / Terms</label>
          <textarea className="input" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Payment terms, notes for client..." />
        </div>
      </div>
    </div>
  )
}
