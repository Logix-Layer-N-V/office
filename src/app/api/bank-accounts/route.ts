import { db } from "@/lib/db"
import { bankAccounts, transactions, payments } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    if (!db) return NextResponse.json([])
    const accounts = await db.select().from(bankAccounts).orderBy(desc(bankAccounts.createdAt))
    const allTransactions = await db.select().from(transactions)
    const allPayments = await db.select().from(payments)
    const result = accounts.map((account) => ({
      ...account,
      transactions: allTransactions.filter((t) => t.bankAccountId === account.id),
      payments: allPayments.filter((p) => p.bankAccountId === account.id),
    }))
    return NextResponse.json(result)
  } catch {
    return NextResponse.json([])
  }
}

export async function POST(req: Request) {
  try {
    if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    const body = await req.json()
    const [bankAccount] = await db
      .insert(bankAccounts)
      .values({ id: crypto.randomUUID(), ...body })
      .returning()
    const relatedTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.bankAccountId, bankAccount.id))
    const relatedPayments = await db
      .select()
      .from(payments)
      .where(eq(payments.bankAccountId, bankAccount.id))
    return NextResponse.json(
      { ...bankAccount, transactions: relatedTransactions, payments: relatedPayments },
      { status: 201 }
    )
  } catch {
    return NextResponse.json({ error: "Failed to create bank account" }, { status: 500 })
  }
}
