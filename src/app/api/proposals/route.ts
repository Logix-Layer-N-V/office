import { db } from "@/lib/db"
import { proposals, proposalItems, clients } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import { NextResponse } from "next/server"
import { getDefaultOrgId } from "@/lib/get-org"

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
    const orgId = await getDefaultOrgId()

    const lineItems: { description: string; hours: number; rate: number; amount: number }[] = body.items || []
    const subtotal = lineItems.reduce((s, i) => s + (i.amount || 0), 0)
    const taxRate = Number(body.taxRate) || 0
    const taxAmount = subtotal * (taxRate / 100)
    const total = subtotal + taxAmount

    const proposalNumber = `PROP-${Date.now().toString(36).toUpperCase()}`

    const [proposal] = await db
      .insert(proposals)
      .values({
        id: crypto.randomUUID(),
        number: proposalNumber,
        title: body.title,
        description: body.description || null,
        status: body.status || "DRAFT",
        clientId: body.clientId,
        organizationId: body.organizationId || orgId,
        subtotal: String(subtotal),
        taxRate: String(taxRate),
        taxAmount: String(taxAmount),
        total: String(total),
        validUntil: body.validUntil ? new Date(body.validUntil) : null,
      })
      .returning()

    if (lineItems.length > 0) {
      await db.insert(proposalItems).values(
        lineItems.map((item, idx) => ({
          id: crypto.randomUUID(),
          proposalId: proposal.id,
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
      .from(proposalItems)
      .where(eq(proposalItems.proposalId, proposal.id))
    const [client] = await db.select().from(clients).where(eq(clients.id, proposal.clientId))
    return NextResponse.json({ ...proposal, client: client ?? null, items: relatedItems }, { status: 201 })
  } catch (err) {
    console.error("Proposal POST error:", err)
    return NextResponse.json({ error: "Failed to create proposal" }, { status: 500 })
  }
}
