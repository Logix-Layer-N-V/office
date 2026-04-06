import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

/**
 * PUT /api/users/[id] - Update a member
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!prisma) {
      return NextResponse.json({ error: "Database not available" }, { status: 503 })
    }

    const { id } = await params
    const body = await req.json()
    const { name, email, role } = body

    const member = await prisma.member.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(role && { role }),
      },
      include: { organization: true },
    })

    return NextResponse.json(member)
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
    if (!prisma) {
      return NextResponse.json({ error: "Database not available" }, { status: 503 })
    }

    const { id } = await params
    await prisma.member.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete member:", error)
    return NextResponse.json({ error: "Failed to delete member" }, { status: 500 })
  }
}
