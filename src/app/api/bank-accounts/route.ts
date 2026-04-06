import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    if (!prisma) return NextResponse.json([])
    const bankAccounts = await prisma.bankAccount.findMany({
      include: { transactions: true, payments: true },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(bankAccounts)
  } catch {
    return NextResponse.json([])
  }
}

export async function POST(req: Request) {
  try {
    if (!prisma) return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    const body = await req.json()
    const bankAccount = await prisma.bankAccount.create({
      data: body,
      include: { transactions: true, payments: true },
    })
    return NextResponse.json(bankAccount, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create bank account" }, { status: 500 })
  }
}
