import { db } from "@/lib/db"
import { expenseCategories } from "@/db/schema"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    if (!db) return NextResponse.json(null)
    const [cat] = await db.select().from(expenseCategories).where(eq(expenseCategories.id, id))
    if (!cat) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(cat)
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
      .update(expenseCategories)
      .set({
        ...(body.name !== undefined && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.color !== undefined && { color: body.color }),
        ...(body.budget !== undefined && { budget: body.budget ? String(body.budget) : null }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        updatedAt: new Date(),
      })
      .where(eq(expenseCategories.id, id))
      .returning()
    return NextResponse.json(updated)
  } catch (err) {
    console.error("ExpenseCategory PUT error:", err)
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    await db.delete(expenseCategories).where(eq(expenseCategories.id, id))
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
  }
}
