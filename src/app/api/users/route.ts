import { db } from "@/lib/db"
import { members, organizations } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

/**
 * GET /api/users - Fetch all members for the organization
 */
export async function GET() {
  try {
    if (!db) return NextResponse.json([])

    const allMembers = await db.select().from(members).orderBy(desc(members.createdAt))
    const allOrgs = await db.select().from(organizations)
    const result = allMembers.map((member) => ({
      ...member,
      organization: allOrgs.find((o) => o.id === member.organizationId) ?? null,
    }))

    return NextResponse.json(result || [])
  } catch (error) {
    console.error("Failed to fetch members:", error)
    return NextResponse.json([], { status: 500 })
  }
}

/**
 * POST /api/users - Create a new member
 */
export async function POST(req: NextRequest) {
  try {
    if (!db) return NextResponse.json({ error: "Database not available" }, { status: 503 })

    const body = await req.json()
    const { email, name, role, organizationId } = body

    if (!email || !name || !role || !organizationId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const [member] = await db
      .insert(members)
      .values({
        id: crypto.randomUUID(),
        email,
        name,
        role,
        clerkUserId: `user_${Date.now()}`, // Placeholder clerk ID
        organizationId,
      })
      .returning()

    const [organization] = await db.select().from(organizations).where(eq(organizations.id, organizationId))

    return NextResponse.json({ ...member, organization: organization ?? null }, { status: 201 })
  } catch (error) {
    console.error("Failed to create member:", error)
    return NextResponse.json({ error: "Failed to create member" }, { status: 500 })
  }
}
