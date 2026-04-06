"use client"

import { useParams } from "next/navigation"
import { DetailHeader } from "@/components/ui/detail-header"
import { DocumentPreview } from "@/components/ui/document-preview"
import { useApi } from "@/hooks/use-api"
import { Download, Printer, Send } from "lucide-react"
import type { Invoice } from "@/types"

export default function InvoicePreviewPage() {
  const params = useParams()
  const id = params.id as string
  const { data: inv, loading } = useApi<Invoice | null>(`/api/invoices/${id}`, null)

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

  if (!inv) {
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

  return (
    <div>
      <DetailHeader backHref={`/invoices/${id}`} backLabel="Back to invoice" title={`${inv?.number} Preview`}
        editHref={`/invoices/${id}/edit`}
        actions={<><button onClick={() => window.print()} className="btn-secondary"><Printer className="h-3.5 w-3.5" /> Print</button><button className="btn-secondary"><Download className="h-3.5 w-3.5" /> PDF</button><button className="btn-primary"><Send className="h-3.5 w-3.5" /> Send</button></>}
      />
      <div className="p-8 bg-surface-100 min-h-screen print:bg-white print:p-0">
        {inv?.client && <DocumentPreview
          type="INVOICE"
          number={inv?.number || ""}
          title={inv?.title || ""}
          status={inv?.status || ""}
          client={inv.client}
          items={inv?.items || []}
          subtotal={inv?.subtotal || 0}
          taxRate={inv?.taxRate || 0}
          taxAmount={inv?.taxAmount || 0}
          total={inv?.total || 0}
          issueDate={inv?.issueDate || ""}
          dueDate={inv?.dueDate}
          notes={inv?.description}
          terms="A setup fee of 75% of the total project cost is required to start the project."
          amountPaid={inv?.amountPaid}
          amountDue={inv?.amountDue}
          payments={inv?.payments?.map(p => ({
            id: p.id,
            number: p.number,
            amount: p.amount,
            method: p.method,
            date: p.receivedAt,
            status: p.status
          }))}
        />}
      </div>
    </div>
  )
}
