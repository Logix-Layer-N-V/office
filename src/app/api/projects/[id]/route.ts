import { db } from "@/lib/db"
import { projects, clients, workOrders, tasks } from "@/db/schema"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    if (!db) return NextResponse.json(null, { status: 404 })
    const { id } = await params
    const [project] = await db.select().from(projects).where(eq(projects.id, id))
    if (!project) return NextResponse.json(null, { status: 404 })

    const [client] = await db.select().from(clients).where(eq(clients.id, project.clientId))
    return NextResponse.json({ ...project, client: client ?? null })
  } catch {
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    const { id } = await params
    const body = await req.json()
    const [updated] = await db
      .update(projects)
      .set({
        name: body.name,
        description: body.description,
        status: body.status,
        priority: body.priority,
        clientId: body.clientId,
        budget: body.budget ? String(body.budget) : undefined,
        progress: body.progress,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        deadline: body.deadline ? new Date(body.deadline) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, id))
      .returning()

    if (!updated) return NextResponse.json({ error: "Project not found" }, { status: 404 })
    const [client] = await db.select().from(clients).where(eq(clients.id, updated.clientId))
    return NextResponse.json({ ...updated, client: client ?? null })
  } catch (err) {
    console.error("Projects PUT error:", err)
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    const { id } = await params
    await db.delete(projects).where(eq(projects.id, id))
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 })
  }
}
