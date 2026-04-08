import { db } from "@/lib/db"
import { organizations } from "@/db/schema"

let cachedOrgId: string | null = null

/**
 * Get the default organization ID.
 * Returns the first organization found, or creates one if none exist.
 */
export async function getDefaultOrgId(): Promise<string> {
  if (cachedOrgId) return cachedOrgId

  if (!db) throw new Error("Database not configured")

  const rows = await db.select({ id: organizations.id }).from(organizations).limit(1)
  if (rows.length > 0) {
    cachedOrgId = rows[0].id
    return cachedOrgId
  }

  // No organization exists — create the default one
  const [org] = await db
    .insert(organizations)
    .values({
      id: crypto.randomUUID(),
      name: "Logix Layer N.V.",
      currency: "USD",
    })
    .returning()

  cachedOrgId = org.id
  return cachedOrgId
}
