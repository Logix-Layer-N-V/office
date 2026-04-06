import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    if (!prisma) return NextResponse.json([])
    const loans = await prisma.loan.findMany({
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(loans)
  } catch {
    return NextResponse.json([])
  }
}

export async function POST(req: Request) {
  try {
    if (!prisma) return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    const body = await req.json()
    const loan = await prisma.loan.create({ data: body })
    return NextResponse.json(loan, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create loan" }, { status: 500 })
  }
}
