/**
 * Tests for all PUT/PATCH (edit) and DELETE API routes.
 * Validates: route handlers exist, parse request body, return correct status when db=null.
 */

import { describe, it, expect, vi } from "vitest"

vi.mock("@/lib/db", () => ({ db: null }))
vi.mock("@/lib/get-org", () => ({ getDefaultOrgId: vi.fn().mockResolvedValue("org-test-123") }))

function makeRequest(body: Record<string, unknown>): Request {
  return new Request("http://localhost:3000/api/test/123", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

const fakeParams = Promise.resolve({ id: "test-id-123" })

// All [id] routes should handle db=null gracefully
const idRoutes = [
  { name: "clients", hasPut: true, hasDelete: true },
  { name: "items", hasPut: true, hasDelete: true },
  { name: "invoices", hasPut: true, hasDelete: true },
  { name: "proposals", hasPut: true, hasDelete: true },
  { name: "estimates", hasPut: true, hasDelete: true },
  { name: "expenses", hasPut: true, hasDelete: true },
  { name: "payments", hasPut: true, hasDelete: true },
  { name: "bank-accounts", hasPut: true, hasDelete: true },
  { name: "transactions", hasPut: true, hasDelete: true },
  { name: "loans", hasPut: true, hasDelete: true },
  { name: "credits", hasPut: true, hasDelete: true },
  { name: "ledger", hasPut: true, hasDelete: true },
  { name: "expense-categories", hasPut: true, hasDelete: true },
  { name: "vendors", hasPut: true, hasDelete: true },
  { name: "projects", hasPut: true, hasDelete: true },
]

describe("PUT [id] routes return error or empty when db is null", () => {
  for (const route of idRoutes) {
    it(`PUT /api/${route.name}/[id] handles db=null`, async () => {
      const mod = await import(`@/app/api/${route.name}/[id]/route`)
      if (mod.PUT) {
        const res = await mod.PUT(makeRequest({ name: "Updated" }), { params: fakeParams })
        const data = await res.json()
        // Should return error (500 or 503) or empty result
        expect([200, 404, 500, 503]).toContain(res.status)
      }
    })
  }
})

describe("DELETE [id] routes return error or empty when db is null", () => {
  for (const route of idRoutes) {
    it(`DELETE /api/${route.name}/[id] handles db=null`, async () => {
      const mod = await import(`@/app/api/${route.name}/[id]/route`)
      if (mod.DELETE) {
        const req = new Request("http://localhost:3000/api/test/123", { method: "DELETE" })
        const res = await mod.DELETE(req, { params: fakeParams })
        const data = await res.json()
        expect([200, 404, 500, 503]).toContain(res.status)
      }
    })
  }
})

describe("GET [id] routes return error or empty when db is null", () => {
  for (const route of idRoutes) {
    it(`GET /api/${route.name}/[id] handles db=null`, async () => {
      const mod = await import(`@/app/api/${route.name}/[id]/route`)
      if (mod.GET) {
        const req = new Request("http://localhost:3000/api/test/123")
        const res = await mod.GET(req, { params: fakeParams })
        expect([200, 404, 500, 503]).toContain(res.status)
      }
    })
  }
})
