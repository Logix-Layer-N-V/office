import { db } from "@/lib/db"
import { estimates, estimateItems, clients } from "@/db/schema"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    if (!db) return NextResponse.json(null)
    const [estimate] = await db.select().from(estimates).where(eq(estimates.id, id))
    if (!estimate) return NextResponse.json({ error: "Not found" }, { status: 404 })
    const relatedItems = await db.select().from(estimateItems).where(eq(estimateItems.estimateId, id))
    const [client] = await db.select().from(clients).where(eq(clients.id, estimate.clientId))
    return NextResponse.json({ ...estimate, client: client ?? null, items: relatedItems })
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    const body = await req.json()
    const { items, client: _client, ...estimateData } = body

    // Update estimate (only valid columns)
    const [updated] = await db
      .update(estimates)
      .set({
        ...(estimateData.title !== undefined && { title: estimateData.title }),
        ...(estimateData.description !== undefined && { description: estimateData.description }),
        ...(estimateData.clientId !== undefined && { clientId: estimateData.clientId }),
        ...(estimateData.status !== undefined && { status: estimateData.status }),
        ...(estimateData.validUntil !== undefined && { validUntil: estimateData.validUntil ? new Date(estimateData.validUntil) : null }),
        updatedAt: new Date(),
      })
      .where(eq(estimates.id, id))
      .returning()

    // Update line items if provided
    if (items && Array.isArray(items)) {
      await db.delete(estimateItems).where(eq(estimateItems.estimateId, id))
      let subtotal = 0
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const amount = (parseFloat(String(item.hours)) || 0) * (parseFloat(String(item.rate)) || 0)
        subtotal += amount
        await db.insert(estimateItems).values({
          id: item.id || `${id}-item-${i}`,
          estimateId: id,
          description: item.description || "",
          hours: String(parseFloat(String(item.hours)) || 0),
          rate: String(parseFloat(String(item.rate)) || 0),
          amount: String(amount),
          sortOrder: i,
        })
      }
      const taxAmount = subtotal * (parseFloat(String(updated.taxRate)) || 0) / 100
      await db.update(estimates).set({
        subtotal: String(subtotal),
        taxAmount: String(taxAmount),
        total: String(subtotal + taxAmount),
      }).where(eq(estimates.id, id))
    }

    const finalItems = await db.select().from(estimateItems).where(eq(estimateItems.estimateId, id))
    const [clientData] = await db.select().from(clients).where(eq(clients.id, updated.clientId))
    return NextResponse.json({ ...updated, client: clientData ?? null, items: finalItems })
  } catch (err) {
    console.error("Estimate PUT error:", err)
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    await db.delete(estimates).where(eq(estimates.id, id))
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
  }
}
