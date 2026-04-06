import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    if (!prisma) return NextResponse.json([])
    const items = await prisma.item.findMany({
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(items)
  } catch {
    return NextResponse.json([])
  }
}

export async function POST(req: Request) {
  try {
    if (!prisma) return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    const body = await req.json()
    const item = await prisma.item.create({ data: body })
    return NextResponse.json(item, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 })
  }
}
