import { db } from "@/lib/db"
import { vendors, expenses } from "@/db/schema"
import { desc, eq, sql } from "drizzle-orm"
import { NextResponse } from "next/server"
import { getDefaultOrgId } from "@/lib/get-org"

export async function GET() {
  try {
    if (!db) return NextResponse.json([])
    const result = await db
      .select({
        id: vendors.id,
        name: vendors.name,
        email: vendors.email,
        phone: vendors.phone,
        company: vendors.company,
        address: vendors.address,
        taxId: vendors.taxId,
        website: vendors.website,
        notes: vendors.notes,
        isActive: vendors.isActive,
        organizationId: vendors.organizationId,
        createdAt: vendors.createdAt,
        updatedAt: vendors.updatedAt,
        expenseCount: sql<number>`(SELECT COUNT(*) FROM expenses WHERE expenses.vendor = ${vendors.name})`.as("expense_count"),
        totalSpent: sql<number>`COALESCE((SELECT SUM(CAST(expenses.amount AS NUMERIC)) FROM expenses WHERE expenses.vendor = ${vendors.name}), 0)`.as("total_spent"),
      })
      .from(vendors)
      .orderBy(desc(vendors.createdAt))
    return NextResponse.json(result)
  } catch (err) {
    console.error("Vendors GET error:", err)
    return NextResponse.json([])
  }
}

export async function POST(req: Request) {
  try {
    if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    const body = await req.json()
    const orgId = await getDefaultOrgId()
    const [vendor] = await db
      .insert(vendors)
      .values({
        id: crypto.randomUUID(),
        name: body.name,
        email: body.email || null,
        phone: body.phone || null,
        company: body.company || null,
        address: body.address || null,
        taxId: body.taxId || null,
        website: body.website || null,
        notes: body.notes || null,
        organizationId: body.organizationId || orgId,
      })
      .returning()
    return NextResponse.json(vendor, { status: 201 })
  } catch (err) {
    console.error("Vendors POST error:", err)
    return NextResponse.json({ error: "Failed to create vendor" }, { status: 500 })
  }
}
