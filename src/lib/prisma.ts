/**
 * prisma.ts
 * WAT:    Prisma client singleton met graceful fallback
 * WAAROM: App moet werken zonder database (returns empty data)
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PrismaClientType = any

const globalForPrisma = globalThis as unknown as { prisma: PrismaClientType }

function createPrismaClient(): PrismaClientType | null {
  try {
    if (!process.env.DATABASE_URL) {
      console.warn("[Prisma] No DATABASE_URL set — running without database")
      return null
    }
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaClient } = require("@prisma/client")
    return new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    })
  } catch {
    console.warn("[Prisma] Client not available — run: npx prisma generate")
    return null
  }
}

export const prisma: PrismaClientType | null =
  globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production" && prisma) {
  globalForPrisma.prisma = prisma
}
