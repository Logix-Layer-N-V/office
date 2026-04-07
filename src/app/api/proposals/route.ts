import { db } from "@/lib/db"
import { proposals, proposalItems, clients } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    if (!db) return NextResponse.json([])
    const allProposals = await db.select().from(proposals).orderBy(desc(proposals.createdAt))
    const allItems = await db.select().from(proposalItems)
    const allClients = await db.select().from(clients)
    const result = allProposals.map((proposal) => ({
      ...proposal,
      client: allClients.find((c) => c.id === proposal.clientId) ?? null,
      items: allItems.filter((i) => i.proposalId === proposal.id),
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
    const [proposal] = await db
      .insert(proposals)
      .values({ id: crypto.randomUUID(), ...body })
      .returning()
    const relatedItems = await db
      .select()
      .from(proposalItems)
      .where(eq(proposalItems.proposalId, proposal.id))
    const [client] = await db.select().from(clients).where(eq(clients.id, proposal.clientId))
    return NextResponse.json({ ...proposal, client: client ?? null, items: relatedItems }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create proposal" }, { status: 500 })
  }
}
