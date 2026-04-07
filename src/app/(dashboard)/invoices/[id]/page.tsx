"use client"

import { useParams } from "next/navigation"
import { DetailHeader } from "@/components/ui/detail-header"
import { StatusDropdown } from "@/components/ui/status-dropdown"
import { useApi } from "@/hooks/use-api"
import { formatCurrency, formatDate, getStatusColor, calcPercentage } from "@/lib/utils"
import { Download, Send, CreditCard, User, Mail, Phone, MapPin, ArrowUpRight } from "lucide-react"
import type { Invoice } from "@/types"

export default function InvoiceDetailPage() {
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

  const paidPercent = calcPercentage(inv.amountPaid, inv.total)

  return (
    <div>

      <DetailHeader
        backHref="/invoices" backLabel="Invoices"
        title={inv?.number} subtitle={inv?.title}
        editHref={`/invoices/${id}/edit`}
        previewHref={`/invoices/${id}/preview`}
        actions={
          <>
            <button className="btn-secondary"><Download className="h-3.5 w-3.5" /> PDF</button>
            <button className="btn-secondary"><Send className="h-3.5 w-3.5" /> Send</button>
            <button className="btn-primary"><CreditCard className="h-3.5 w-3.5" /> Record Payment</button>
          </>
        }
      />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="card p-4">
            <p className="text-2xs text-surface-400 mb-1">Total</p>
            <p className="text-lg font-bold text-surface-800">{formatCurrency(inv?.total || 0)}</p>
          </div>
          <div className="card p-4">
            <p className="text-2xs text-surface-400 mb-1">Paid</p>
            <p className="text-lg font-bold text-emerald-600">{formatCurrency(inv?.amountPaid || 0)}</p>
          </div>
          <div className="card p-4">
            <p className="text-2xs text-surface-400 mb-1">Amount Due</p>
            <p className="text-lg font-bold text-amber-600">{formatCurrency(inv?.amountDue || 0)}</p>
          </div>
          <div className="card p-4">
            <p className="text-2xs text-surface-400 mb-1">Due Date</p>
            <p className="text-xs font-medium text-surface-700">{formatDate(inv?.dueDate || "")}</p>
          </div>
          <div className="card p-4">
            <p className="text-2xs text-surface-400 mb-1">Status</p>
            <StatusDropdown current={inv?.status || "DRAFT"} options={["DRAFT", "SENT", "VIEWED", "PARTIAL", "PAID", "OVERDUE", "CANCELLED"]} onChange={() => {}} />
          </div>
        </div>

        {/* Payment progress bar */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-surface-700">Payment Progress</span>
            <span className="text-xs font-bold text-surface-800">{paidPercent}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-surface-100">
            <div className="h-2 rounded-full bg-emerald-500 transition-all" style={{ width: `${paidPercent}%` }} />
          </div>
          <div className="flex justify-between mt-1 text-2xs text-surface-400">
            <span>Paid: {formatCurrency(inv?.amountPaid || 0)}</span>
            <span>Remaining: {formatCurrency(inv?.amountDue || 0)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            <div className="card p-4">
              <h3 className="text-xs font-semibold text-surface-700 mb-2">Description</h3>
              <p className="text-xs text-surface-500 leading-relaxed">{inv?.description}</p>
            </div>

            <div className="card">
              <div className="px-4 py-3 border-b border-surface-100"><h3 className="text-xs font-semibold text-surface-700">Line Items</h3></div>
              <div className="overflow-x-auto">
                <table className="table-compact">
                  <thead><tr><th>Description</th><th className="text-right w-16">Hours</th><th className="text-right w-20">Rate</th><th className="text-right w-24">Amount</th></tr></thead>
                  <tbody>
                    {inv?.items?.map((item) => (
                      <tr key={item.id}><td className="text-surface-700">{item.description}</td><td className="text-right text-surface-500">{item.hours}h</td><td className="text-right text-surface-500">{formatCurrency(item.rate)}</td><td className="text-right font-medium text-surface-800">{formatCurrency(item.amount)}</td></tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-surface-200"><td colSpan={3} className="text-right font-medium text-surface-600">Subtotal</td><td className="text-right font-bold">{formatCurrency(inv?.subtotal || 0)}</td></tr>
                    <tr><td colSpan={3} className="text-right font-bold text-surface-700">Total</td><td className="text-right text-lg font-bold text-surface-800">{formatCurrency(inv?.total || 0)}</td></tr>
                    <tr><td colSpan={3} className="text-right text-emerald-600">Paid</td><td className="text-right font-medium text-emerald-600">-{formatCurrency(inv?.amountPaid || 0)}</td></tr>
                    <tr className="bg-amber-50"><td colSpan={3} className="text-right font-bold text-amber-700">Amount Due</td><td className="text-right text-lg font-bold text-amber-700">{formatCurrency(inv?.amountDue || 0)}</td></tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Payment History */}
            <div className="card">
              <div className="px-4 py-3 border-b border-surface-100"><h3 className="text-xs font-semibold text-surface-700">Payment History</h3></div>
              {inv?.payments?.map((pay) => (
                <div key={pay.id} className="flex items-center justify-between px-4 py-3 border-b border-surface-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-emerald-50 p-1"><ArrowUpRight className="h-3 w-3 text-emerald-600" /></div>
                    <div>
                      <p className="text-xs font-medium text-surface-700">{pay.number}</p>
                      <p className="text-2xs text-surface-400">{pay.method.replace("_", " ")} · {formatDate(pay.receivedAt)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-emerald-600">+{formatCurrency(pay.amount)}</p>
                    <span className={getStatusColor(pay.status)}>{pay.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="card p-4">
              <h3 className="text-xs font-semibold text-surface-700 mb-3">Client</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2"><User className="h-3.5 w-3.5 text-surface-400" /><div><p className="text-xs font-medium text-surface-800">{inv?.client?.name}</p><p className="text-2xs text-surface-400">{inv?.client?.company}</p></div></div>
                <div className="flex items-center gap-2 text-2xs text-surface-500"><Mail className="h-3 w-3 text-surface-400" /> {inv?.client?.email}</div>
                <div className="flex items-center gap-2 text-2xs text-surface-500"><Phone className="h-3 w-3 text-surface-400" /> {inv?.client?.phone}</div>
                <div className="flex items-center gap-2 text-2xs text-surface-500"><MapPin className="h-3 w-3 text-surface-400" /> {inv?.client?.address}</div>
              </div>
            </div>

            <div className="card p-4">
              <h3 className="text-xs font-semibold text-surface-700 mb-2">Due Date</h3>
              <p className="text-xs font-medium text-surface-700">{formatDate(inv?.dueDate || "")}</p>
              <p className="text-2xs text-surface-400 mt-1">Issued {formatDate(inv?.issueDate || "")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
