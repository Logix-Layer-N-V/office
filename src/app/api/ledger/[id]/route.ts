import { db } from "@/lib/db"
import { ledgerEntries, chartOfAccounts } from "@/db/schema"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    if (!db) return NextResponse.json(null)
    const [entry] = await db.select().from(ledgerEntries).where(eq(ledgerEntries.id, id))
    if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 })
    const [account] = await db.select().from(chartOfAccounts).where(eq(chartOfAccounts.id, entry.accountId))
    return NextResponse.json({ ...entry, account: account ?? null })
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
      .update(ledgerEntries)
      .set({ ...body })
      .where(eq(ledgerEntries.id, id))
      .returning()
    const [account] = await db.select().from(chartOfAccounts).where(eq(chartOfAccounts.id, updated.accountId))
    return NextResponse.json({ ...updated, account: account ?? null })
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    await db.delete(ledgerEntries).where(eq(ledgerEntries.id, id))
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
  }
}
