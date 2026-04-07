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
    const { items, client: _client, payments: _payments, ...invoiceData } = body

    const [updated] = await db
      .update(invoices)
      .set({
        ...(invoiceData.title !== undefined && { title: invoiceData.title }),
        ...(invoiceData.description !== undefined && { description: invoiceData.description }),
        ...(invoiceData.clientId !== undefined && { clientId: invoiceData.clientId }),
        ...(invoiceData.status !== undefined && { status: invoiceData.status }),
        ...(invoiceData.dueDate !== undefined && { dueDate: invoiceData.dueDate ? new Date(invoiceData.dueDate) : null }),
        ...(invoiceData.purchaseOrder !== undefined && { purchaseOrder: invoiceData.purchaseOrder }),
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, id))
      .returning()

    if (items && Array.isArray(items)) {
      await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, id))
      let subtotal = 0
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const amount = (parseFloat(String(item.hours || item.quantity)) || 0) * (parseFloat(String(item.rate)) || 0)
        subtotal += amount
        await db.insert(invoiceItems).values({
          id: item.id || `${id}-item-${i}`,
          invoiceId: id,
          description: item.description || "",
          hours: parseFloat(String(item.hours || item.quantity)) || 0,
          rate: parseFloat(String(item.rate)) || 0,
          amount,
          sortOrder: i,
        })
      }
      const taxAmount = subtotal * (parseFloat(String(updated.taxRate)) || 0) / 100
      const total = subtotal + taxAmount
      await db.update(invoices).set({
        subtotal: String(subtotal),
        taxAmount: String(taxAmount),
        total: String(total),
        amountDue: String(total - (parseFloat(String(updated.amountPaid)) || 0)),
      }).where(eq(invoices.id, id))
    }

    const finalItems = await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, id))
    const [clientData] = await db.select().from(clients).where(eq(clients.id, updated.clientId))
    const relatedPayments = await db.select().from(payments).where(eq(payments.invoiceId, id))
    return NextResponse.json({ ...updated, client: clientData ?? null, items: finalItems, payments: relatedPayments })
  } catch (err) {
    console.error("Invoice PUT error:", err)
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
