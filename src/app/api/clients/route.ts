import { db } from "@/lib/db"
import { clients } from "@/db/schema"
import { desc } from "drizzle-orm"
import { NextResponse } from "next/server"
import { getDefaultOrgId } from "@/lib/get-org"

export async function GET() {
  try {
    if (!db) return NextResponse.json([])
    const result = await db.select().from(clients).orderBy(desc(clients.createdAt))
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
    const [client] = await db
      .insert(clients)
      .values({
        id: crypto.randomUUID(),
        name: body.name,
        email: body.email,
        phone: body.phone || null,
        company: body.company || null,
        address: body.address || null,
        taxId: body.taxId || null,
        currency: body.currency || "USD",
        status: body.status || "ACTIVE",
        notes: body.notes || null,
        organizationId: body.organizationId || orgId,
      })
      .returning()
    return NextResponse.json(client, { status: 201 })
  } catch (err) {
    console.error("Client POST error:", err)
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 })
  }
}
