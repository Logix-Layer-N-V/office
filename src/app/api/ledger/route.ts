import { db } from "@/lib/db"
import { ledgerEntries, chartOfAccounts } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import { NextResponse } from "next/server"
import { getDefaultOrgId } from "@/lib/get-org"

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
    const orgId = await getDefaultOrgId()
    const [entry] = await db
      .insert(ledgerEntries)
      .values({
        id: crypto.randomUUID(),
        date: body.date ? new Date(body.date) : new Date(),
        description: body.description,
        debit: String(body.debit ?? "0"),
        credit: String(body.credit ?? "0"),
        accountId: body.accountId,
        reference: body.reference ?? null,
        organizationId: body.organizationId || orgId,
      })
      .returning()
    const [account] = await db.select().from(chartOfAccounts).where(eq(chartOfAccounts.id, entry.accountId))
    return NextResponse.json({ ...entry, account: account ?? null }, { status: 201 })
  } catch (error) {
    console.error("Failed to create ledger entry:", error)
    return NextResponse.json({ error: "Failed to create ledger entry" }, { status: 500 })
  }
}
