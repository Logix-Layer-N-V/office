"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { DocumentPreview } from "@/components/ui/document-preview"
import { PreviewToolbar, PreviewContainer } from "@/components/ui/preview-toolbar"
import { useApi } from "@/hooks/use-api"
import type { Invoice } from "@/types"

export default function InvoicePreviewPage() {
  const params = useParams()
  const id = params.id as string
  const [zoom, setZoom] = useState(100)
  const { data: inv, loading } = useApi<Invoice | null>(`/api/invoices/${id}`, null)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    )
  }

  if (!inv) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-surface-400">
        <p>The requested invoice was not found.</p>
        <a href="/invoices" className="mt-2 text-brand-600 hover:underline">Back to invoices</a>
      </div>
    )
  }

  const client = inv.client || { name: "Unknown Client", email: "-" }

  return (
    <div className="min-h-screen">
      <PreviewToolbar
        backHref={`/invoices/${id}`}
        backLabel="Back to invoice"
        editHref={`/invoices/${id}/edit`}
        zoom={zoom}
        onZoomChange={setZoom}
        documentNumber={inv.number}
      />
      <PreviewContainer zoom={zoom}>
        <DocumentPreview
          type="INVOICE"
          number={inv.number || ""}
          title={inv.title || ""}
          status={inv.status || ""}
          client={client}
          items={inv.items || []}
          subtotal={parseFloat(String(inv.subtotal)) || 0}
          taxRate={parseFloat(String(inv.taxRate)) || 0}
          taxAmount={parseFloat(String(inv.taxAmount)) || 0}
          total={parseFloat(String(inv.total)) || 0}
          issueDate={inv.issueDate || ""}
          dueDate={inv.dueDate}
          notes={inv.description}
          terms="A setup fee of 75% of the total project cost is required to start the project."
          amountPaid={parseFloat(String(inv.amountPaid)) || 0}
          amountDue={parseFloat(String(inv.amountDue)) || 0}
          payments={inv.payments?.map(p => ({
            id: p.id,
            number: p.number,
            amount: parseFloat(String(p.amount)) || 0,
            method: p.method,
            date: p.receivedAt,
            status: p.status
          }))}
        />
      </PreviewContainer>
    </div>
  )
}
