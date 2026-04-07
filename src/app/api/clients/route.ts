import { db } from "@/lib/db"
import { clients } from "@/db/schema"
import { desc } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    if (!db) return NextResponse.json([])
    const result = await db.select().from(clients).orderBy(desc(clients.createdAt))
    return NextResponse.json(result)
  } catch {
    return NextResponse.json([])
  }
}

export async function POST(req: Request) {
  try {
    if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    const body = await req.json()
    const [client] = await db
      .insert(clients)
      .values({ id: crypto.randomUUID(), ...body })
      .returning()
    return NextResponse.json(client, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 })
  }
}
