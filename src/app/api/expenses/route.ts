import { db } from "@/lib/db"
import { expenses } from "@/db/schema"
import { desc } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    if (!db) return NextResponse.json([])
    const result = await db.select().from(expenses).orderBy(desc(expenses.date))
    return NextResponse.json(result)
  } catch {
    return NextResponse.json([])
  }
}

export async function POST(req: Request) {
  try {
    if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    const body = await req.json()
    const [expense] = await db
      .insert(expenses)
      .values({
        id: crypto.randomUUID(),
        description: body.description,
        amount: String(body.amount || 0),
        category: body.category || "OTHER",
        vendor: body.vendor || null,
        receipt: body.receipt || null,
        notes: body.notes || null,
        status: body.status || "PENDING",
        organizationId: body.organizationId || "org_default",
        date: body.date ? new Date(body.date) : new Date(),
      })
      .returning()
    return NextResponse.json(expense, { status: 201 })
  } catch (err) {
    console.error("Expense POST error:", err)
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 })
  }
}
