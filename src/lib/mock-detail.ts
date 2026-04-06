/**
 * mock-detail.ts
 * WAT:    Gedetailleerde mock data voor detail pages
 * WAAROM: Volledige objecten met line items voor detail/edit/preview
 */

export const proposalDetail = {
  id: "p1", number: "PROP-0001", title: "Website Redesign & Development", description: "Complete redesign and development of TechFlow Solutions corporate website. Includes new design system, responsive implementation, CMS integration, and performance optimization.",
  status: "APPROVED",
  client: { id: "c1", name: "TechFlow Solutions", company: "TechFlow Solutions B.V.", email: "info@techflow.io", phone: "+31 20 123 4567", address: "Herengracht 100, Amsterdam" },
  items: [
    { id: "pi1", description: "Discovery & Research", hours: 16, rate: 65, amount: 1040 },
    { id: "pi2", description: "UI/UX Design (Figma)", hours: 40, rate: 55, amount: 2200 },
    { id: "pi3", description: "Frontend Development (Next.js)", hours: 80, rate: 65, amount: 5200 },
    { id: "pi4", description: "Backend & CMS Integration", hours: 32, rate: 65, amount: 2080 },
    { id: "pi5", description: "Testing & QA", hours: 16, rate: 65, amount: 1040 },
    { id: "pi6", description: "Deployment & Go-Live Support", hours: 12, rate: 65, amount: 780 },
  ],
  subtotal: 12340, taxRate: 0, taxAmount: 0, total: 12340,
  date: "2026-03-15", validUntil: "2026-04-15", approvedAt: "2026-03-18",
  notes: "Payment in 2 milestones: 50% upfront, 50% on delivery. Estimated timeline: 6-8 weeks.",
}

export const estimateDetail = {
  id: "e1", number: "EST-0001", title: "E-commerce Platform", description: "Full e-commerce platform with product catalog, shopping cart, checkout, and admin dashboard.",
  status: "ACCEPTED",
  client: { id: "c1", name: "TechFlow Solutions", company: "TechFlow Solutions B.V.", email: "info@techflow.io", phone: "+31 20 123 4567", address: "Herengracht 100, Amsterdam" },
  items: [
    { id: "ei1", description: "Product catalog & search", hours: 40, rate: 65, amount: 2600 },
    { id: "ei2", description: "Shopping cart & checkout flow", hours: 56, rate: 65, amount: 3640 },
    { id: "ei3", description: "Payment integration (Stripe)", hours: 24, rate: 65, amount: 1560 },
    { id: "ei4", description: "Admin dashboard", hours: 48, rate: 65, amount: 3120 },
    { id: "ei5", description: "Order management system", hours: 32, rate: 65, amount: 2080 },
    { id: "ei6", description: "Shipping & notifications", hours: 24, rate: 65, amount: 1560 },
    { id: "ei7", description: "Testing, QA & deployment", hours: 25, rate: 65, amount: 1625 },
  ],
  subtotal: 16185, taxRate: 0, taxAmount: 0, total: 16185,
  date: "2026-03-20", validUntil: "2026-04-20",
  notes: "Estimate based on standard hourly rate. Final scope may vary after discovery phase.",
}

export const invoiceDetail = {
  id: "i3", number: "INV-0003", title: "Blockchain Gateway - Milestone 1", description: "First milestone delivery of the blockchain payment gateway integration.",
  status: "PARTIAL",
  client: { id: "c4", name: "BlockPay Systems", company: "BlockPay Systems Ltd", email: "admin@blockpay.io", phone: "+44 20 7946 0958", address: "1 Canary Wharf, London" },
  items: [
    { id: "ii1", description: "Smart contract development", hours: 60, rate: 95, amount: 5700 },
    { id: "ii2", description: "API gateway integration", hours: 40, rate: 65, amount: 2600 },
    { id: "ii3", description: "Testing & security audit", hours: 30, rate: 75, amount: 2250 },
    { id: "ii4", description: "Documentation & handover", hours: 20, rate: 65, amount: 1300 },
    { id: "ii5", description: "Deployment & monitoring setup", hours: 15, rate: 75, amount: 1125 },
  ],
  subtotal: 12975, taxRate: 0, taxAmount: 0, total: 12975,
  amountPaid: 7500, amountDue: 5475,
  issueDate: "2026-03-15", dueDate: "2026-04-15",
  notes: "Payment received: $7,500 via bank transfer on Mar 25. Remaining balance due by Apr 15.",
  payments: [
    { id: "pay2", number: "PAY-0002", amount: 7500, method: "BANK_TRANSFER", date: "2026-03-25", status: "COMPLETED" },
  ],
}
