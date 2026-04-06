import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    if (!prisma) return NextResponse.json([])
    const payments = await prisma.payment.findMany({
      include: { client: true, invoice: true, bankAccount: true },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(payments)
  } catch {
    return NextResponse.json([])
  }
}

export async function POST(req: Request) {
  try {
    if (!prisma) return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    const body = await req.json()
    const payment = await prisma.payment.create({
      data: body,
      include: { client: true, invoice: true, bankAccount: true },
    })
    return NextResponse.json(payment, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 })
  }
}
