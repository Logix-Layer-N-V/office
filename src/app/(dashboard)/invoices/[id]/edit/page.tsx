"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { DetailHeader } from "@/components/ui/detail-header"
import { LineItemsEditor, type LineItem } from "@/components/ui/line-items-editor"
import { useApi, apiMutate } from "@/hooks/use-api"
import { formatCurrency, toNum } from "@/lib/utils"
import { Save, Send } from "lucide-react"
import type { Invoice, Client } from "@/types"

export default function InvoiceEditPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [items, setItems] = useState<LineItem[]>([])
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [clientId, setClientId] = useState("")
  const [dueDate, setDueDate] = useState("")

  const { data: invoice, loading } = useApi<Invoice | null>(`/api/invoices/${id}`, null)
  const { data: clients = [] } = useApi<Client[]>("/api/clients", [])

  useEffect(() => {
    if (invoice) {
      setItems(invoice.items || [])
      setTitle(invoice.title)
      setDescription(invoice.description || "")
      setClientId(invoice.clientId)
      setDueDate(invoice.dueDate || "")
    }
  }, [invoice])

  if (loading) {
    return (
      <div>
        <DetailHeader backHref="/invoices" backLabel="Invoices" title="Loading..." />
        <div className="flex items-center justify-center p-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div>
        <DetailHeader backHref="/invoices" backLabel="Invoices" title="Not Found" />
        <div className="flex flex-col items-center justify-center p-12 text-surface-400">
          <p>The requested invoice was not found.</p>
          <a href="/invoices" className="mt-2 text-brand-600 hover:underline">Back to invoices</a>
        </div>
      </div>
    )
  }

  const handleSave = async () => {
    try {
      await apiMutate(`/api/invoices/${id}`, "PUT", {
        title,
        description,
        clientId,
        dueDate,
        items,
      })
      router.push(`/invoices/${id}`)
    } catch (error) {
      console.error("Failed to save invoice:", error)
    }
  }

  const subtotal = items.reduce((s, i) => s + toNum(i.amount), 0)

  return (
    <div>
      <DetailHeader backHref={`/invoices/${id}`} backLabel="Back to invoice" title={`Edit ${invoice?.number}`}
        actions={<><button className="btn-secondary" onClick={handleSave}><Save className="h-3.5 w-3.5" /> Save Draft</button><button className="btn-primary" onClick={handleSave}><Send className="h-3.5 w-3.5" /> Save & Send</button></>}
      />
      <div className="p-6 space-y-6">
        <div className="card p-5 space-y-4">
          <h3 className="text-xs font-semibold text-surface-700">Invoice Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Client</label><select className="input" value={clientId} onChange={(e) => setClientId(e.target.value)}><option value="">Select a client</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <div><label className="label">Due Date</label><input type="date" className="input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></div>
          </div>
          <div><label className="label">Title</label><input type="text" className="input" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div><label className="label">Description</label><textarea className="input" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
        </div>
        <div className="card p-5 space-y-4">
          <h3 className="text-xs font-semibold text-surface-700">Line Items</h3>
          <LineItemsEditor items={items} onChange={setItems} />
        </div>
        <div className="card p-5 flex justify-end">
          <div className="text-right"><span className="text-2xs text-surface-400">Total</span><p className="text-lg font-bold text-surface-800">{formatCurrency(subtotal)}</p></div>
        </div>
        <div className="card p-5"><label className="label">Notes</label><textarea className="input" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
      </div>
    </div>
  )
}
