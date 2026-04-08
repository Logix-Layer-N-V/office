import { db } from "@/lib/db"
import { loans } from "@/db/schema"
import { desc } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    if (!db) return NextResponse.json([])
    const result = await db.select().from(loans).orderBy(desc(loans.createdAt))
    return NextResponse.json(result)
  } catch {
    return NextResponse.json([])
  }
}

export async function POST(req: Request) {
  try {
    if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    const body = await req.json()
    const [loan] = await db
      .insert(loans)
      .values({
        id: crypto.randomUUID(),
        name: body.name,
        lender: body.lender,
        amount: String(body.amount),
        remainingBalance: String(body.remainingBalance),
        interestRate: String(body.interestRate),
        monthlyPayment: String(body.monthlyPayment),
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        status: body.status ?? "ACTIVE",
        notes: body.notes ?? null,
        organizationId: body.organizationId ?? "org_default",
      })
      .returning()
    return NextResponse.json(loan, { status: 201 })
  } catch (error) {
    console.error("Failed to create loan:", error)
    return NextResponse.json({ error: "Failed to create loan" }, { status: 500 })
  }
}
