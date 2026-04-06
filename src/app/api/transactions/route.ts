import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    if (!prisma) return NextResponse.json([])
    const transactions = await prisma.transaction.findMany({
      include: { bankAccount: true },
      orderBy: { date: "desc" },
    })
    return NextResponse.json(transactions)
  } catch {
    return NextResponse.json([])
  }
}

export async function POST(req: Request) {
  try {
    if (!prisma) return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    const body = await req.json()
    const transaction = await prisma.transaction.create({
      data: body,
      include: { bankAccount: true },
    })
    return NextResponse.json(transaction, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 })
  }
}
