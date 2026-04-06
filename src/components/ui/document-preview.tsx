"use client"

/**
 * document-preview.tsx
 * WAT:    Professional PDF-style document preview voor proposals, estimates, invoices
 * WAAROM: Client-ready preview die je kunt printen of exporteren als PDF
 */

import { formatCurrency, formatDate } from "@/lib/utils"

interface DocLineItem {
  description: string
  hours: number
  rate: number
  amount: number
}

interface PaymentRecord {
  id: string
  number: string
  amount: number
  method: string
  date: string
  status: string
}

interface DocumentPreviewProps {
  type: "PROPOSAL" | "ESTIMATE" | "INVOICE"
  number: string
  title: string
  status: string
  client: { name: string; company?: string; email: string; address?: string; phone?: string }
  items: DocLineItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  issueDate: string
  dueDate?: string
  validUntil?: string
  notes?: string
  terms?: string
  amountPaid?: number
  amountDue?: number
  payments?: PaymentRecord[]
  purchaseOrder?: string
  shipping?: number
}

export function DocumentPreview(props: DocumentPreviewProps) {
  const typeLabels = { PROPOSAL: "Proposal", ESTIMATE: "Estimate", INVOICE: "Invoice" }
  const label = typeLabels[props.type]
  const isPaid = props.status === "PAID"
  const isOverdue = props.status === "OVERDUE"

  return (
    <div className="mx-auto max-w-[760px] bg-white shadow-lg print:shadow-none print:max-w-none">
      {/* Top accent bar */}
      <div className="h-1.5 bg-gradient-to-r from-[#3B2D8E] to-[#6DC944]" />

      {/* Header section */}
      <div className="px-10 pt-8 pb-6">
        <div className="flex items-start justify-between">
          {/* Document type + number */}
          <div>
            <h1 className="text-3xl font-bold text-[#3B2D8E] tracking-tight">{label}</h1>
            {isPaid && (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-semibold text-emerald-700">PAID</span>
              </div>
            )}
            {isOverdue && (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200 px-3 py-1">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <span className="text-xs font-semibold text-red-700">OVERDUE</span>
              </div>
            )}
            {props.status === "PARTIAL" && (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1">
                <div className="h-2 w-2 rounded-full bg-amber-500" />
                <span className="text-xs font-semibold text-amber-700">PARTIALLY PAID</span>
              </div>
            )}
          </div>

          {/* Logo */}
          <div className="text-right">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="Logix Layer" className="h-10 ml-auto mb-1" />
          </div>
        </div>

        {/* Meta info row */}
        <div className="mt-6 grid grid-cols-3 gap-6 border-t border-b border-surface-200 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-surface-400 mb-1">{label.toUpperCase()} NUMBER</p>
            <p className="text-sm font-mono font-semibold text-surface-800">{props.number}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-surface-400 mb-1">DATE OF ISSUE</p>
            <p className="text-sm font-semibold text-surface-800">{formatDate(props.issueDate)}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-surface-400 mb-1">
              {props.dueDate ? "DUE DATE" : props.validUntil ? "VALID UNTIL" : "DATE"}
            </p>
            <p className="text-sm font-semibold text-surface-800">
              {formatDate(props.dueDate || props.validUntil || props.issueDate)}
            </p>
          </div>
        </div>
      </div>

      {/* From / To section */}
      <div className="px-10 pb-6">
        <div className="grid grid-cols-2 gap-10">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-surface-400 mb-2">BILLED TO</p>
            <p className="text-sm font-semibold text-surface-800">{props.client.company || props.client.name}</p>
            <p className="text-xs text-surface-600 mt-0.5">{props.client.name}</p>
            {props.client.address && <p className="text-xs text-surface-500 mt-0.5">{props.client.address}</p>}
            <p className="text-xs text-surface-500 mt-0.5">{props.client.email}</p>
            {props.client.phone && <p className="text-xs text-surface-500 mt-0.5">{props.client.phone}</p>}
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-surface-400 mb-2">FROM</p>
            <p className="text-sm font-semibold text-surface-800">Logix Layer N.V.</p>
            <p className="text-xs text-surface-500 mt-0.5">Dr. Sophie Redmonstraat 244</p>
            <p className="text-xs text-surface-500">Paramaribo</p>
            <p className="text-xs text-surface-500">421544</p>
            <p className="text-xs text-surface-500">info@logixlayer.com</p>
          </div>
        </div>

        {props.purchaseOrder && (
          <div className="mt-4 bg-surface-50 rounded-md px-4 py-2 inline-block">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-surface-400 mr-2">PURCHASE ORDER</span>
            <span className="text-xs font-mono font-semibold text-surface-700">{props.purchaseOrder}</span>
          </div>
        )}
      </div>

      {/* Project / Title */}
      {props.title && (
        <div className="px-10 pb-4">
          <div className="bg-[#3B2D8E]/5 border-l-4 border-[#3B2D8E] rounded-r-md px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#3B2D8E]/60 mb-0.5">PROJECT</p>
            <p className="text-sm font-semibold text-[#3B2D8E]">{props.title}</p>
          </div>
        </div>
      )}

      {/* Line Items Table */}
      <div className="px-10 pb-2">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-[#3B2D8E]">
              <th className="py-3 text-left text-[10px] font-bold uppercase tracking-widest text-[#3B2D8E]">Description</th>
              <th className="py-3 text-right text-[10px] font-bold uppercase tracking-widest text-[#3B2D8E] w-20">Unit cost</th>
              <th className="py-3 text-right text-[10px] font-bold uppercase tracking-widest text-[#3B2D8E] w-16">QTY</th>
              <th className="py-3 text-right text-[10px] font-bold uppercase tracking-widest text-[#3B2D8E] w-24">Amount</th>
            </tr>
          </thead>
          <tbody>
            {props.items.map((item, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? "bg-surface-50/50" : ""}>
                <td className="py-3 px-2 text-xs text-surface-700">{item.description}</td>
                <td className="py-3 px-2 text-right text-xs text-surface-600 font-mono">{formatCurrency(item.rate)}</td>
                <td className="py-3 px-2 text-right text-xs text-surface-600 font-mono">{item.hours}</td>
                <td className="py-3 px-2 text-right text-xs font-semibold text-surface-800 font-mono">{formatCurrency(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals + Terms side by side */}
      <div className="px-10 py-6">
        <div className="flex gap-10">
          {/* Terms (left side) */}
          <div className="flex-1">
            {(props.terms || props.notes) && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#3B2D8E] mb-2">
                  {props.terms ? "TERMS" : "NOTES"}
                </p>
                <p className="text-xs text-surface-500 leading-relaxed max-w-sm">
                  {props.terms || props.notes}
                </p>
              </div>
            )}
          </div>

          {/* Totals (right side) */}
          <div className="w-64">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-surface-500 uppercase tracking-wider text-[10px] font-semibold">Subtotal</span>
                <span className="font-mono font-semibold text-surface-700">{formatCurrency(props.subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-surface-500 uppercase tracking-wider text-[10px] font-semibold">(TAX RATE)</span>
                <span className="font-mono text-surface-600">{props.taxRate}%</span>
              </div>
              {props.taxAmount > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-surface-500 uppercase tracking-wider text-[10px] font-semibold">TAX</span>
                  <span className="font-mono text-surface-600">{formatCurrency(props.taxAmount)}</span>
                </div>
              )}
              {props.shipping !== undefined && (
                <div className="flex justify-between text-xs">
                  <span className="text-surface-500 uppercase tracking-wider text-[10px] font-semibold">SHIPPING</span>
                  <span className="font-mono text-surface-600">{formatCurrency(props.shipping)}</span>
                </div>
              )}

              {/* Divider */}
              <div className="border-t-2 border-[#3B2D8E] pt-3 mt-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#3B2D8E]">{label.toUpperCase()} TOTAL</span>
                  <span className="text-xl font-bold text-[#3B2D8E] font-mono">US{formatCurrency(props.total)}</span>
                </div>
              </div>

              {/* Payment tracking for invoices */}
              {props.amountPaid !== undefined && props.amountPaid > 0 && (
                <div className="mt-4 space-y-2 bg-surface-50 rounded-lg p-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-emerald-600 font-semibold">Amount Paid</span>
                    <span className="font-mono font-semibold text-emerald-600">-{formatCurrency(props.amountPaid)}</span>
                  </div>
                  {/* Payment progress bar */}
                  <div className="w-full bg-surface-200 rounded-full h-1.5">
                    <div
                      className="bg-emerald-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${Math.min((props.amountPaid / props.total) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs pt-1 border-t border-surface-200">
                    <span className="font-bold text-amber-600">Balance Due</span>
                    <span className="font-mono font-bold text-amber-600">{formatCurrency(props.amountDue || 0)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment History (if available) */}
      {props.payments && props.payments.length > 0 && (
        <div className="px-10 pb-6">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-surface-400 mb-2">PAYMENT HISTORY</p>
          <div className="border border-surface-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-50">
                  <th className="py-2 px-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-500">Reference</th>
                  <th className="py-2 px-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-500">Method</th>
                  <th className="py-2 px-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-500">Date</th>
                  <th className="py-2 px-3 text-right text-[10px] font-semibold uppercase tracking-wider text-surface-500">Amount</th>
                </tr>
              </thead>
              <tbody>
                {props.payments.map((payment) => (
                  <tr key={payment.id} className="border-t border-surface-100">
                    <td className="py-2 px-3 text-xs font-mono text-surface-700">{payment.number}</td>
                    <td className="py-2 px-3 text-xs text-surface-600">{payment.method.replace("_", " ")}</td>
                    <td className="py-2 px-3 text-xs text-surface-600">{formatDate(payment.date)}</td>
                    <td className="py-2 px-3 text-xs text-right font-semibold text-emerald-600">{formatCurrency(payment.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-surface-200 bg-surface-50/50">
        <div className="px-10 py-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-widest">Logix Layer N.V.</p>
            <p className="text-[10px] text-surface-400 mt-0.5">Dr. Sophie Redmonstraat 244, Paramaribo · 421544 · info@logixlayer.com</p>
          </div>
          <p className="text-[10px] text-surface-400">https://logixlayer.com</p>
        </div>
      </div>

      {/* Bottom accent bar */}
      <div className="h-1 bg-gradient-to-r from-[#3B2D8E] to-[#6DC944]" />
    </div>
  )
}
