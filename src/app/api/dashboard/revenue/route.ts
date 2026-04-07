import { db } from "@/lib/db"
import { invoices, expenses } from "@/db/schema"
import { NextResponse } from "next/server"

const emptyRevenue = [
  { month: "Oct", revenue: 0, expenses: 0 },
  { month: "Nov", revenue: 0, expenses: 0 },
  { month: "Dec", revenue: 0, expenses: 0 },
  { month: "Jan", revenue: 0, expenses: 0 },
  { month: "Feb", revenue: 0, expenses: 0 },
  { month: "Mar", revenue: 0, expenses: 0 },
]

export async function GET() {
  try {
    if (!db) return NextResponse.json(emptyRevenue)

    const allInvoices = await db.select().from(invoices)
    const allExpenses = await db.select().from(expenses)

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const now = new Date()
    const result = []

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const month = months[d.getMonth()]
      const year = d.getFullYear()
      const m = d.getMonth()

      const revenue = allInvoices
        .filter((inv) => {
          const date = new Date(inv.issueDate)
          return date.getMonth() === m && date.getFullYear() === year
        })
        .reduce((sum, inv) => sum + Number(inv.total), 0)

      const exp = allExpenses
        .filter((e) => {
          const date = new Date(e.date)
          return date.getMonth() === m && date.getFullYear() === year
        })
        .reduce((sum, e) => sum + Number(e.amount), 0)

      result.push({ month, revenue, expenses: exp })
    }

    return NextResponse.json(result)
  } catch {
    return NextResponse.json(emptyRevenue)
  }
}
