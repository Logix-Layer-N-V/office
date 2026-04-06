import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    if (!prisma) return NextResponse.json(null)
    const bankAccount = await prisma.bankAccount.findUnique({
      where: { id },
      include: { transactions: true, payments: true },
    })
    if (!bankAccount) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(bankAccount)
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    if (!prisma) return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    const body = await req.json()
    const updated = await prisma.bankAccount.update({
      where: { id },
      data: body,
      include: { transactions: true, payments: true },
    })
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    if (!prisma) return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    await prisma.bankAccount.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
  }
}
