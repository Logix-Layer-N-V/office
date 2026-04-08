import { db } from "@/lib/db"
import { bankAccounts, transactions, payments } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import { NextResponse } from "next/server"
import { getDefaultOrgId } from "@/lib/get-org"

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
    const orgId = await getDefaultOrgId()
    const [bankAccount] = await db
      .insert(bankAccounts)
      .values({
        id: crypto.randomUUID(),
        name: body.name,
        bankName: body.bankName,
        accountNumber: body.accountNumber,
        routingNumber: body.routingNumber ?? null,
        iban: body.iban ?? null,
        swift: body.swift ?? null,
        type: body.type ?? "CHECKING",
        currency: body.currency ?? "USD",
        balance: String(body.balance ?? "0"),
        isDefault: body.isDefault ?? false,
        organizationId: body.organizationId || orgId,
      })
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
  } catch (error) {
    console.error("Failed to create bank account:", error)
    return NextResponse.json({ error: "Failed to create bank account" }, { status: 500 })
  }
}
