import { db } from "@/lib/db"
import { invoices, invoiceItems, clients, payments } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import { NextResponse } from "next/server"

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
    const [invoice] = await db
      .insert(invoices)
      .values({ id: crypto.randomUUID(), ...body })
      .returning()
    const relatedItems = await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, invoice.id))
    const [client] = await db.select().from(clients).where(eq(clients.id, invoice.clientId))
    const relatedPayments = await db.select().from(payments).where(eq(payments.invoiceId, invoice.id))
    return NextResponse.json(
      { ...invoice, client: client ?? null, items: relatedItems, payments: relatedPayments },
      { status: 201 }
    )
  } catch {
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 })
  }
}
