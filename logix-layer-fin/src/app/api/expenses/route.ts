import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    if (!prisma) return NextResponse.json([])
    const expenses = await prisma.expense.findMany({
      orderBy: { date: "desc" },
    })
    return NextResponse.json(expenses)
  } catch {
    return NextResponse.json([])
  }
}

export async function POST(req: Request) {
  try {
    if (!prisma) return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    const body = await req.json()
    const expense = await prisma.expense.create({ data: body })
    return NextResponse.json(expense, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 })
  }
}
