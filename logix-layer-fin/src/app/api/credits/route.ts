import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    if (!prisma) return NextResponse.json([])
    const credits = await prisma.credit.findMany({
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(credits)
  } catch {
    return NextResponse.json([])
  }
}

export async function POST(req: Request) {
  try {
    if (!prisma) return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    const body = await req.json()
    const credit = await prisma.credit.create({ data: body })
    return NextResponse.json(credit, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create credit" }, { status: 500 })
  }
}
