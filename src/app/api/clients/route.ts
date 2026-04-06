import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    if (!prisma) return NextResponse.json([])
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(clients)
  } catch {
    return NextResponse.json([])
  }
}

export async function POST(req: Request) {
  try {
    if (!prisma) return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    const body = await req.json()
    const client = await prisma.client.create({ data: body })
    return NextResponse.json(client, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 })
  }
}
