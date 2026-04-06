import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    if (!prisma) return NextResponse.json([])
    const entries = await prisma.ledgerEntry.findMany({
      include: { account: true },
      orderBy: { date: "desc" },
    })
    return NextResponse.json(entries)
  } catch {
    return NextResponse.json([])
  }
}

export async function POST(req: Request) {
  try {
    if (!prisma) return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    const body = await req.json()
    const entry = await prisma.ledgerEntry.create({
      data: body,
      include: { account: true },
    })
    return NextResponse.json(entry, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create ledger entry" }, { status: 500 })
  }
}
