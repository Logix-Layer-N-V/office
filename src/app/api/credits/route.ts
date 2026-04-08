import { db } from "@/lib/db"
import { credits } from "@/db/schema"
import { desc } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    if (!db) return NextResponse.json([])
    const result = await db.select().from(credits).orderBy(desc(credits.createdAt))
    return NextResponse.json(result)
  } catch {
    return NextResponse.json([])
  }
}

export async function POST(req: Request) {
  try {
    if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    const body = await req.json()
    const [credit] = await db
      .insert(credits)
      .values({
        id: crypto.randomUUID(),
        number: body.number,
        description: body.description,
        amount: String(body.amount),
        remaining: String(body.remaining),
        status: body.status ?? "ACTIVE",
        reason: body.reason ?? null,
        organizationId: body.organizationId ?? "org_default",
        issuedAt: body.issuedAt ? new Date(body.issuedAt) : new Date(),
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      })
      .returning()
    return NextResponse.json(credit, { status: 201 })
  } catch (error) {
    console.error("Failed to create credit:", error)
    return NextResponse.json({ error: "Failed to create credit" }, { status: 500 })
  }
}
