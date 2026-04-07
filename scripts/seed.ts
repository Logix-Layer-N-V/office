/**
 * seed.ts — Demo data voor Logix Layer Finance
 * Run: npx tsx scripts/seed.ts
 */

import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "../src/db/schema"

// Laad .env.local
try { process.loadEnvFile(".env.local") } catch {}
try { process.loadEnvFile(".env") } catch {}

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

const id = () => crypto.randomUUID()
const now = new Date()
const daysAgo = (n: number) => new Date(now.getTime() - n * 86400000)
const daysFromNow = (n: number) => new Date(now.getTime() + n * 86400000)

async function seed() {
  console.log("🌱 Seeding demo data...")

  // ─── Organization ──────────────────────────────────────────
  const orgId = id()
  await db.insert(schema.organizations).values({
    id: orgId,
    name: "Logix Layer N.V.",
    website: "https://logixlayer.com",
    email: "finance@logixlayer.com",
    phone: "+31 20 123 4567",
    address: "Herengracht 182, 1016 BR Amsterdam",
    taxId: "NL123456789B01",
    currency: "EUR",
    createdAt: daysAgo(180),
    updatedAt: now,
  })

  // ─── Members ───────────────────────────────────────────────
  await db.insert(schema.members).values([
    {
      id: id(),
      clerkUserId: "user_demo_owner",
      email: "kento@logixlayer.com",
      name: "Kento S.",
      role: "OWNER",
      organizationId: orgId,
      createdAt: daysAgo(180),
    },
    {
      id: id(),
      clerkUserId: "user_demo_admin",
      email: "finance@logixlayer.com",
      name: "Sarah de Vries",
      role: "ADMIN",
      organizationId: orgId,
      createdAt: daysAgo(90),
    },
  ])

  // ─── Clients ───────────────────────────────────────────────
  const clientIds = { acme: id(), nova: id(), peak: id(), delta: id() }

  await db.insert(schema.clients).values([
    {
      id: clientIds.acme,
      name: "Acme Corp",
      email: "billing@acme.com",
      phone: "+1 415 555 0101",
      company: "Acme Corporation",
      address: "101 Market St, San Francisco CA 94105",
      taxId: "US-987654321",
      currency: "USD",
      status: "ACTIVE",
      organizationId: orgId,
      createdAt: daysAgo(120),
      updatedAt: now,
    },
    {
      id: clientIds.nova,
      name: "Nova Digital",
      email: "accounts@novadigital.nl",
      phone: "+31 6 12345678",
      company: "Nova Digital B.V.",
      address: "Keizersgracht 320, Amsterdam",
      currency: "EUR",
      status: "ACTIVE",
      organizationId: orgId,
      createdAt: daysAgo(90),
      updatedAt: now,
    },
    {
      id: clientIds.peak,
      name: "Peak Ventures",
      email: "finance@peakventures.io",
      company: "Peak Ventures Ltd.",
      currency: "EUR",
      status: "ACTIVE",
      organizationId: orgId,
      createdAt: daysAgo(60),
      updatedAt: now,
    },
    {
      id: clientIds.delta,
      name: "Delta Systems",
      email: "ap@deltasystems.de",
      company: "Delta Systems GmbH",
      address: "Friedrichstraße 50, Berlin",
      currency: "EUR",
      status: "LEAD",
      organizationId: orgId,
      createdAt: daysAgo(14),
      updatedAt: now,
    },
  ])

  // ─── Items ─────────────────────────────────────────────────
  const itemIds = { dev: id(), design: id(), ai: id(), hosting: id() }

  await db.insert(schema.items).values([
    {
      id: itemIds.dev,
      name: "Software Development",
      type: "SERVICE",
      description: "Full-stack development uren",
      unit: "hour",
      rate: "95.00",
      isActive: true,
      organizationId: orgId,
      createdAt: daysAgo(180),
      updatedAt: now,
    },
    {
      id: itemIds.design,
      name: "UI/UX Design",
      type: "SERVICE",
      description: "Interface design en prototyping",
      unit: "hour",
      rate: "80.00",
      isActive: true,
      organizationId: orgId,
      createdAt: daysAgo(180),
      updatedAt: now,
    },
    {
      id: itemIds.ai,
      name: "AI Token Usage",
      type: "AI_TOKEN",
      description: "Claude / GPT API kosten",
      unit: "1k tokens",
      rate: "0.02",
      isActive: true,
      organizationId: orgId,
      createdAt: daysAgo(60),
      updatedAt: now,
    },
    {
      id: itemIds.hosting,
      name: "Cloud Hosting",
      type: "API_COST",
      description: "Vercel + Neon maandelijks",
      unit: "month",
      rate: "49.00",
      isActive: true,
      organizationId: orgId,
      createdAt: daysAgo(180),
      updatedAt: now,
    },
  ])

  // ─── Bank Accounts ─────────────────────────────────────────
  const bankIds = { main: id(), usd: id() }

  await db.insert(schema.bankAccounts).values([
    {
      id: bankIds.main,
      name: "Hoofdrekening EUR",
      bankName: "ABN AMRO",
      accountNumber: "NL91ABNA0417164300",
      iban: "NL91ABNA0417164300",
      type: "CHECKING",
      currency: "EUR",
      balance: "48250.00",
      isDefault: true,
      organizationId: orgId,
      createdAt: daysAgo(180),
      updatedAt: now,
    },
    {
      id: bankIds.usd,
      name: "USD Account",
      bankName: "Wise",
      accountNumber: "WISE-USD-9812",
      type: "CHECKING",
      currency: "USD",
      balance: "12400.00",
      isDefault: false,
      organizationId: orgId,
      createdAt: daysAgo(90),
      updatedAt: now,
    },
  ])

  // ─── Invoices ──────────────────────────────────────────────
  const invIds = { inv001: id(), inv002: id(), inv003: id(), inv004: id() }

  await db.insert(schema.invoices).values([
    {
      id: invIds.inv001,
      number: "INV-2025-001",
      title: "Website Redesign — Fase 1",
      status: "PAID",
      clientId: clientIds.acme,
      organizationId: orgId,
      subtotal: "7600.00",
      taxRate: "21.00",
      taxAmount: "1596.00",
      total: "9196.00",
      amountPaid: "9196.00",
      amountDue: "0.00",
      issueDate: daysAgo(90),
      dueDate: daysAgo(60),
      paidAt: daysAgo(55),
      createdAt: daysAgo(90),
      updatedAt: daysAgo(55),
    },
    {
      id: invIds.inv002,
      number: "INV-2025-002",
      title: "AI Dashboard Development",
      status: "SENT",
      clientId: clientIds.nova,
      organizationId: orgId,
      subtotal: "11400.00",
      taxRate: "21.00",
      taxAmount: "2394.00",
      total: "13794.00",
      amountPaid: "0.00",
      amountDue: "13794.00",
      issueDate: daysAgo(30),
      dueDate: daysFromNow(14),
      createdAt: daysAgo(30),
      updatedAt: daysAgo(30),
    },
    {
      id: invIds.inv003,
      number: "INV-2025-003",
      title: "Mobile App — Sprint 3 & 4",
      status: "PARTIAL",
      clientId: clientIds.peak,
      organizationId: orgId,
      subtotal: "8550.00",
      taxRate: "21.00",
      taxAmount: "1795.50",
      total: "10345.50",
      amountPaid: "5000.00",
      amountDue: "5345.50",
      issueDate: daysAgo(45),
      dueDate: daysAgo(15),
      createdAt: daysAgo(45),
      updatedAt: daysAgo(10),
    },
    {
      id: invIds.inv004,
      number: "INV-2025-004",
      title: "Hosting & Maintenance — Q2",
      status: "DRAFT",
      clientId: clientIds.nova,
      organizationId: orgId,
      subtotal: "588.00",
      taxRate: "21.00",
      taxAmount: "123.48",
      total: "711.48",
      amountPaid: "0.00",
      amountDue: "711.48",
      issueDate: now,
      dueDate: daysFromNow(30),
      createdAt: now,
      updatedAt: now,
    },
  ])

  await db.insert(schema.invoiceItems).values([
    // INV-001
    { id: id(), invoiceId: invIds.inv001, description: "Frontend development (80h)", hours: "80", rate: "95.00", amount: "7600.00", sortOrder: 0 },
    // INV-002
    { id: id(), invoiceId: invIds.inv002, description: "AI dashboard — backend (60h)", hours: "60", rate: "95.00", amount: "5700.00", sortOrder: 0 },
    { id: id(), invoiceId: invIds.inv002, description: "UI/UX design (60h)", hours: "60", rate: "80.00", amount: "4800.00", sortOrder: 1 },
    { id: id(), invoiceId: invIds.inv002, description: "AI token usage (45k tokens)", hours: "45", rate: "20.00", amount: "900.00", sortOrder: 2 },
    // INV-003
    { id: id(), invoiceId: invIds.inv003, description: "React Native development (90h)", hours: "90", rate: "95.00", amount: "8550.00", sortOrder: 0 },
    // INV-004
    { id: id(), invoiceId: invIds.inv004, description: "Vercel Pro + Neon (12 maanden)", hours: "12", rate: "49.00", amount: "588.00", sortOrder: 0 },
  ])

  // ─── Payments ──────────────────────────────────────────────
  await db.insert(schema.payments).values([
    {
      id: id(),
      number: "PAY-2025-001",
      amount: "9196.00",
      method: "BANK_TRANSFER",
      status: "COMPLETED",
      invoiceId: invIds.inv001,
      clientId: clientIds.acme,
      bankAccountId: bankIds.usd,
      organizationId: orgId,
      receivedAt: daysAgo(55),
      createdAt: daysAgo(55),
    },
    {
      id: id(),
      number: "PAY-2025-002",
      amount: "5000.00",
      method: "BANK_TRANSFER",
      status: "COMPLETED",
      invoiceId: invIds.inv003,
      clientId: clientIds.peak,
      bankAccountId: bankIds.main,
      organizationId: orgId,
      receivedAt: daysAgo(10),
      createdAt: daysAgo(10),
    },
  ])

  // ─── Proposals ─────────────────────────────────────────────
  const propId = id()
  await db.insert(schema.proposals).values({
    id: propId,
    number: "PROP-2025-001",
    title: "E-commerce Platform — Volledig Traject",
    description: "Complete ontwikkeling van een e-commerce platform inclusief CMS, checkout en analytics.",
    status: "SENT",
    clientId: clientIds.delta,
    organizationId: orgId,
    subtotal: "28500.00",
    taxRate: "21.00",
    taxAmount: "5985.00",
    total: "34485.00",
    validUntil: daysFromNow(30),
    sentAt: daysAgo(3),
    createdAt: daysAgo(7),
    updatedAt: daysAgo(3),
  })

  await db.insert(schema.proposalItems).values([
    { id: id(), proposalId: propId, description: "Discovery & architectuur (20h)", hours: "20", rate: "95.00", amount: "1900.00", sortOrder: 0 },
    { id: id(), proposalId: propId, description: "Backend development (160h)", hours: "160", rate: "95.00", amount: "15200.00", sortOrder: 1 },
    { id: id(), proposalId: propId, description: "Frontend & design (120h)", hours: "120", rate: "80.00", amount: "9600.00", sortOrder: 2 },
    { id: id(), proposalId: propId, description: "Testing & deployment (20h)", hours: "20", rate: "95.00", amount: "1900.00", sortOrder: 3 },
  ])

  // ─── Estimates ─────────────────────────────────────────────
  const estId = id()
  await db.insert(schema.estimates).values({
    id: estId,
    number: "EST-2025-001",
    title: "API Integratie — Stripe + Mollie",
    status: "ACCEPTED",
    clientId: clientIds.nova,
    organizationId: orgId,
    subtotal: "3800.00",
    taxRate: "21.00",
    taxAmount: "798.00",
    total: "4598.00",
    validUntil: daysAgo(5),
    createdAt: daysAgo(30),
    updatedAt: daysAgo(20),
  })

  await db.insert(schema.estimateItems).values([
    { id: id(), estimateId: estId, description: "Stripe webhook implementatie (24h)", hours: "24", rate: "95.00", amount: "2280.00", sortOrder: 0 },
    { id: id(), estimateId: estId, description: "Mollie koppeling (16h)", hours: "16", rate: "95.00", amount: "1520.00", sortOrder: 1 },
  ])

  // ─── Expenses ──────────────────────────────────────────────
  await db.insert(schema.expenses).values([
    {
      id: id(),
      description: "Vercel Pro abonnement",
      amount: "20.00",
      category: "SOFTWARE",
      vendor: "Vercel Inc.",
      status: "PAID",
      organizationId: orgId,
      date: daysAgo(5),
      createdAt: daysAgo(5),
      updatedAt: daysAgo(5),
    },
    {
      id: id(),
      description: "Neon database — Pro plan",
      amount: "19.00",
      category: "SOFTWARE",
      vendor: "Neon Tech",
      status: "PAID",
      organizationId: orgId,
      date: daysAgo(5),
      createdAt: daysAgo(5),
      updatedAt: daysAgo(5),
    },
    {
      id: id(),
      description: "Freelancer design review",
      amount: "480.00",
      category: "CONTRACTOR",
      vendor: "Anna Freelance",
      status: "APPROVED",
      organizationId: orgId,
      date: daysAgo(14),
      createdAt: daysAgo(14),
      updatedAt: daysAgo(14),
    },
    {
      id: id(),
      description: "LinkedIn Ads — Q2 campagne",
      amount: "750.00",
      category: "MARKETING",
      status: "PENDING",
      organizationId: orgId,
      date: daysAgo(2),
      createdAt: daysAgo(2),
      updatedAt: daysAgo(2),
    },
    {
      id: id(),
      description: "Kantoorhuur Amsterdam",
      amount: "1200.00",
      category: "OFFICE",
      vendor: "Spaces B.V.",
      status: "PAID",
      organizationId: orgId,
      date: daysAgo(30),
      createdAt: daysAgo(30),
      updatedAt: daysAgo(30),
    },
  ])

  // ─── Credits ───────────────────────────────────────────────
  await db.insert(schema.credits).values({
    id: id(),
    number: "CRED-2025-001",
    description: "Creditnota — bug fix correctie INV-001",
    amount: "380.00",
    remaining: "380.00",
    status: "ACTIVE",
    reason: "Afrekeningscorrectie na oplevering",
    organizationId: orgId,
    issuedAt: daysAgo(40),
    expiresAt: daysFromNow(60),
    createdAt: daysAgo(40),
  })

  // ─── Loans ─────────────────────────────────────────────────
  await db.insert(schema.loans).values({
    id: id(),
    name: "Groeikrediet 2024",
    lender: "ING Business",
    amount: "50000.00",
    remainingBalance: "38500.00",
    interestRate: "4.20",
    monthlyPayment: "960.00",
    startDate: daysAgo(365),
    endDate: daysFromNow(1825),
    status: "ACTIVE",
    notes: "Zakelijk groeikrediet voor team uitbreiding",
    organizationId: orgId,
    createdAt: daysAgo(365),
    updatedAt: daysAgo(30),
  })

  // ─── Chart of Accounts ─────────────────────────────────────
  const accountIds = {
    bank: id(), receivable: id(), revenue: id(),
    expense: id(), tax: id(), equity: id(),
  }

  await db.insert(schema.chartOfAccounts).values([
    { id: accountIds.bank, code: "1000", name: "Bank — ABN AMRO EUR", type: "ASSET", subtype: "Cash", isActive: true, organizationId: orgId },
    { id: accountIds.receivable, code: "1300", name: "Debiteuren", type: "ASSET", subtype: "Receivable", isActive: true, organizationId: orgId },
    { id: accountIds.revenue, code: "8000", name: "Omzet Diensten", type: "REVENUE", isActive: true, organizationId: orgId },
    { id: accountIds.expense, code: "4000", name: "Operationele Kosten", type: "EXPENSE", isActive: true, organizationId: orgId },
    { id: accountIds.tax, code: "1700", name: "BTW afdracht", type: "LIABILITY", isActive: true, organizationId: orgId },
    { id: accountIds.equity, code: "2000", name: "Eigen Vermogen", type: "EQUITY", isActive: true, organizationId: orgId },
  ])

  // ─── Ledger Entries ────────────────────────────────────────
  await db.insert(schema.ledgerEntries).values([
    {
      id: id(),
      date: daysAgo(55),
      description: "Ontvangst INV-2025-001 — Acme Corp",
      debit: "9196.00",
      credit: "0.00",
      accountId: accountIds.bank,
      reference: "INV-2025-001",
      organizationId: orgId,
      createdAt: daysAgo(55),
    },
    {
      id: id(),
      date: daysAgo(55),
      description: "Omzet INV-2025-001 — Acme Corp",
      debit: "0.00",
      credit: "7600.00",
      accountId: accountIds.revenue,
      reference: "INV-2025-001",
      organizationId: orgId,
      createdAt: daysAgo(55),
    },
    {
      id: id(),
      date: daysAgo(5),
      description: "Vercel + Neon kosten april",
      debit: "39.00",
      credit: "0.00",
      accountId: accountIds.expense,
      reference: "EXP-APR-2025",
      organizationId: orgId,
      createdAt: daysAgo(5),
    },
  ])

  // ─── Transactions ──────────────────────────────────────────
  await db.insert(schema.transactions).values([
    {
      id: id(),
      type: "DEPOSIT",
      amount: "9196.00",
      description: "Betaling Acme Corp — INV-2025-001",
      reference: "PAY-2025-001",
      bankAccountId: bankIds.usd,
      date: daysAgo(55),
      createdAt: daysAgo(55),
    },
    {
      id: id(),
      type: "DEPOSIT",
      amount: "5000.00",
      description: "Deelbetaling Peak Ventures — INV-2025-003",
      reference: "PAY-2025-002",
      bankAccountId: bankIds.main,
      date: daysAgo(10),
      createdAt: daysAgo(10),
    },
    {
      id: id(),
      type: "WITHDRAWAL",
      amount: "1200.00",
      description: "Kantoorhuur Spaces B.V.",
      bankAccountId: bankIds.main,
      date: daysAgo(30),
      createdAt: daysAgo(30),
    },
    {
      id: id(),
      type: "FEE",
      amount: "39.00",
      description: "Vercel + Neon abonnement",
      bankAccountId: bankIds.main,
      date: daysAgo(5),
      createdAt: daysAgo(5),
    },
  ])

  console.log("✅ Demo data succesvol ingevoerd!")
  console.log("   - 1 organisatie (Logix Layer N.V.)")
  console.log("   - 2 leden")
  console.log("   - 4 klanten")
  console.log("   - 4 items")
  console.log("   - 4 facturen + items")
  console.log("   - 2 betalingen")
  console.log("   - 1 voorstel + items")
  console.log("   - 1 offerte + items")
  console.log("   - 5 uitgaven")
  console.log("   - 1 creditnota")
  console.log("   - 1 lening")
  console.log("   - 6 grootboekrekeningen")
  console.log("   - 3 journaalposten")
  console.log("   - 2 bankrekeningen + 4 transacties")
  process.exit(0)
}

seed().catch((err) => {
  console.error("❌ Seed mislukt:", err)
  process.exit(1)
})
