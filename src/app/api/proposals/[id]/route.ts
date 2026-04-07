import { db } from "@/lib/db"
import { proposals, proposalItems, clients } from "@/db/schema"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    if (!db) return NextResponse.json(null)
    const [proposal] = await db.select().from(proposals).where(eq(proposals.id, id))
    if (!proposal) return NextResponse.json({ error: "Not found" }, { status: 404 })
    const relatedItems = await db.select().from(proposalItems).where(eq(proposalItems.proposalId, id))
    const [client] = await db.select().from(clients).where(eq(clients.id, proposal.clientId))
    return NextResponse.json({ ...proposal, client: client ?? null, items: relatedItems })
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    const body = await req.json()
    const { items, client: _client, ...proposalData } = body

    const [updated] = await db
      .update(proposals)
      .set({
        ...(proposalData.title !== undefined && { title: proposalData.title }),
        ...(proposalData.description !== undefined && { description: proposalData.description }),
        ...(proposalData.clientId !== undefined && { clientId: proposalData.clientId }),
        ...(proposalData.status !== undefined && { status: proposalData.status }),
        ...(proposalData.validUntil !== undefined && { validUntil: proposalData.validUntil ? new Date(proposalData.validUntil) : null }),
        updatedAt: new Date(),
      })
      .where(eq(proposals.id, id))
      .returning()

    if (items && Array.isArray(items)) {
      await db.delete(proposalItems).where(eq(proposalItems.proposalId, id))
      let subtotal = 0
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const amount = (parseFloat(String(item.hours)) || 0) * (parseFloat(String(item.rate)) || 0)
        subtotal += amount
        await db.insert(proposalItems).values({
          id: item.id || `${id}-item-${i}`,
          proposalId: id,
          description: item.description || "",
          hours: parseFloat(String(item.hours)) || 0,
          rate: parseFloat(String(item.rate)) || 0,
          amount,
          sortOrder: i,
        })
      }
      const taxAmount = subtotal * (parseFloat(String(updated.taxRate)) || 0) / 100
      await db.update(proposals).set({
        subtotal: String(subtotal),
        taxAmount: String(taxAmount),
        total: String(subtotal + taxAmount),
      }).where(eq(proposals.id, id))
    }

    const finalItems = await db.select().from(proposalItems).where(eq(proposalItems.proposalId, id))
    const [clientData] = await db.select().from(clients).where(eq(clients.id, updated.clientId))
    return NextResponse.json({ ...updated, client: clientData ?? null, items: finalItems })
  } catch (err) {
    console.error("Proposal PUT error:", err)
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    await db.delete(proposals).where(eq(proposals.id, id))
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
  }
}
