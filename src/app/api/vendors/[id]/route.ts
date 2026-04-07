import { db } from "@/lib/db"
import { vendors } from "@/db/schema"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    if (!db) return NextResponse.json(null)
    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, id))
    if (!vendor) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(vendor)
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
      .update(vendors)
      .set({
        ...(body.name !== undefined && { name: body.name }),
        ...(body.email !== undefined && { email: body.email }),
        ...(body.phone !== undefined && { phone: body.phone }),
        ...(body.company !== undefined && { company: body.company }),
        ...(body.address !== undefined && { address: body.address }),
        ...(body.taxId !== undefined && { taxId: body.taxId }),
        ...(body.website !== undefined && { website: body.website }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        updatedAt: new Date(),
      })
      .where(eq(vendors.id, id))
      .returning()
    return NextResponse.json(updated)
  } catch (err) {
    console.error("Vendor PUT error:", err)
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    await db.delete(vendors).where(eq(vendors.id, id))
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
  }
}
