/**
 * Seed script for Project Management demo data
 * Run: npx tsx scripts/seed-pm.ts
 */

import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { readFileSync } from "fs"
import { resolve } from "path"
import { randomUUID } from "crypto"

// Load .env.local manually (no dotenv dependency)
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
  const db = drizzle(sql)

  // Get existing clients
  const clientRows = await sql`SELECT id, name FROM clients LIMIT 5`
  if (clientRows.length === 0) {
    console.error("No clients found. Create clients first.")
    process.exit(1)
  }
  const clients = clientRows as { id: string; name: string }[]
  console.log(`Found ${clients.length} clients`)

  // Get org id
  const orgRows = await sql`SELECT id FROM organizations LIMIT 1`
  const orgId = (orgRows[0] as any)?.id || "org-1"

  // Create Projects
  const projectData = [
    {
      id: randomUUID(),
      name: "Website Redesign",
      description: "Complete redesign of client website with modern UI/UX",
      status: "ACTIVE",
      priority: "HIGH",
      clientId: clients[0].id,
      organizationId: orgId,
      budget: "25000",
      progress: 65,
      startDate: new Date("2026-01-15"),
      deadline: new Date("2026-05-30"),
    },
    {
      id: randomUUID(),
      name: "API Integration Platform",
      description: "Build microservice architecture for payment processing",
      status: "ACTIVE",
      priority: "CRITICAL",
      clientId: clients[Math.min(1, clients.length - 1)].id,
      organizationId: orgId,
      budget: "48000",
      progress: 35,
      startDate: new Date("2026-02-01"),
      deadline: new Date("2026-07-15"),
    },
    {
      id: randomUUID(),
      name: "Mobile App Development",
      description: "Cross-platform mobile app for customer portal",
      status: "PLANNING",
      priority: "MEDIUM",
      clientId: clients[Math.min(2, clients.length - 1)].id,
      organizationId: orgId,
      budget: "35000",
      progress: 10,
      startDate: new Date("2026-04-01"),
      deadline: new Date("2026-09-30"),
    },
    {
      id: randomUUID(),
      name: "Data Migration",
      description: "Migrate legacy database to new cloud infrastructure",
      status: "COMPLETED",
      priority: "HIGH",
      clientId: clients[0].id,
      organizationId: orgId,
      budget: "12000",
      progress: 100,
      startDate: new Date("2025-11-01"),
      deadline: new Date("2026-02-28"),
    },
    {
      id: randomUUID(),
      name: "Security Audit & Compliance",
      description: "Full security audit and GDPR compliance implementation",
      status: "ON_HOLD",
      priority: "LOW",
      clientId: clients[Math.min(1, clients.length - 1)].id,
      organizationId: orgId,
      budget: "8500",
      progress: 20,
      startDate: new Date("2026-03-01"),
      deadline: new Date("2026-06-30"),
    },
  ]

  for (const p of projectData) {
    await sql.query(
      `INSERT INTO projects (id, name, description, status, priority, client_id, organization_id, budget, progress, start_date, deadline, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
       ON CONFLICT (id) DO NOTHING`,
      [p.id, p.name, p.description, p.status, p.priority, p.clientId, p.organizationId, p.budget, p.progress, p.startDate, p.deadline]
    )
    console.log(`✓ Project: ${p.name}`)
  }

  // Create Work Orders
  const workOrderData = [
    { title: "Frontend UI Components", projectId: projectData[0].id, clientId: projectData[0].clientId, status: "COMPLETED", hours: "24", rate: "85", number: "WO-0001" },
    { title: "Backend API Development", projectId: projectData[0].id, clientId: projectData[0].clientId, status: "IN_PROGRESS", hours: "40", rate: "95", number: "WO-0002" },
    { title: "Payment Gateway Integration", projectId: projectData[1].id, clientId: projectData[1].clientId, status: "IN_PROGRESS", hours: "32", rate: "110", number: "WO-0003" },
    { title: "Database Schema Design", projectId: projectData[1].id, clientId: projectData[1].clientId, status: "COMPLETED", hours: "16", rate: "95", number: "WO-0004" },
    { title: "API Documentation", projectId: projectData[1].id, clientId: projectData[1].clientId, status: "OPEN", hours: "8", rate: "75", number: "WO-0005" },
    { title: "UX Research & Wireframes", projectId: projectData[2].id, clientId: projectData[2].clientId, status: "OPEN", hours: "20", rate: "90", number: "WO-0006" },
    { title: "Legacy Data Export Scripts", projectId: projectData[3].id, clientId: projectData[3].clientId, status: "COMPLETED", hours: "18", rate: "85", number: "WO-0007" },
    { title: "Security Scanning Setup", projectId: projectData[4].id, clientId: projectData[4].clientId, status: "OPEN", hours: "12", rate: "100", number: "WO-0008" },
  ]

  for (const wo of workOrderData) {
    const id = randomUUID()
    await sql.query(
      `INSERT INTO work_orders (id, number, title, status, project_id, client_id, organization_id, hours, rate, date, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW(), NOW())
       ON CONFLICT (id) DO NOTHING`,
      [id, wo.number, wo.title, wo.status, wo.projectId, wo.clientId, orgId, wo.hours, wo.rate]
    )
    console.log(`✓ Work Order: ${wo.number} — ${wo.title}`)
  }

  // Create Tasks
  const taskData = [
    { title: "Design homepage mockup", status: "DONE", priority: "HIGH", projectId: projectData[0].id, clientId: projectData[0].clientId, dueDate: new Date("2026-02-15") },
    { title: "Implement responsive navigation", status: "DONE", priority: "HIGH", projectId: projectData[0].id, clientId: projectData[0].clientId, dueDate: new Date("2026-02-28") },
    { title: "Build product listing page", status: "IN_PROGRESS", priority: "MEDIUM", projectId: projectData[0].id, clientId: projectData[0].clientId, dueDate: new Date("2026-04-15") },
    { title: "Setup CI/CD pipeline", status: "IN_PROGRESS", priority: "HIGH", projectId: projectData[0].id, clientId: projectData[0].clientId, dueDate: new Date("2026-04-20") },
    { title: "Write E2E tests", status: "TODO", priority: "MEDIUM", projectId: projectData[0].id, clientId: projectData[0].clientId, dueDate: new Date("2026-05-01") },
    { title: "Design payment flow UX", status: "DONE", priority: "CRITICAL", projectId: projectData[1].id, clientId: projectData[1].clientId, dueDate: new Date("2026-02-20") },
    { title: "Implement Stripe webhook handlers", status: "IN_PROGRESS", priority: "CRITICAL", projectId: projectData[1].id, clientId: projectData[1].clientId, dueDate: new Date("2026-04-30") },
    { title: "Build transaction reconciliation", status: "TODO", priority: "HIGH", projectId: projectData[1].id, clientId: projectData[1].clientId, dueDate: new Date("2026-05-15") },
    { title: "Setup rate limiting & throttling", status: "TODO", priority: "MEDIUM", projectId: projectData[1].id, clientId: projectData[1].clientId, dueDate: new Date("2026-05-30") },
    { title: "Load testing & optimization", status: "TODO", priority: "HIGH", projectId: projectData[1].id, clientId: projectData[1].clientId, dueDate: new Date("2026-06-15") },
    { title: "Create user research plan", status: "IN_PROGRESS", priority: "MEDIUM", projectId: projectData[2].id, clientId: projectData[2].clientId, dueDate: new Date("2026-04-20") },
    { title: "Design app wireframes in Figma", status: "TODO", priority: "HIGH", projectId: projectData[2].id, clientId: projectData[2].clientId, dueDate: new Date("2026-05-10") },
    { title: "Verify migrated data integrity", status: "DONE", priority: "CRITICAL", projectId: projectData[3].id, clientId: projectData[3].clientId, dueDate: new Date("2026-02-20") },
    { title: "GDPR privacy policy review", status: "TODO", priority: "MEDIUM", projectId: projectData[4].id, clientId: projectData[4].clientId, dueDate: new Date("2026-05-30") },
    { title: "Penetration test report", status: "TODO", priority: "HIGH", projectId: projectData[4].id, clientId: projectData[4].clientId, dueDate: new Date("2026-06-15") },
  ]

  for (const t of taskData) {
    const id = randomUUID()
    await sql.query(
      `INSERT INTO tasks (id, title, status, priority, project_id, client_id, organization_id, due_date, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       ON CONFLICT (id) DO NOTHING`,
      [id, t.title, t.status, t.priority, t.projectId, t.clientId, orgId, t.dueDate]
    )
    console.log(`✓ Task: ${t.title}`)
  }

  console.log("\n✅ Done! Seeded 5 projects, 8 work orders, 15 tasks")
}

seed().catch(console.error)
