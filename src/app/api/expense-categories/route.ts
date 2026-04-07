import { db } from "@/lib/db"
import { expenseCategories } from "@/db/schema"
import { desc, sql } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    if (!db) return NextResponse.json([])
    const result = await db
      .select({
        id: expenseCategories.id,
        name: expenseCategories.name,
        description: expenseCategories.description,
        color: expenseCategories.color,
        budget: expenseCategories.budget,
        isActive: expenseCategories.isActive,
        organizationId: expenseCategories.organizationId,
        createdAt: expenseCategories.createdAt,
        updatedAt: expenseCategories.updatedAt,
      })
      .from(expenseCategories)
      .orderBy(desc(expenseCategories.createdAt))
    return NextResponse.json(result)
  } catch (err) {
    console.error("ExpenseCategories GET error:", err)
    return NextResponse.json([])
  }
}

export async function POST(req: Request) {
  try {
    if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    const body = await req.json()
    const [category] = await db
      .insert(expenseCategories)
      .values({
        id: crypto.randomUUID(),
        name: body.name,
        description: body.description || null,
        color: body.color || "#6B7280",
        budget: body.budget ? String(body.budget) : null,
        organizationId: body.organizationId || "org-1",
      })
      .returning()
    return NextResponse.json(category, { status: 201 })
  } catch (err) {
    console.error("ExpenseCategories POST error:", err)
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 })
  }
}
