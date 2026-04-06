import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    if (!prisma) return NextResponse.json([])
    const proposals = await prisma.proposal.findMany({
      include: { client: true, items: true },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(proposals)
  } catch {
    return NextResponse.json([])
  }
}

export async function POST(req: Request) {
  try {
    if (!prisma) return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    const body = await req.json()
    const proposal = await prisma.proposal.create({
      data: body,
      include: { client: true, items: true },
    })
    return NextResponse.json(proposal, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create proposal" }, { status: 500 })
  }
}
