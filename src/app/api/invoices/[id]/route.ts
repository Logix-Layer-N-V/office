import { db } from "@/lib/db"
import { invoices, invoiceItems, clients, payments } from "@/db/schema"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    if (!db) return NextResponse.json(null)
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id))
    if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 })
    const relatedItems = await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, id))
    const [client] = await db.select().from(clients).where(eq(clients.id, invoice.clientId))
    const relatedPayments = await db.select().from(payments).where(eq(payments.invoiceId, id))
    return NextResponse.json({ ...invoice, client: client ?? null, items: relatedItems, payments: relatedPayments })
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
      .update(invoices)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(invoices.id, id))
      .returning()
    const relatedItems = await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, id))
    const [client] = await db.select().from(clients).where(eq(clients.id, updated.clientId))
    const relatedPayments = await db.select().from(payments).where(eq(payments.invoiceId, id))
    return NextResponse.json({ ...updated, client: client ?? null, items: relatedItems, payments: relatedPayments })
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    await db.delete(invoices).where(eq(invoices.id, id))
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
  }
}
