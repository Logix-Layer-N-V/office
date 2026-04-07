"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { DocumentPreview } from "@/components/ui/document-preview"
import { PreviewToolbar, PreviewContainer } from "@/components/ui/preview-toolbar"
import { useApi } from "@/hooks/use-api"
import type { Estimate } from "@/types"

export default function EstimatePreviewPage() {
  const params = useParams()
  const id = params.id as string
  const [zoom, setZoom] = useState(100)
  const { data: e, loading } = useApi<Estimate | null>(`/api/estimates/${id}`, null)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    )
  }

  if (!e) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-surface-400">
        <p>The requested estimate was not found.</p>
        <a href="/estimates" className="mt-2 text-brand-600 hover:underline">Back to estimates</a>
      </div>
    )
  }

  const client = e.client || { name: "Unknown Client", email: "-" }

  return (
    <div className="min-h-screen">
      <PreviewToolbar
        backHref={`/estimates/${id}`}
        backLabel="Back to estimate"
        editHref={`/estimates/${id}/edit`}
        zoom={zoom}
        onZoomChange={setZoom}
        documentNumber={e.number}
      />
      <PreviewContainer zoom={zoom}>
        <DocumentPreview
          type="ESTIMATE"
          number={e.number || ""}
          title={e.title || ""}
          status={e.status || ""}
          client={client}
          items={e.items || []}
          subtotal={parseFloat(String(e.subtotal)) || 0}
          taxRate={parseFloat(String(e.taxRate)) || 0}
          taxAmount={parseFloat(String(e.taxAmount)) || 0}
          total={parseFloat(String(e.total)) || 0}
          issueDate={e.createdAt || ""}
          validUntil={e.validUntil}
          notes={e.description}
        />
      </PreviewContainer>
    </div>
  )
}
