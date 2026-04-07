import { db } from "@/lib/db"
import { projects, clients } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import { NextResponse } from "next/server"
import { randomUUID } from "crypto"

export async function GET() {
  try {
    if (!db) return NextResponse.json([])
    const rows = await db.select().from(projects).orderBy(desc(projects.createdAt))
    // Attach client info
    const withClients = await Promise.all(
      rows.map(async (p) => {
        const [client] = await db!.select().from(clients).where(eq(clients.id, p.clientId))
        return { ...p, client: client ?? null }
      })
    )
    return NextResponse.json(withClients)
  } catch {
    return NextResponse.json([])
  }
}

export async function POST(req: Request) {
  try {
    if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    const body = await req.json()
    const id = randomUUID()
    const [created] = await db
      .insert(projects)
      .values({
        id,
        name: body.name,
        description: body.description || null,
        status: body.status || "PLANNING",
        priority: body.priority || "MEDIUM",
        clientId: body.clientId,
        organizationId: body.organizationId || "org1",
        budget: body.budget ? String(body.budget) : "0",
        progress: 0,
        startDate: body.startDate ? new Date(body.startDate) : null,
        deadline: body.deadline ? new Date(body.deadline) : null,
      })
      .returning()
    const [client] = await db.select().from(clients).where(eq(clients.id, created.clientId))
    return NextResponse.json({ ...created, client: client ?? null })
  } catch (err) {
    console.error("Projects POST error:", err)
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 })
  }
}
