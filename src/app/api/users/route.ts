import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

/**
 * GET /api/users - Fetch all members for the organization
 */
export async function GET() {
  try {
    if (!prisma) {
      return NextResponse.json([])
    }

    const members = await prisma.member.findMany({
      include: {
        organization: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(members || [])
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
    if (!prisma) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 503 }
      )
    }

    const body = await req.json()
    const { email, name, role, organizationId } = body

    if (!email || !name || !role || !organizationId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const member = await prisma.member.create({
      data: {
        email,
        name,
        role,
        clerkUserId: `user_${Date.now()}`, // Placeholder clerk ID
        organizationId,
      },
      include: {
        organization: true,
      },
    })

    return NextResponse.json(member, { status: 201 })
  } catch (error) {
    console.error("Failed to create member:", error)
    return NextResponse.json(
      { error: "Failed to create member" },
      { status: 500 }
    )
  }
}
