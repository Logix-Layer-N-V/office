import { db } from "@/lib/db"
import { transactions, bankAccounts } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    if (!db) return NextResponse.json([])
    const allTransactions = await db.select().from(transactions).orderBy(desc(transactions.date))
    const allBankAccounts = await db.select().from(bankAccounts)
    const result = allTransactions.map((transaction) => ({
      ...transaction,
      bankAccount: allBankAccounts.find((b) => b.id === transaction.bankAccountId) ?? null,
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
    const [transaction] = await db
      .insert(transactions)
      .values({
        id: crypto.randomUUID(),
        type: body.type,
        amount: String(body.amount),
        description: body.description,
        reference: body.reference ?? null,
        bankAccountId: body.bankAccountId,
        date: body.date ? new Date(body.date) : new Date(),
      })
      .returning()
    const [bankAccount] = await db
      .select()
      .from(bankAccounts)
      .where(eq(bankAccounts.id, transaction.bankAccountId))
    return NextResponse.json({ ...transaction, bankAccount: bankAccount ?? null }, { status: 201 })
  } catch (error) {
    console.error("Failed to create transaction:", error)
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 })
  }
}
