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
    const [updated] = await db
      .update(proposals)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(proposals.id, id))
      .returning()
    const relatedItems = await db.select().from(proposalItems).where(eq(proposalItems.proposalId, id))
    const [client] = await db.select().from(clients).where(eq(clients.id, updated.clientId))
    return NextResponse.json({ ...updated, client: client ?? null, items: relatedItems })
  } catch {
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
