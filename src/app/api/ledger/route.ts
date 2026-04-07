import { db } from "@/lib/db"
import { ledgerEntries, chartOfAccounts } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    if (!db) return NextResponse.json([])
    const entries = await db.select().from(ledgerEntries).orderBy(desc(ledgerEntries.date))
    const accounts = await db.select().from(chartOfAccounts)
    const result = entries.map((entry) => ({
      ...entry,
      account: accounts.find((a) => a.id === entry.accountId) ?? null,
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
    const [entry] = await db
      .insert(ledgerEntries)
      .values({ id: crypto.randomUUID(), ...body })
      .returning()
    const [account] = await db.select().from(chartOfAccounts).where(eq(chartOfAccounts.id, entry.accountId))
    return NextResponse.json({ ...entry, account: account ?? null }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create ledger entry" }, { status: 500 })
  }
}
