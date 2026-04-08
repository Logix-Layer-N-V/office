import { db } from "@/lib/db"
import { estimates, estimateItems, clients } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    if (!db) return NextResponse.json([])
    const allEstimates = await db.select().from(estimates).orderBy(desc(estimates.createdAt))
    const allItems = await db.select().from(estimateItems)
    const allClients = await db.select().from(clients)
    const result = allEstimates.map((estimate) => ({
      ...estimate,
      client: allClients.find((c) => c.id === estimate.clientId) ?? null,
      items: allItems.filter((i) => i.estimateId === estimate.id),
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

    const lineItems: { description: string; hours: number; rate: number; amount: number }[] = body.items || []
    const subtotal = lineItems.reduce((s, i) => s + (i.amount || 0), 0)
    const taxRate = Number(body.taxRate) || 0
    const taxAmount = subtotal * (taxRate / 100)
    const total = subtotal + taxAmount

    const estimateNumber = `EST-${Date.now().toString(36).toUpperCase()}`

    const [estimate] = await db
      .insert(estimates)
      .values({
        id: crypto.randomUUID(),
        number: estimateNumber,
        title: body.title,
        description: body.description || null,
        status: body.status || "DRAFT",
        clientId: body.clientId,
        organizationId: body.organizationId || "org_default",
        subtotal: String(subtotal),
        taxRate: String(taxRate),
        taxAmount: String(taxAmount),
        total: String(total),
        validUntil: body.validUntil ? new Date(body.validUntil) : null,
      })
      .returning()

    if (lineItems.length > 0) {
      await db.insert(estimateItems).values(
        lineItems.map((item, idx) => ({
          id: crypto.randomUUID(),
          estimateId: estimate.id,
          description: item.description || "",
          hours: String(item.hours || 0),
          rate: String(item.rate || 65),
          amount: String(item.amount || 0),
          sortOrder: idx,
        }))
      )
    }

    const relatedItems = await db
      .select()
      .from(estimateItems)
      .where(eq(estimateItems.estimateId, estimate.id))
    const [client] = await db.select().from(clients).where(eq(clients.id, estimate.clientId))
    return NextResponse.json({ ...estimate, client: client ?? null, items: relatedItems }, { status: 201 })
  } catch (err) {
    console.error("Estimate POST error:", err)
    return NextResponse.json({ error: "Failed to create estimate" }, { status: 500 })
  }
}
