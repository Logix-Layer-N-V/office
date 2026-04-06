import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    if (!prisma) return NextResponse.json([])
    const accounts = await prisma.chartOfAccount.findMany({
      orderBy: { code: "asc" },
      include: { entries: true },
    })
    return NextResponse.json(accounts)
  } catch {
    return NextResponse.json([])
  }
}

export async function POST(req: Request) {
  try {
    if (!prisma) return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    const body = await req.json()
    const account = await prisma.chartOfAccount.create({ data: body })
    return NextResponse.json(account, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 })
  }
}
