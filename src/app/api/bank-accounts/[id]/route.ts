import { db } from "@/lib/db"
import { bankAccounts, transactions, payments } from "@/db/schema"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    if (!db) return NextResponse.json(null)
    const [bankAccount] = await db.select().from(bankAccounts).where(eq(bankAccounts.id, id))
    if (!bankAccount) return NextResponse.json({ error: "Not found" }, { status: 404 })
    const relatedTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.bankAccountId, id))
    const relatedPayments = await db
      .select()
      .from(payments)
      .where(eq(payments.bankAccountId, id))
    return NextResponse.json({ ...bankAccount, transactions: relatedTransactions, payments: relatedPayments })
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    const body = await req.json()
    const [updated] = await db
      .update(bankAccounts)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(bankAccounts.id, id))
      .returning()
    const relatedTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.bankAccountId, id))
    const relatedPayments = await db
      .select()
      .from(payments)
      .where(eq(payments.bankAccountId, id))
    return NextResponse.json({ ...updated, transactions: relatedTransactions, payments: relatedPayments })
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    await db.delete(bankAccounts).where(eq(bankAccounts.id, id))
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
  }
}
