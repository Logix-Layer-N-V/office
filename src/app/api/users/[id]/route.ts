import { db } from "@/lib/db"
import { members, organizations } from "@/db/schema"
import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

/**
 * PUT /api/users/[id] - Update a member
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!db) return NextResponse.json({ error: "Database not available" }, { status: 503 })

    const { id } = await params
    const body = await req.json()
    const { name, email, role } = body

    const [member] = await db
      .update(members)
      .set({
        ...(name && { name }),
        ...(email && { email }),
        ...(role && { role }),
      })
      .where(eq(members.id, id))
      .returning()

    const [organization] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, member.organizationId))

    return NextResponse.json({ ...member, organization: organization ?? null })
  } catch (error) {
    console.error("Failed to update member:", error)
    return NextResponse.json({ error: "Failed to update member" }, { status: 500 })
  }
}

/**
 * DELETE /api/users/[id] - Delete a member
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!db) return NextResponse.json({ error: "Database not available" }, { status: 503 })

    const { id } = await params
    await db.delete(members).where(eq(members.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete member:", error)
    return NextResponse.json({ error: "Failed to delete member" }, { status: 500 })
  }
}
