"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { DocumentPreview } from "@/components/ui/document-preview"
import { PreviewToolbar, PreviewContainer } from "@/components/ui/preview-toolbar"
import { useApi } from "@/hooks/use-api"
import type { Proposal } from "@/types"

export default function ProposalPreviewPage() {
  const params = useParams()
  const id = params.id as string
  const [zoom, setZoom] = useState(100)
  const { data: p, loading } = useApi<Proposal | null>(`/api/proposals/${id}`, null)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    )
  }

  if (!p) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-surface-400">
        <p>The requested proposal was not found.</p>
        <a href="/proposals" className="mt-2 text-brand-600 hover:underline">Back to proposals</a>
      </div>
    )
  }

  const client = p.client || { name: "Unknown Client", email: "-" }

  return (
    <div className="min-h-screen">
      <PreviewToolbar
        backHref={`/proposals/${id}`}
        backLabel="Back to proposal"
        editHref={`/proposals/${id}/edit`}
        zoom={zoom}
        onZoomChange={setZoom}
        documentNumber={p.number}
      />
      <PreviewContainer zoom={zoom}>
        <DocumentPreview
          type="PROPOSAL"
          number={p.number || ""}
          title={p.title || ""}
          status={p.status || ""}
          client={client}
          items={p.items || []}
          subtotal={parseFloat(String(p.subtotal)) || 0}
          taxRate={parseFloat(String(p.taxRate)) || 0}
          taxAmount={parseFloat(String(p.taxAmount)) || 0}
          total={parseFloat(String(p.total)) || 0}
          issueDate={p.createdAt || ""}
          validUntil={p.validUntil}
          notes={p.description}
        />
      </PreviewContainer>
    </div>
  )
}
