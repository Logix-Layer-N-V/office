import { db } from "@/lib/db"
import { workOrders, clients, projects } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import { NextResponse } from "next/server"
import { getDefaultOrgId } from "@/lib/get-org"
import { randomUUID } from "crypto"

export async function GET() {
  try {
    if (!db) return NextResponse.json([])
    const rows = await db.select().from(workOrders).orderBy(desc(workOrders.createdAt))
    const withRelations = await Promise.all(
      rows.map(async (wo) => {
        const [client] = await db!.select().from(clients).where(eq(clients.id, wo.clientId))
        const project = wo.projectId
          ? (await db!.select().from(projects).where(eq(projects.id, wo.projectId)))[0] ?? null
          : null
        return { ...wo, client: client ?? null, project }
      })
    )
    return NextResponse.json(withRelations)
  } catch {
    return NextResponse.json([])
  }
}

export async function POST(req: Request) {
  try {
    if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    const body = await req.json()
    const orgId = await getDefaultOrgId()
    const id = randomUUID()

    // Generate work order number
    const existing = await db.select().from(workOrders).orderBy(desc(workOrders.createdAt))
    const num = `WO-${String(existing.length + 1).padStart(4, "0")}`

    const [created] = await db
      .insert(workOrders)
      .values({
        id,
        number: num,
        title: body.title,
        description: body.description || null,
        status: body.status || "OPEN",
        projectId: body.projectId || null,
        clientId: body.clientId,
        organizationId: body.organizationId || orgId,
        hours: body.hours ? String(body.hours) : "0",
        rate: body.rate ? String(body.rate) : "0",
        date: body.date ? new Date(body.date) : new Date(),
      })
      .returning()
    return NextResponse.json(created)
  } catch (err) {
    console.error("Work Orders POST error:", err)
    return NextResponse.json({ error: "Failed to create work order" }, { status: 500 })
  }
}
