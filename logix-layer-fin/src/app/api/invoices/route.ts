import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    if (!prisma) return NextResponse.json([])
    const invoices = await prisma.invoice.findMany({
      include: { client: true, items: true, payments: true },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(invoices)
  } catch {
    return NextResponse.json([])
  }
}

export async function POST(req: Request) {
  try {
    if (!prisma) return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    const body = await req.json()
    const invoice = await prisma.invoice.create({
      data: body,
      include: { client: true, items: true, payments: true },
    })
    return NextResponse.json(invoice, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 })
  }
}
