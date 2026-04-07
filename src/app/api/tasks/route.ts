import { db } from "@/lib/db"
import { tasks, clients, projects, members } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import { NextResponse } from "next/server"
import { randomUUID } from "crypto"

export async function GET() {
  try {
    if (!db) return NextResponse.json([])
    const rows = await db.select().from(tasks).orderBy(desc(tasks.createdAt))
    const withRelations = await Promise.all(
      rows.map(async (t) => {
        const client = t.clientId
          ? (await db!.select().from(clients).where(eq(clients.id, t.clientId)))[0] ?? null
          : null
        const project = t.projectId
          ? (await db!.select().from(projects).where(eq(projects.id, t.projectId)))[0] ?? null
          : null
        const assignee = t.assigneeId
          ? (await db!.select().from(members).where(eq(members.id, t.assigneeId)))[0] ?? null
          : null
        return { ...t, client, project, assignee }
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
    const id = randomUUID()
    const [created] = await db
      .insert(tasks)
      .values({
        id,
        title: body.title,
        description: body.description || null,
        status: body.status || "TODO",
        priority: body.priority || "MEDIUM",
        projectId: body.projectId || null,
        clientId: body.clientId || null,
        assigneeId: body.assigneeId || null,
        organizationId: body.organizationId || "org1",
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
      })
      .returning()
    return NextResponse.json(created)
  } catch (err) {
    console.error("Tasks POST error:", err)
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 })
  }
}
