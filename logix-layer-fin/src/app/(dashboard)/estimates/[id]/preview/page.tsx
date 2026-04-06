"use client"

import { useParams } from "next/navigation"
import { DetailHeader } from "@/components/ui/detail-header"
import { DocumentPreview } from "@/components/ui/document-preview"
import { useApi } from "@/hooks/use-api"
import { Download, Printer, Send } from "lucide-react"
import type { Estimate } from "@/types"

export default function EstimatePreviewPage() {
  const params = useParams()
  const id = params.id as string
  const { data: e, loading } = useApi<Estimate | null>(`/api/estimates/${id}`, null)

  if (loading) {
    return (
      <div>
        <DetailHeader backHref="/estimates" backLabel="Estimates" title="Loading..." />
        <div className="flex items-center justify-center p-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      </div>
    )
  }

  if (!e) {
    return (
      <div>
        <DetailHeader backHref="/estimates" backLabel="Estimates" title="Not Found" />
        <div className="flex flex-col items-center justify-center p-12 text-surface-400">
          <p>The requested estimate was not found.</p>
          <a href="/estimates" className="mt-2 text-brand-600 hover:underline">Back to estimates</a>
        </div>
      </div>
    )
  }

  return (
    <div>
      <DetailHeader backHref={`/estimates/${id}`} backLabel="Back to estimate" title={`${e?.number} Preview`}
        editHref={`/estimates/${id}/edit`}
        actions={<><button onClick={() => window.print()} className="btn-secondary"><Printer className="h-3.5 w-3.5" /> Print</button><button className="btn-secondary"><Download className="h-3.5 w-3.5" /> PDF</button><button className="btn-primary"><Send className="h-3.5 w-3.5" /> Send</button></>}
      />
      <div className="p-8 bg-surface-100 min-h-screen print:bg-white print:p-0">
        {e?.client && <DocumentPreview type="ESTIMATE" number={e?.number || ""} title={e?.title || ""} status={e?.status || ""} client={e.client} items={e?.items || []} subtotal={e?.subtotal || 0} taxRate={e?.taxRate || 0} taxAmount={e?.taxAmount || 0} total={e?.total || 0} issueDate={e?.createdAt || ""} validUntil={e?.validUntil} notes={e?.description} />}
      </div>
    </div>
  )
}
