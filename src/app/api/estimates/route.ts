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
    const [estimate] = await db
      .insert(estimates)
      .values({ id: crypto.randomUUID(), ...body })
      .returning()
    const relatedItems = await db
      .select()
      .from(estimateItems)
      .where(eq(estimateItems.estimateId, estimate.id))
    const [client] = await db.select().from(clients).where(eq(clients.id, estimate.clientId))
    return NextResponse.json({ ...estimate, client: client ?? null, items: relatedItems }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create estimate" }, { status: 500 })
  }
}
