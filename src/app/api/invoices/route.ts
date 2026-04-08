import { db } from "@/lib/db"
import { invoices, invoiceItems, clients, payments } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import { NextResponse } from "next/server"
import { getDefaultOrgId } from "@/lib/get-org"

export async function GET() {
  try {
    if (!db) return NextResponse.json([])
    const allInvoices = await db.select().from(invoices).orderBy(desc(invoices.createdAt))
    const allItems = await db.select().from(invoiceItems)
    const allClients = await db.select().from(clients)
    const allPayments = await db.select().from(payments)
    const result = allInvoices.map((invoice) => ({
      ...invoice,
      client: allClients.find((c) => c.id === invoice.clientId) ?? null,
      items: allItems.filter((i) => i.invoiceId === invoice.id),
      payments: allPayments.filter((p) => p.invoiceId === invoice.id),
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

    const lineItems: { description: string; hours: number; rate: number; amount: number }[] = body.items || []
    const subtotal = lineItems.reduce((s, i) => s + (i.amount || 0), 0)
    const taxRate = Number(body.taxRate) || 0
    const taxAmount = subtotal * (taxRate / 100)
    const total = subtotal + taxAmount

    const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`

    const [invoice] = await db
      .insert(invoices)
      .values({
        id: crypto.randomUUID(),
        number: invoiceNumber,
        title: body.title,
        description: body.description || null,
        status: body.status || "DRAFT",
        clientId: body.clientId,
        organizationId: body.organizationId || orgId,
        subtotal: String(subtotal),
        taxRate: String(taxRate),
        taxAmount: String(taxAmount),
        total: String(total),
        amountDue: String(total),
        dueDate: body.dueDate ? new Date(body.dueDate) : new Date(),
      })
      .returning()

    if (lineItems.length > 0) {
      await db.insert(invoiceItems).values(
        lineItems.map((item, idx) => ({
          id: crypto.randomUUID(),
          invoiceId: invoice.id,
          description: item.description || "",
          hours: String(item.hours || 0),
          rate: String(item.rate || 65),
          amount: String(item.amount || 0),
          sortOrder: idx,
        }))
      )
    }

    const relatedItems = await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, invoice.id))
    const [client] = await db.select().from(clients).where(eq(clients.id, invoice.clientId))
    const relatedPayments = await db.select().from(payments).where(eq(payments.invoiceId, invoice.id))
    return NextResponse.json(
      { ...invoice, client: client ?? null, items: relatedItems, payments: relatedPayments },
      { status: 201 }
    )
  } catch (err) {
    console.error("Invoice POST error:", err)
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 })
  }
}
