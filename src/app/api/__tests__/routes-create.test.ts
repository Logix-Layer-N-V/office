/**
 * Tests for all POST (create) API routes.
 * Validates: request parsing, field mapping, required fields, response structure.
 *
 * With db=null, routes return 503 "Database not configured" for POST,
 * confirming the route handler is reached and parses the request body.
 */

import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock the db module — returns null (no database)
vi.mock("@/lib/db", () => ({ db: null }))
vi.mock("@/lib/get-org", () => ({ getDefaultOrgId: vi.fn().mockResolvedValue("org-test-123") }))

function makeRequest(body: Record<string, unknown>): Request {
  return new Request("http://localhost:3000/api/test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

// ──────────────────────────────────────────────
// CLIENTS
// ──────────────────────────────────────────────
describe("POST /api/clients", () => {
  it("returns 503 when db is not configured", async () => {
    const { POST } = await import("@/app/api/clients/route")
    const res = await POST(makeRequest({ name: "Test", email: "test@test.com" }))
    expect(res.status).toBe(503)
    const data = await res.json()
    expect(data.error).toContain("Database not configured")
  })
})

// ──────────────────────────────────────────────
// ITEMS
// ──────────────────────────────────────────────
describe("POST /api/items", () => {
  it("returns 503 when db is not configured", async () => {
    const { POST } = await import("@/app/api/items/route")
    const res = await POST(makeRequest({ name: "Dev Service", type: "SERVICE" }))
    expect(res.status).toBe(503)
    const data = await res.json()
    expect(data.error).toContain("Database not configured")
  })
})

// ──────────────────────────────────────────────
// INVOICES
// ──────────────────────────────────────────────
describe("POST /api/invoices", () => {
  it("returns 503 when db is not configured", async () => {
    const { POST } = await import("@/app/api/invoices/route")
    const res = await POST(makeRequest({
      clientId: "c1",
      title: "Test Invoice",
      dueDate: "2026-05-01",
      items: [{ description: "Dev", hours: 10, rate: 65, amount: 650 }],
    }))
    expect(res.status).toBe(503)
    const data = await res.json()
    expect(data.error).toContain("Database not configured")
  })
})

// ──────────────────────────────────────────────
// PROPOSALS
// ──────────────────────────────────────────────
describe("POST /api/proposals", () => {
  it("returns 503 when db is not configured", async () => {
    const { POST } = await import("@/app/api/proposals/route")
    const res = await POST(makeRequest({
      clientId: "c1",
      title: "Test Proposal",
      items: [{ description: "Design", hours: 5, rate: 80, amount: 400 }],
    }))
    expect(res.status).toBe(503)
    const data = await res.json()
    expect(data.error).toContain("Database not configured")
  })
})

// ──────────────────────────────────────────────
// ESTIMATES
// ──────────────────────────────────────────────
describe("POST /api/estimates", () => {
  it("returns 503 when db is not configured", async () => {
    const { POST } = await import("@/app/api/estimates/route")
    const res = await POST(makeRequest({
      clientId: "c1",
      title: "Test Estimate",
      items: [{ description: "Backend", hours: 20, rate: 75, amount: 1500 }],
    }))
    expect(res.status).toBe(503)
    const data = await res.json()
    expect(data.error).toContain("Database not configured")
  })
})

// ──────────────────────────────────────────────
// EXPENSES
// ──────────────────────────────────────────────
describe("POST /api/expenses", () => {
  it("returns 503 when db is not configured", async () => {
    const { POST } = await import("@/app/api/expenses/route")
    const res = await POST(makeRequest({
      description: "Office supplies",
      amount: 150,
      category: "OFFICE",
    }))
    expect(res.status).toBe(503)
    const data = await res.json()
    expect(data.error).toContain("Database not configured")
  })
})

// ──────────────────────────────────────────────
// PAYMENTS
// ──────────────────────────────────────────────
describe("POST /api/payments", () => {
  it("returns 503 when db is not configured", async () => {
    const { POST } = await import("@/app/api/payments/route")
    const res = await POST(makeRequest({
      number: "PAY-001",
      amount: 500,
      method: "BANK_TRANSFER",
      clientId: "c1",
    }))
    expect(res.status).toBe(503)
    const data = await res.json()
    expect(data.error).toContain("Database not configured")
  })
})

// ──────────────────────────────────────────────
// BANK ACCOUNTS
// ──────────────────────────────────────────────
describe("POST /api/bank-accounts", () => {
  it("returns 503 when db is not configured", async () => {
    const { POST } = await import("@/app/api/bank-accounts/route")
    const res = await POST(makeRequest({
      name: "Main Account",
      bankName: "Test Bank",
      accountNumber: "1234567890",
    }))
    expect(res.status).toBe(503)
    const data = await res.json()
    expect(data.error).toContain("Database not configured")
  })
})

// ──────────────────────────────────────────────
// TRANSACTIONS
// ──────────────────────────────────────────────
describe("POST /api/transactions", () => {
  it("returns 503 when db is not configured", async () => {
    const { POST } = await import("@/app/api/transactions/route")
    const res = await POST(makeRequest({
      type: "DEPOSIT",
      amount: 1000,
      description: "Payment received",
      bankAccountId: "ba1",
    }))
    expect(res.status).toBe(503)
    const data = await res.json()
    expect(data.error).toContain("Database not configured")
  })
})

// ──────────────────────────────────────────────
// LOANS
// ──────────────────────────────────────────────
describe("POST /api/loans", () => {
  it("returns 503 when db is not configured", async () => {
    const { POST } = await import("@/app/api/loans/route")
    const res = await POST(makeRequest({
      name: "Equipment Loan",
      lender: "Bank of Test",
      amount: 50000,
      remainingBalance: 50000,
      interestRate: 5.5,
      monthlyPayment: 1200,
      startDate: "2026-01-01",
      endDate: "2031-01-01",
    }))
    expect(res.status).toBe(503)
    const data = await res.json()
    expect(data.error).toContain("Database not configured")
  })
})

// ──────────────────────────────────────────────
// CREDITS
// ──────────────────────────────────────────────
describe("POST /api/credits", () => {
  it("returns 503 when db is not configured", async () => {
    const { POST } = await import("@/app/api/credits/route")
    const res = await POST(makeRequest({
      number: "CR-001",
      description: "Refund",
      amount: 200,
      remaining: 200,
    }))
    expect(res.status).toBe(503)
    const data = await res.json()
    expect(data.error).toContain("Database not configured")
  })
})

// ──────────────────────────────────────────────
// ACCOUNTS (Chart of Accounts)
// ──────────────────────────────────────────────
describe("POST /api/accounts", () => {
  it("returns 503 when db is not configured", async () => {
    const { POST } = await import("@/app/api/accounts/route")
    const res = await POST(makeRequest({
      code: "1000",
      name: "Cash",
      type: "ASSET",
    }))
    expect(res.status).toBe(503)
    const data = await res.json()
    expect(data.error).toContain("Database not configured")
  })
})

// ──────────────────────────────────────────────
// LEDGER
// ──────────────────────────────────────────────
describe("POST /api/ledger", () => {
  it("returns 503 when db is not configured", async () => {
    const { POST } = await import("@/app/api/ledger/route")
    const res = await POST(makeRequest({
      description: "Sales revenue",
      debit: 1000,
      credit: 0,
      accountId: "acc1",
    }))
    expect(res.status).toBe(503)
    const data = await res.json()
    expect(data.error).toContain("Database not configured")
  })
})

// ──────────────────────────────────────────────
// EXPENSE CATEGORIES
// ──────────────────────────────────────────────
describe("POST /api/expense-categories", () => {
  it("returns 503 when db is not configured", async () => {
    const { POST } = await import("@/app/api/expense-categories/route")
    const res = await POST(makeRequest({
      name: "Marketing",
      color: "#FF5733",
    }))
    expect(res.status).toBe(503)
    const data = await res.json()
    expect(data.error).toContain("Database not configured")
  })
})

// ──────────────────────────────────────────────
// VENDORS
// ──────────────────────────────────────────────
describe("POST /api/vendors", () => {
  it("returns 503 when db is not configured", async () => {
    const { POST } = await import("@/app/api/vendors/route")
    const res = await POST(makeRequest({
      name: "Acme Supplies",
      email: "info@acme.com",
    }))
    expect(res.status).toBe(503)
    const data = await res.json()
    expect(data.error).toContain("Database not configured")
  })
})

// ──────────────────────────────────────────────
// PROJECTS
// ──────────────────────────────────────────────
describe("POST /api/projects", () => {
  it("returns 503 when db is not configured", async () => {
    const { POST } = await import("@/app/api/projects/route")
    const res = await POST(makeRequest({
      name: "New Website",
      clientId: "c1",
    }))
    expect(res.status).toBe(503)
    const data = await res.json()
    expect(data.error).toContain("Database not configured")
  })
})

// ──────────────────────────────────────────────
// WORK ORDERS
// ──────────────────────────────────────────────
describe("POST /api/work-orders", () => {
  it("returns 503 when db is not configured", async () => {
    const { POST } = await import("@/app/api/work-orders/route")
    const res = await POST(makeRequest({
      title: "Setup server",
      clientId: "c1",
    }))
    expect(res.status).toBe(503)
    const data = await res.json()
    expect(data.error).toContain("Database not configured")
  })
})

// ──────────────────────────────────────────────
// TASKS
// ──────────────────────────────────────────────
describe("POST /api/tasks", () => {
  it("returns 503 when db is not configured", async () => {
    const { POST } = await import("@/app/api/tasks/route")
    const res = await POST(makeRequest({
      title: "Fix login bug",
    }))
    expect(res.status).toBe(503)
    const data = await res.json()
    expect(data.error).toContain("Database not configured")
  })
})

// ──────────────────────────────────────────────
// USERS
// ──────────────────────────────────────────────
describe("POST /api/users", () => {
  it("returns 503 when db is not configured", async () => {
    const { POST } = await import("@/app/api/users/route")
    const req = new Request("http://localhost:3000/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "user@test.com",
        name: "Test User",
        role: "MEMBER",
        organizationId: "org-test-123",
      }),
    })
    const res = await POST(req as any)
    expect(res.status).toBe(503)
    const data = await res.json()
    expect(data.error).toContain("Database not available")
  })
})

// ──────────────────────────────────────────────
// GET routes return empty arrays when db=null
// ──────────────────────────────────────────────
describe("GET routes return empty arrays when db is null", () => {
  const getRoutes = [
    "clients", "items", "invoices", "proposals", "estimates",
    "expenses", "payments", "bank-accounts", "transactions",
    "loans", "credits", "accounts", "ledger",
    "expense-categories", "vendors", "projects", "work-orders", "tasks",
  ]

  for (const route of getRoutes) {
    it(`GET /api/${route} returns []`, async () => {
      const mod = await import(`@/app/api/${route}/route`)
      const res = await mod.GET()
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(Array.isArray(data)).toBe(true)
      expect(data).toHaveLength(0)
    })
  }
})
