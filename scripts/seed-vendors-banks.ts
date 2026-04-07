/**
 * Seed vendors and bank accounts
 * Run: npx tsx scripts/seed-vendors-banks.ts
 */

import { neon } from "@neondatabase/serverless"
import { readFileSync } from "fs"
import { resolve } from "path"
import { randomUUID } from "crypto"

// Load .env.local
try {
  const envContent = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8")
  envContent.split("\n").forEach((line) => {
    const [key, ...vals] = line.split("=")
    if (key && !key.startsWith("#") && vals.length) {
      process.env[key.trim()] = vals.join("=").trim().replace(/^["']|["']$/g, "")
    }
  })
} catch {}

async function seed() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not set")
    process.exit(1)
  }

  const sql = neon(process.env.DATABASE_URL)

  // Get org id
  const orgRows = await sql`SELECT id FROM organizations LIMIT 1`
  const orgId = (orgRows[0] as any)?.id || "org-1"
  console.log(`Organization: ${orgId}`)

  // ─── Vendors ───────────────────────────────
  const vendors = [
    { name: "Vercel", email: "billing@vercel.com", company: "Vercel Inc.", website: "https://vercel.com", notes: "Hosting & deployment platform" },
    { name: "Cloudflare", email: "billing@cloudflare.com", company: "Cloudflare Inc.", website: "https://cloudflare.com", notes: "CDN, DNS & security services" },
    { name: "Cloudways", email: "support@cloudways.com", company: "Cloudways Ltd.", website: "https://cloudways.com", notes: "Managed cloud hosting" },
    { name: "Claude Code", email: "billing@anthropic.com", company: "Anthropic PBC", website: "https://anthropic.com", notes: "AI coding assistant subscription" },
    { name: "OpenRouter", email: "support@openrouter.ai", company: "OpenRouter AI", website: "https://openrouter.ai", notes: "AI model routing & API gateway" },
    { name: "EBS", email: "info@ebs.sr", company: "Energie Bedrijven Suriname", phone: "+597 472222", notes: "Electricity provider" },
    { name: "SWM", email: "info@swm.sr", company: "Surinaamse Waterleiding Maatschappij", phone: "+597 499211", notes: "Water utility" },
    { name: "Telesur", email: "info@telesur.sr", company: "Telecommunicatiebedrijf Suriname", phone: "+597 471711", website: "https://telesur.sr", notes: "Internet & telecom" },
  ]

  for (const v of vendors) {
    const id = randomUUID()
    await sql.query(
      `INSERT INTO vendors (id, name, email, phone, company, website, notes, is_active, organization_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true, $8, NOW(), NOW())
       ON CONFLICT (id) DO NOTHING`,
      [id, v.name, v.email || null, v.phone || null, v.company, v.website || null, v.notes || null, orgId]
    )
    console.log(`✓ Vendor: ${v.name}`)
  }

  // ─── Bank Accounts ─────────────────────────
  // First check if these already exist
  const existingBanks = await sql`SELECT name FROM bank_accounts`
  const existingNames = (existingBanks as any[]).map((b: any) => b.name)

  const banks = [
    { name: "DSB SRD", bankName: "De Surinaamsche Bank", accountNumber: "SRD-001-2025", type: "CHECKING", currency: "SRD", balance: "125000.00" },
    { name: "DSB USD", bankName: "De Surinaamsche Bank", accountNumber: "USD-001-2025", type: "CHECKING", currency: "USD", balance: "45000.00" },
    { name: "DSB EURO", bankName: "De Surinaamsche Bank", accountNumber: "EUR-001-2025", type: "CHECKING", currency: "EUR", balance: "18500.00" },
  ]

  for (const b of banks) {
    if (existingNames.includes(b.name)) {
      console.log(`⏭ Bank: ${b.name} (already exists)`)
      continue
    }
    const id = randomUUID()
    await sql.query(
      `INSERT INTO bank_accounts (id, name, bank_name, account_number, type, currency, balance, is_default, organization_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       ON CONFLICT (id) DO NOTHING`,
      [id, b.name, b.bankName, b.accountNumber, b.type, b.currency, b.balance, b.name === "DSB USD", orgId]
    )
    console.log(`✓ Bank: ${b.name} (${b.currency}) — Balance: ${b.balance}`)
  }

  console.log("\n✅ Done! Seeded 8 vendors + 3 bank accounts")
}

seed().catch(console.error)
