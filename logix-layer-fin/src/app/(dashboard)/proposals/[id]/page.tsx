"use client"

/**
 * proposals/[id]/page.tsx
 * WAT:    Proposal detail page met volledig overzicht
 * WAAROM: Bekijk alle details, status, timeline en line items
 */

import { useParams } from "next/navigation"
import { DetailHeader } from "@/components/ui/detail-header"
import { StatusDropdown } from "@/components/ui/status-dropdown"
import { useApi } from "@/hooks/use-api"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Send, Download, Copy, Clock, CheckCircle, User, Mail, Phone, MapPin, FileText, Receipt, Calculator } from "lucide-react"
import type { Proposal } from "@/types"

export default function ProposalDetailPage() {
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
        backHref="/proposals" backLabel="Proposals"
        title={p?.number} subtitle={p?.title}
        editHref={`/proposals/${id}/edit`}
        previewHref={`/proposals/${id}/preview`}
        actions={
          <>
            <button className="btn-secondary"><Download className="h-3.5 w-3.5" /> PDF</button>
            <button className="btn-secondary"><Calculator className="h-3.5 w-3.5" /> To Estimate</button>
            <button className="btn-secondary"><Receipt className="h-3.5 w-3.5" /> To Invoice</button>
            <button className="btn-secondary"><Copy className="h-3.5 w-3.5" /> Duplicate</button>
            <button className="btn-primary"><Send className="h-3.5 w-3.5" /> Send</button>
          </>
        }
      />

      <div className="p-6 space-y-6">
        {/* Status & Meta */}
        <div className="grid grid-cols-4 gap-4">
          <div className="card p-4">
            <p className="text-2xs text-surface-400 mb-1">Total Value</p>
            <p className="text-lg font-bold text-surface-800">{formatCurrency(p?.total || 0)}</p>
          </div>
          <div className="card p-4">
            <p className="text-2xs text-surface-400 mb-1">Created</p>
            <p className="text-xs font-medium text-surface-700">{formatDate(p?.createdAt || "")}</p>
          </div>
          <div className="card p-4">
            <p className="text-2xs text-surface-400 mb-1">Valid Until</p>
            <p className="text-xs font-medium text-surface-700">{formatDate(p?.validUntil || "")}</p>
          </div>
          <div className="card p-4">
            <p className="text-2xs text-surface-400 mb-1">Status</p>
            <StatusDropdown current={p?.status || "DRAFT"} options={["DRAFT", "SENT", "APPROVED", "REJECTED", "EXPIRED"]} onChange={() => {}} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="col-span-2 space-y-4">
            {/* Description */}
            <div className="card p-4">
              <h3 className="text-xs font-semibold text-surface-700 mb-2">Description</h3>
              <p className="text-xs text-surface-500 leading-relaxed">{p?.description}</p>
            </div>

            {/* Line Items */}
            <div className="card">
              <div className="px-4 py-3 border-b border-surface-100">
                <h3 className="text-xs font-semibold text-surface-700">Line Items</h3>
              </div>
              <table className="table-compact">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th className="text-right w-16">Hours</th>
                    <th className="text-right w-20">Rate</th>
                    <th className="text-right w-24">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {p?.items?.map((item) => (
                    <tr key={item.id}>
                      <td className="text-surface-700">{item.description}</td>
                      <td className="text-right text-surface-500">{item.hours}h</td>
                      <td className="text-right text-surface-500">{formatCurrency(item.rate)}</td>
                      <td className="text-right font-medium text-surface-800">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-surface-200">
                    <td colSpan={3} className="text-right font-medium text-surface-600">Subtotal</td>
                    <td className="text-right font-bold text-surface-800">{formatCurrency(p?.subtotal || 0)}</td>
                  </tr>
                  {(p?.taxRate || 0) > 0 && (
                    <tr>
                      <td colSpan={3} className="text-right text-surface-500">Tax ({p?.taxRate}%)</td>
                      <td className="text-right text-surface-700">{formatCurrency(p?.taxAmount || 0)}</td>
                    </tr>
                  )}
                  <tr className="bg-surface-50">
                    <td colSpan={3} className="text-right font-bold text-surface-700">Total</td>
                    <td className="text-right text-lg font-bold text-surface-800">{formatCurrency(p?.total || 0)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Client Info */}
            <div className="card p-4">
              <h3 className="text-xs font-semibold text-surface-700 mb-3">Client</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-surface-400" />
                  <div>
                    <p className="text-xs font-medium text-surface-800">{p?.client?.name}</p>
                    <p className="text-2xs text-surface-400">{p?.client?.company}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-2xs text-surface-500">
                  <Mail className="h-3 w-3 text-surface-400" /> {p?.client?.email}
                </div>
                <div className="flex items-center gap-2 text-2xs text-surface-500">
                  <Phone className="h-3 w-3 text-surface-400" /> {p?.client?.phone}
                </div>
                <div className="flex items-center gap-2 text-2xs text-surface-500">
                  <MapPin className="h-3 w-3 text-surface-400" /> {p?.client?.address}
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="card p-4">
              <h3 className="text-xs font-semibold text-surface-700 mb-3">Timeline</h3>
              <div className="space-y-3">
                {[
                  { icon: Clock, label: "Created", date: p?.createdAt, color: "text-surface-400" },
                  { icon: Send, label: "Sent to client", date: p?.sentAt, color: "text-blue-500" },
                  { icon: CheckCircle, label: "Approved", date: p?.approvedAt, color: "text-emerald-500" },
                ].map((event, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <event.icon className={`h-3.5 w-3.5 mt-0.5 ${event.color}`} />
                    <div>
                      <p className="text-xs text-surface-700">{event.label}</p>
                      <p className="text-2xs text-surface-400">{formatDate(event.date || "")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Last Activity */}
            <div className="card p-4">
              <h3 className="text-xs font-semibold text-surface-700 mb-2">Last Activity</h3>
              <p className="text-2xs text-surface-500">Updated on {formatDate(p?.updatedAt || "")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
