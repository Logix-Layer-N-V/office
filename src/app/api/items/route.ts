import { db } from "@/lib/db"
import { items } from "@/db/schema"
import { desc } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    if (!db) return NextResponse.json([])
    const result = await db.select().from(items).orderBy(desc(items.createdAt))
    return NextResponse.json(result)
  } catch {
    return NextResponse.json([])
  }
}

export async function POST(req: Request) {
  try {
    if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    const body = await req.json()
    const [item] = await db
      .insert(items)
      .values({
        id: crypto.randomUUID(),
        name: body.name,
        type: body.type,
        description: body.description || null,
        unit: body.unit || "hour",
        rate: body.rate ? String(body.rate) : "65",
        isActive: body.isActive ?? true,
        organizationId: body.organizationId || "org_default",
      })
      .returning()
    return NextResponse.json(item, { status: 201 })
  } catch (err) {
    console.error("Item POST error:", err)
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 })
  }
}
