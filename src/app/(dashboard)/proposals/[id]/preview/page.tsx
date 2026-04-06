"use client"

import { useParams } from "next/navigation"
import { DetailHeader } from "@/components/ui/detail-header"
import { DocumentPreview } from "@/components/ui/document-preview"
import { useApi } from "@/hooks/use-api"
import { Download, Printer, Send } from "lucide-react"
import type { Proposal } from "@/types"

export default function ProposalPreviewPage() {
  const params = useParams()
  const id = params.id as string
  const { data: p, loading } = useApi<Proposal | null>(`/api/proposals/${id}`, null)

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

  if (!p) {
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

  return (
    <div>
      <DetailHeader
        backHref={`/proposals/${id}`} backLabel="Back to proposal"
        title={`${p?.number} Preview`} subtitle="Client-ready document preview"
        editHref={`/proposals/${id}/edit`}
        actions={
          <>
            <button onClick={() => window.print()} className="btn-secondary"><Printer className="h-3.5 w-3.5" /> Print</button>
            <button className="btn-secondary"><Download className="h-3.5 w-3.5" /> PDF</button>
            <button className="btn-primary"><Send className="h-3.5 w-3.5" /> Send to Client</button>
          </>
        }
      />


      <div className="p-8 bg-surface-100 min-h-screen print:bg-white print:p-0">
        {p?.client && <DocumentPreview
          type="PROPOSAL"
          number={p?.number || ""}
          title={p?.title || ""}
          status={p?.status || ""}
          client={p.client}
          items={p?.items || []}
          subtotal={p?.subtotal || 0}
          taxRate={p?.taxRate || 0}
          taxAmount={p?.taxAmount || 0}
          total={p?.total || 0}
          issueDate={p?.createdAt || ""}
          validUntil={p?.validUntil}
          notes={p?.description}
        />}
      </div>
    </div>
  )
}
