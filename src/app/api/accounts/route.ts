import { db } from "@/lib/db"
import { chartOfAccounts, ledgerEntries } from "@/db/schema"
import { eq, asc } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    if (!db) return NextResponse.json([])
    const accounts = await db.select().from(chartOfAccounts).orderBy(asc(chartOfAccounts.code))
    const entries = await db.select().from(ledgerEntries)
    const accountsWithEntries = accounts.map((account) => ({
      ...account,
      entries: entries.filter((e) => e.accountId === account.id),
    }))
    return NextResponse.json(accountsWithEntries)
  } catch {
    return NextResponse.json([])
  }
}

export async function POST(req: Request) {
  try {
    if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    const body = await req.json()
    const [account] = await db
      .insert(chartOfAccounts)
      .values({
        id: crypto.randomUUID(),
        code: body.code,
        name: body.name,
        type: body.type,
        subtype: body.subtype ?? null,
        description: body.description ?? null,
        isActive: body.isActive ?? true,
        organizationId: body.organizationId ?? "org_default",
      })
      .returning()
    return NextResponse.json(account, { status: 201 })
  } catch (error) {
    console.error("Failed to create account:", error)
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 })
  }
}
