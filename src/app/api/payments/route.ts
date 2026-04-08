import { db } from "@/lib/db"
import { payments, clients, invoices, bankAccounts } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import { NextResponse } from "next/server"
import { getDefaultOrgId } from "@/lib/get-org"

export async function GET() {
  try {
    if (!db) return NextResponse.json([])
    const allPayments = await db.select().from(payments).orderBy(desc(payments.createdAt))
    const allClients = await db.select().from(clients)
    const allInvoices = await db.select().from(invoices)
    const allBankAccounts = await db.select().from(bankAccounts)
    const result = allPayments.map((payment) => ({
      ...payment,
      client: allClients.find((c) => c.id === payment.clientId) ?? null,
      invoice: allInvoices.find((i) => i.id === payment.invoiceId) ?? null,
      bankAccount: allBankAccounts.find((b) => b.id === payment.bankAccountId) ?? null,
    }))
    return NextResponse.json(result)
  } catch {
    return NextResponse.json([])
  }
}

export async function POST(req: Request) {
  try {
    if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    const body = await req.json()
    const orgId = await getDefaultOrgId()
    const [payment] = await db
      .insert(payments)
      .values({
        id: crypto.randomUUID(),
        number: body.number,
        amount: String(body.amount),
        method: body.method,
        status: body.status ?? "PENDING",
        reference: body.reference ?? null,
        notes: body.notes ?? null,
        invoiceId: body.invoiceId ?? null,
        clientId: body.clientId,
        bankAccountId: body.bankAccountId ?? null,
        organizationId: body.organizationId || orgId,
        receivedAt: body.receivedAt ? new Date(body.receivedAt) : new Date(),
      })
      .returning()
    const [client] = await db.select().from(clients).where(eq(clients.id, payment.clientId))
    const invoice = payment.invoiceId
      ? (await db.select().from(invoices).where(eq(invoices.id, payment.invoiceId)))[0] ?? null
      : null
    const bankAccount = payment.bankAccountId
      ? (await db.select().from(bankAccounts).where(eq(bankAccounts.id, payment.bankAccountId)))[0] ?? null
      : null
    return NextResponse.json(
      { ...payment, client: client ?? null, invoice, bankAccount },
      { status: 201 }
    )
  } catch (error) {
    console.error("Failed to create payment:", error)
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 })
  }
}
