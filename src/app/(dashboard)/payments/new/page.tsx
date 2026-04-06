"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/dashboard/header"
import { useApi, apiMutate } from "@/hooks/use-api"
import type { Client, Invoice, Payment, BankAccount } from "@/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ArrowLeft } from "lucide-react"
import { ClientSelect } from "@/components/ui/client-select"

export default function NewPaymentPage() {
  const router = useRouter()
  const { data: clients, refresh: refreshClients } = useApi<Client[]>("/api/clients", [])
  const { data: invoices } = useApi<Invoice[]>("/api/invoices", [])
  const { data: bankAccounts } = useApi<BankAccount[]>("/api/bank-accounts", [])

  const [clientId, setClientId] = useState("")
  const [invoiceId, setInvoiceId] = useState("")
  const [amount, setAmount] = useState(0)
  const [method, setMethod] = useState<"BANK_TRANSFER" | "CASH" | "CREDIT_CARD" | "PAYPAL" | "CRYPTO" | "CHECK" | "OTHER">("BANK_TRANSFER")
  const [depositAccount, setDepositAccount] = useState("")
  const [receivedAt, setReceivedAt] = useState("")
  const [reference, setReference] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Filter invoices by selected client
  const filteredInvoices = useMemo(() => {
    if (!clientId) return []
    return invoices.filter((inv) => inv.clientId === clientId && inv.amountDue > 0)
  }, [clientId, invoices])

  const selectedInvoice = invoices.find((inv) => inv.id === invoiceId)

  const handleSavePayment = async () => {
    try {
      setError("")
      setLoading(true)

      if (!clientId || !invoiceId || !amount || !depositAccount || !receivedAt) {
        setError("Client, Invoice, Amount, Deposit Account, and Date are required")
        return
      }

      const paymentData = {
        clientId,
        invoiceId,
        amount: Number(amount),
        method,
        bankAccountId: depositAccount,
        reference: reference || undefined,
        notes: notes || undefined,
        receivedAt,
        status: "COMPLETED",
      }

      await apiMutate<Payment>("/api/payments", "POST", paymentData)
      router.push("/payments")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record payment")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-surface-50">
      <Header
        title="Record Payment"
        action={{
          label: "Back",
          onClick: () => router.back(),
        }}
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto">
          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form className="space-y-6">
            {/* Client & Invoice Row */}
            <div className="grid grid-cols-2 gap-4">
              <ClientSelect
                clients={clients}
                value={clientId}
                onChange={(id) => {
                  setClientId(id)
                  setInvoiceId("") // Reset invoice when client changes
                }}
                onClientCreated={() => refreshClients()}
                required
              />
              <div>
                <label className="label">Invoice</label>
                <select
                  value={invoiceId}
                  onChange={(e) => setInvoiceId(e.target.value)}
                  className="input w-full"
                  required
                  disabled={!clientId}
                >
                  <option value="">Select invoice...</option>
                  {filteredInvoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.number} — {formatCurrency(inv.amountDue)} due
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selected Invoice Info */}
            {selectedInvoice && (
              <div className="p-3 rounded-md bg-blue-50 border border-blue-200 text-sm">
                <p>
                  <span className="text-surface-600">Invoice:</span>{" "}
                  <span className="font-medium">{selectedInvoice.number}</span>
                </p>
                <p>
                  <span className="text-surface-600">Title:</span>{" "}
                  <span className="font-medium">{selectedInvoice.title}</span>
                </p>
                <p>
                  <span className="text-surface-600">Amount Due:</span>{" "}
                  <span className="font-medium text-amber-600">
                    {formatCurrency(selectedInvoice.amountDue)}
                  </span>
                </p>
              </div>
            )}

            {/* Amount & Method Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Amount (USD)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="input w-full"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="label">Payment Method</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as typeof method)}
                  className="input w-full"
                  required
                >
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CASH">Cash</option>
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="PAYPAL">PayPal</option>
                  <option value="CRYPTO">Crypto</option>
                  <option value="CHECK">Check</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            {/* Deposit Account & Date Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Deposit Account</label>
                <select
                  value={depositAccount}
                  onChange={(e) => setDepositAccount(e.target.value)}
                  className="input w-full"
                  required
                >
                  <option value="">Select account...</option>
                  {bankAccounts.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({formatCurrency(b.balance)})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Received Date</label>
                <input
                  type="date"
                  value={receivedAt}
                  onChange={(e) => setReceivedAt(e.target.value)}
                  className="input w-full"
                  required
                />
              </div>
            </div>

            {/* Reference & Notes Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Reference</label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="input w-full"
                  placeholder="Transaction reference / Check number"
                />
              </div>
              <div>
                <label className="label">Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input w-full"
                  placeholder="Additional notes..."
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center border-t border-surface-200 pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn-secondary flex items-center gap-2"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePayment}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? "Recording..." : "Record Payment"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
