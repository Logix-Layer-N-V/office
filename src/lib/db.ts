import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "@/db/schema"

function createDb() {
  if (!process.env.DATABASE_URL) {
    console.warn("[DB] No DATABASE_URL set — running without database")
    return null
  }
  const sql = neon(process.env.DATABASE_URL)
  return drizzle(sql, { schema })
}

export const db = createDb()
export type Db = NonNullable<typeof db>
