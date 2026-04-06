"use client"

import { useParams } from "next/navigation"
import { DetailHeader } from "@/components/ui/detail-header"
import { StatusDropdown } from "@/components/ui/status-dropdown"
import { useApi } from "@/hooks/use-api"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ArrowRightLeft, Download, Send, User, Mail, Phone, MapPin } from "lucide-react"
import type { Estimate } from "@/types"

export default function EstimateDetailPage() {
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

      <DetailHeader
        backHref="/estimates" backLabel="Estimates"
        title={e?.number} subtitle={e?.title}
        editHref={`/estimates/${id}/edit`}
        previewHref={`/estimates/${id}/preview`}
        actions={
          <>
            <button className="btn-secondary"><Download className="h-3.5 w-3.5" /> PDF</button>
            <button className="btn-secondary"><Send className="h-3.5 w-3.5" /> Send</button>
            <button className="btn-primary"><ArrowRightLeft className="h-3.5 w-3.5" /> To Invoice</button>
          </>
        }
      />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <div className="card p-4">
            <p className="text-2xs text-surface-400 mb-1">Total Value</p>
            <p className="text-lg font-bold text-surface-800">{formatCurrency(e?.total || 0)}</p>
          </div>
          <div className="card p-4">
            <p className="text-2xs text-surface-400 mb-1">Created</p>
            <p className="text-xs font-medium text-surface-700">{formatDate(e?.createdAt || "")}</p>
          </div>
          <div className="card p-4">
            <p className="text-2xs text-surface-400 mb-1">Total Hours</p>
            <p className="text-lg font-bold text-surface-800">{e?.items?.reduce((s, i) => s + i.hours, 0) || 0}h</p>
          </div>
          <div className="card p-4">
            <p className="text-2xs text-surface-400 mb-1">Status</p>
            <StatusDropdown current={e?.status || "DRAFT"} options={["DRAFT", "SENT", "ACCEPTED", "REJECTED", "CONVERTED"]} onChange={() => {}} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            <div className="card p-4">
              <h3 className="text-xs font-semibold text-surface-700 mb-2">Description</h3>
              <p className="text-xs text-surface-500 leading-relaxed">{e?.description}</p>
            </div>

            <div className="card">
              <div className="px-4 py-3 border-b border-surface-100">
                <h3 className="text-xs font-semibold text-surface-700">Line Items</h3>
              </div>
              <table className="table-compact">
                <thead><tr><th>Description</th><th className="text-right w-16">Hours</th><th className="text-right w-20">Rate</th><th className="text-right w-24">Amount</th></tr></thead>
                <tbody>
                  {e?.items?.map((item) => (
                    <tr key={item.id}>
                      <td className="text-surface-700">{item.description}</td>
                      <td className="text-right text-surface-500">{item.hours}h</td>
                      <td className="text-right text-surface-500">{formatCurrency(item.rate)}</td>
                      <td className="text-right font-medium text-surface-800">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-surface-50">
                    <td colSpan={3} className="text-right font-bold text-surface-700">Total</td>
                    <td className="text-right text-lg font-bold text-surface-800">{formatCurrency(e?.total || 0)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {e?.description && <div className="card p-4"><h3 className="text-xs font-semibold text-surface-700 mb-2">Notes</h3><p className="text-xs text-surface-500">{e?.description}</p></div>}
          </div>

          <div className="space-y-4">
            <div className="card p-4">
              <h3 className="text-xs font-semibold text-surface-700 mb-3">Client</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2"><User className="h-3.5 w-3.5 text-surface-400" /><div><p className="text-xs font-medium text-surface-800">{e?.client?.name}</p><p className="text-2xs text-surface-400">{e?.client?.company}</p></div></div>
                <div className="flex items-center gap-2 text-2xs text-surface-500"><Mail className="h-3 w-3 text-surface-400" /> {e?.client?.email}</div>
                <div className="flex items-center gap-2 text-2xs text-surface-500"><Phone className="h-3 w-3 text-surface-400" /> {e?.client?.phone}</div>
                <div className="flex items-center gap-2 text-2xs text-surface-500"><MapPin className="h-3 w-3 text-surface-400" /> {e?.client?.address}</div>
              </div>
            </div>

            <div className="card p-4">
              <h3 className="text-xs font-semibold text-surface-700 mb-2">Valid Until</h3>
              <p className="text-2xs text-surface-500">{formatDate(e?.validUntil || "")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
