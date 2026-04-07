import { db } from "@/lib/db"
import { payments, clients, invoices, bankAccounts } from "@/db/schema"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    if (!db) return NextResponse.json(null)
    const [payment] = await db.select().from(payments).where(eq(payments.id, id))
    if (!payment) return NextResponse.json({ error: "Not found" }, { status: 404 })
    const [client] = await db.select().from(clients).where(eq(clients.id, payment.clientId))
    const invoice = payment.invoiceId
      ? (await db.select().from(invoices).where(eq(invoices.id, payment.invoiceId)))[0] ?? null
      : null
    const bankAccount = payment.bankAccountId
      ? (await db.select().from(bankAccounts).where(eq(bankAccounts.id, payment.bankAccountId)))[0] ?? null
      : null
    return NextResponse.json({ ...payment, client: client ?? null, invoice, bankAccount })
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    const body = await req.json()
    const [updated] = await db
      .update(payments)
      .set({
        ...(body.client !== undefined && { clientId: body.client }),
        ...(body.clientId !== undefined && { clientId: body.clientId }),
        ...(body.invoice !== undefined && { invoiceId: body.invoice }),
        ...(body.invoiceId !== undefined && { invoiceId: body.invoiceId }),
        ...(body.amount !== undefined && { amount: String(body.amount) }),
        ...(body.method !== undefined && { method: body.method }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.date !== undefined && { receivedAt: new Date(body.date) }),
        ...(body.receivedAt !== undefined && { receivedAt: new Date(body.receivedAt) }),
        ...(body.bankAccountId !== undefined && { bankAccountId: body.bankAccountId }),
        ...(body.notes !== undefined && { notes: body.notes }),
      })
      .where(eq(payments.id, id))
      .returning()
    const [client] = await db.select().from(clients).where(eq(clients.id, updated.clientId))
    const invoice = updated.invoiceId
      ? (await db.select().from(invoices).where(eq(invoices.id, updated.invoiceId)))[0] ?? null
      : null
    const bankAccount = updated.bankAccountId
      ? (await db.select().from(bankAccounts).where(eq(bankAccounts.id, updated.bankAccountId)))[0] ?? null
      : null
    return NextResponse.json({ ...updated, client: client ?? null, invoice, bankAccount })
  } catch (err) {
    console.error("Payment PUT error:", err)
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    await db.delete(payments).where(eq(payments.id, id))
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
  }
}
