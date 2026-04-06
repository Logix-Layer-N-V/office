import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  // Create organization
  const org = await prisma.organization.upsert({
    where: { id: "org-logix-layer" },
    update: {},
    create: {
      id: "org-logix-layer",
      name: "Logix Layer N.V.",
      website: "https://logixlayer.com",
      email: "info@logixlayer.com",
      phone: "+31 20 123 4567",
      address: "Amsterdam, Netherlands",
      taxId: "NL123456789B01",
      currency: "USD",
    },
  })

  console.log("Created organization:", org.id)

  // Create clients
  const clients = await Promise.all([
    prisma.client.upsert({
      where: { id: "c1" },
      update: {},
      create: {
        id: "c1",
        name: "TechFlow Solutions",
        email: "info@techflow.io",
        company: "TechFlow Solutions B.V.",
        phone: "+31 20 123 4567",
        address: "Herengracht 100, Amsterdam",
        taxId: "NL123456789B01",
        status: "ACTIVE",
        notes: "Long-term web development client. Prefers bi-weekly sprints.",
        organizationId: org.id,
      },
    }),
    prisma.client.upsert({
      where: { id: "c2" },
      update: {},
      create: {
        id: "c2",
        name: "Green Digital",
        email: "contact@greendigital.nl",
        company: "Green Digital Agency",
        phone: "+31 10 987 6543",
        address: "Coolsingel 50, Rotterdam",
        taxId: "NL987654321B01",
        status: "ACTIVE",
        notes: "Agency partner. CRM module project ongoing.",
        organizationId: org.id,
      },
    }),
    prisma.client.upsert({
      where: { id: "c3" },
      update: {},
      create: {
        id: "c3",
        name: "Nova Finance",
        email: "hello@novafinance.com",
        company: "Nova Finance Corp",
        phone: "+1 212 555 0100",
        address: "350 Fifth Ave, New York",
        taxId: "US-EIN-12-3456789",
        status: "ACTIVE",
        notes: "Fintech client. API integrations. Has overdue invoice.",
        organizationId: org.id,
      },
    }),
    prisma.client.upsert({
      where: { id: "c4" },
      update: {},
      create: {
        id: "c4",
        name: "BlockPay Systems",
        email: "admin@blockpay.io",
        company: "BlockPay Systems Ltd",
        phone: "+44 20 7946 0958",
        address: "1 Canary Wharf, London",
        taxId: "GB-VAT-123456789",
        status: "ACTIVE",
        notes: "Blockchain payment gateway. High-value client. Pays in crypto.",
        organizationId: org.id,
      },
    }),
    prisma.client.upsert({
      where: { id: "c5" },
      update: {},
      create: {
        id: "c5",
        name: "DataStream Analytics",
        email: "ops@datastream.co",
        company: "DataStream Analytics",
        phone: "+1 415 555 0200",
        address: "100 Market St, San Francisco",
        taxId: "US-EIN-98-7654321",
        status: "INACTIVE",
        notes: "Proposal rejected. Follow up Q3.",
        organizationId: org.id,
      },
    }),
  ])

  console.log("Created clients:", clients.length)

  // Create items
  const items = await Promise.all([
    prisma.item.upsert({
      where: { id: "item1" },
      update: {},
      create: {
        id: "item1",
        name: "Web Development",
        type: "SERVICE",
        description: "Full-stack web development (Next.js)",
        unit: "hour",
        rate: 65.0,
        isActive: true,
        organizationId: org.id,
      },
    }),
    prisma.item.upsert({
      where: { id: "item2" },
      update: {},
      create: {
        id: "item2",
        name: "UI/UX Design",
        type: "SERVICE",
        description: "Interface design and prototyping",
        unit: "hour",
        rate: 55.0,
        isActive: true,
        organizationId: org.id,
      },
    }),
    prisma.item.upsert({
      where: { id: "item3" },
      update: {},
      create: {
        id: "item3",
        name: "Technical Consultation",
        type: "SERVICE",
        description: "Architecture review and tech advisory",
        unit: "hour",
        rate: 85.0,
        isActive: true,
        organizationId: org.id,
      },
    }),
    prisma.item.upsert({
      where: { id: "item4" },
      update: {},
      create: {
        id: "item4",
        name: "Code Review & Audit",
        type: "SERVICE",
        description: "Security and performance code audit",
        unit: "hour",
        rate: 75.0,
        isActive: true,
        organizationId: org.id,
      },
    }),
    prisma.item.upsert({
      where: { id: "item5" },
      update: {},
      create: {
        id: "item5",
        name: "DevOps & Deployment",
        type: "SERVICE",
        description: "CI/CD setup, Vercel/AWS deployment",
        unit: "hour",
        rate: 70.0,
        isActive: true,
        organizationId: org.id,
      },
    }),
    prisma.item.upsert({
      where: { id: "item6" },
      update: {},
      create: {
        id: "item6",
        name: "Blockchain Development",
        type: "SERVICE",
        description: "Smart contracts, DeFi, Web3 integration",
        unit: "hour",
        rate: 95.0,
        isActive: true,
        organizationId: org.id,
      },
    }),
    prisma.item.upsert({
      where: { id: "item7" },
      update: {},
      create: {
        id: "item7",
        name: "SaaS Starter Kit",
        type: "PRODUCT",
        description: "Next.js boilerplate with auth, payments, DB",
        unit: "license",
        rate: 2500.0,
        isActive: true,
        organizationId: org.id,
      },
    }),
    prisma.item.upsert({
      where: { id: "item8" },
      update: {},
      create: {
        id: "item8",
        name: "LMS Platform License",
        type: "PRODUCT",
        description: "White-label learning management system",
        unit: "license",
        rate: 5000.0,
        isActive: true,
        organizationId: org.id,
      },
    }),
    prisma.item.upsert({
      where: { id: "item10" },
      update: {},
      create: {
        id: "item10",
        name: "Vercel API Hosting",
        type: "API_COST",
        description: "Serverless function invocations",
        unit: "month",
        rate: 20.0,
        isActive: true,
        organizationId: org.id,
      },
    }),
    prisma.item.upsert({
      where: { id: "item11" },
      update: {},
      create: {
        id: "item11",
        name: "Neon Database",
        type: "API_COST",
        description: "PostgreSQL serverless compute hours",
        unit: "month",
        rate: 19.0,
        isActive: true,
        organizationId: org.id,
      },
    }),
    prisma.item.upsert({
      where: { id: "item15" },
      update: {},
      create: {
        id: "item15",
        name: "Claude API (Opus)",
        type: "AI_TOKEN",
        description: "Anthropic Claude Opus — $15/1M input, $75/1M output",
        unit: "1M tokens",
        rate: 75.0,
        isActive: true,
        organizationId: org.id,
      },
    }),
    prisma.item.upsert({
      where: { id: "item16" },
      update: {},
      create: {
        id: "item16",
        name: "Claude API (Sonnet)",
        type: "AI_TOKEN",
        description: "Anthropic Claude Sonnet — $3/1M input, $15/1M output",
        unit: "1M tokens",
        rate: 15.0,
        isActive: true,
        organizationId: org.id,
      },
    }),
  ])

  console.log("Created items:", items.length)

  // Create proposals
  const proposals = await Promise.all([
    prisma.proposal.upsert({
      where: { id: "p1" },
      update: {},
      create: {
        id: "p1",
        number: "PROP-0001",
        title: "Website Redesign & Development",
        status: "APPROVED",
        clientId: clients[0].id,
        organizationId: org.id,
        subtotal: 12000.0,
        taxAmount: 350.0,
        total: 12350.0,
        createdAt: new Date("2026-03-15"),
      },
    }),
    prisma.proposal.upsert({
      where: { id: "p2" },
      update: {},
      create: {
        id: "p2",
        number: "PROP-0002",
        title: "Mobile App MVP Development",
        status: "SENT",
        clientId: clients[1].id,
        organizationId: org.id,
        subtotal: 28000.0,
        taxAmount: 600.0,
        total: 28600.0,
        createdAt: new Date("2026-03-22"),
      },
    }),
    prisma.proposal.upsert({
      where: { id: "p3" },
      update: {},
      create: {
        id: "p3",
        number: "PROP-0003",
        title: "API Integration Suite",
        status: "DRAFT",
        clientId: clients[2].id,
        organizationId: org.id,
        subtotal: 8200.0,
        taxAmount: 250.0,
        total: 8450.0,
        createdAt: new Date("2026-04-01"),
      },
    }),
    prisma.proposal.upsert({
      where: { id: "p4" },
      update: {},
      create: {
        id: "p4",
        number: "PROP-0004",
        title: "Blockchain Payment Gateway",
        status: "APPROVED",
        clientId: clients[3].id,
        organizationId: org.id,
        subtotal: 44000.0,
        taxAmount: 1000.0,
        total: 45000.0,
        createdAt: new Date("2026-03-10"),
      },
    }),
    prisma.proposal.upsert({
      where: { id: "p5" },
      update: {},
      create: {
        id: "p5",
        number: "PROP-0005",
        title: "Dashboard Analytics Platform",
        status: "REJECTED",
        clientId: clients[4].id,
        organizationId: org.id,
        subtotal: 15200.0,
        taxAmount: 400.0,
        total: 15600.0,
        createdAt: new Date("2026-02-28"),
      },
    }),
  ])

  console.log("Created proposals:", proposals.length)

  // Create invoices
  const invoices = await Promise.all([
    prisma.invoice.upsert({
      where: { id: "i1" },
      update: {},
      create: {
        id: "i1",
        number: "INV-0001",
        title: "Website Redesign - Phase 1",
        status: "PAID",
        clientId: clients[0].id,
        organizationId: org.id,
        subtotal: 6000.0,
        taxAmount: 175.0,
        total: 6175.0,
        amountPaid: 6175.0,
        amountDue: 0,
        issueDate: new Date("2026-03-01"),
        dueDate: new Date("2026-03-31"),
        paidAt: new Date("2026-03-28"),
      },
    }),
    prisma.invoice.upsert({
      where: { id: "i2" },
      update: {},
      create: {
        id: "i2",
        number: "INV-0002",
        title: "Website Redesign - Phase 2",
        status: "SENT",
        clientId: clients[0].id,
        organizationId: org.id,
        subtotal: 6000.0,
        taxAmount: 175.0,
        total: 6175.0,
        amountPaid: 0,
        amountDue: 6175.0,
        issueDate: new Date("2026-03-20"),
        dueDate: new Date("2026-04-20"),
      },
    }),
    prisma.invoice.upsert({
      where: { id: "i3" },
      update: {},
      create: {
        id: "i3",
        number: "INV-0003",
        title: "Blockchain Gateway - Milestone 1",
        status: "PARTIAL",
        clientId: clients[3].id,
        organizationId: org.id,
        subtotal: 14600.0,
        taxAmount: 400.0,
        total: 15000.0,
        amountPaid: 7500.0,
        amountDue: 7500.0,
        issueDate: new Date("2026-03-15"),
        dueDate: new Date("2026-04-15"),
      },
    }),
    prisma.invoice.upsert({
      where: { id: "i4" },
      update: {},
      create: {
        id: "i4",
        number: "INV-0004",
        title: "Security Audit",
        status: "PAID",
        clientId: clients[3].id,
        organizationId: org.id,
        subtotal: 4400.0,
        taxAmount: 150.0,
        total: 4550.0,
        amountPaid: 4550.0,
        amountDue: 0,
        issueDate: new Date("2026-03-10"),
        dueDate: new Date("2026-04-10"),
        paidAt: new Date("2026-03-20"),
      },
    }),
    prisma.invoice.upsert({
      where: { id: "i5" },
      update: {},
      create: {
        id: "i5",
        number: "INV-0005",
        title: "API Integration - Sprint 1",
        status: "OVERDUE",
        clientId: clients[2].id,
        organizationId: org.id,
        subtotal: 4100.0,
        taxAmount: 125.0,
        total: 4225.0,
        amountPaid: 0,
        amountDue: 4225.0,
        issueDate: new Date("2026-02-15"),
        dueDate: new Date("2026-03-15"),
      },
    }),
    prisma.invoice.upsert({
      where: { id: "i6" },
      update: {},
      create: {
        id: "i6",
        number: "INV-0006",
        title: "CRM Module Development",
        status: "DRAFT",
        clientId: clients[1].id,
        organizationId: org.id,
        subtotal: 6300.0,
        taxAmount: 200.0,
        total: 6500.0,
        amountPaid: 0,
        amountDue: 6500.0,
        issueDate: new Date("2026-04-01"),
        dueDate: new Date("2026-05-01"),
      },
    }),
  ])

  console.log("Created invoices:", invoices.length)

  // Create payments
  await Promise.all([
    prisma.payment.upsert({
      where: { id: "pay1" },
      update: {},
      create: {
        id: "pay1",
        number: "PAY-0001",
        amount: 6175.0,
        method: "BANK_TRANSFER",
        status: "COMPLETED",
        clientId: clients[0].id,
        invoiceId: invoices[0].id,
        organizationId: org.id,
        receivedAt: new Date("2026-03-28"),
      },
    }),
    prisma.payment.upsert({
      where: { id: "pay2" },
      update: {},
      create: {
        id: "pay2",
        number: "PAY-0002",
        amount: 7500.0,
        method: "BANK_TRANSFER",
        status: "COMPLETED",
        clientId: clients[3].id,
        invoiceId: invoices[2].id,
        organizationId: org.id,
        receivedAt: new Date("2026-03-25"),
      },
    }),
    prisma.payment.upsert({
      where: { id: "pay3" },
      update: {},
      create: {
        id: "pay3",
        number: "PAY-0003",
        amount: 4550.0,
        method: "CRYPTO",
        status: "COMPLETED",
        clientId: clients[3].id,
        invoiceId: invoices[3].id,
        organizationId: org.id,
        receivedAt: new Date("2026-03-20"),
      },
    }),
    prisma.payment.upsert({
      where: { id: "pay4" },
      update: {},
      create: {
        id: "pay4",
        number: "PAY-0004",
        amount: 4225.0,
        method: "BANK_TRANSFER",
        status: "PENDING",
        clientId: clients[2].id,
        invoiceId: invoices[4].id,
        organizationId: org.id,
        receivedAt: new Date("2026-04-05"),
      },
    }),
  ])

  console.log("Created payments")

  // Create bank accounts
  const bankAccounts = await Promise.all([
    prisma.bankAccount.upsert({
      where: { id: "ba1" },
      update: {},
      create: {
        id: "ba1",
        name: "DSB Business Account (SRD)",
        bankName: "De Surinaamsche Bank",
        accountNumber: "****4521",
        type: "CHECKING",
        currency: "SRD",
        balance: 285000.0,
        isDefault: true,
        organizationId: org.id,
      },
    }),
    prisma.bankAccount.upsert({
      where: { id: "ba2" },
      update: {},
      create: {
        id: "ba2",
        name: "DSB Business Account (USD)",
        bankName: "De Surinaamsche Bank",
        accountNumber: "****8834",
        type: "CHECKING",
        currency: "USD",
        balance: 87450.0,
        isDefault: false,
        organizationId: org.id,
      },
    }),
    prisma.bankAccount.upsert({
      where: { id: "ba3" },
      update: {},
      create: {
        id: "ba3",
        name: "DSB Business Account (EUR)",
        bankName: "De Surinaamsche Bank",
        accountNumber: "****6192",
        type: "CHECKING",
        currency: "EUR",
        balance: 32750.0,
        isDefault: false,
        organizationId: org.id,
      },
    }),
    prisma.bankAccount.upsert({
      where: { id: "ba4" },
      update: {},
      create: {
        id: "ba4",
        name: "USDT Wallet (TRC-20)",
        bankName: "Tron Network",
        accountNumber: "TQn9Y...x7Vk",
        type: "CRYPTO",
        currency: "USDT",
        balance: 12800.0,
        isDefault: false,
        organizationId: org.id,
      },
    }),
  ])

  console.log("Created bank accounts:", bankAccounts.length)

  // Create transactions
  await Promise.all([
    prisma.transaction.upsert({
      where: { id: "t1" },
      update: {},
      create: {
        id: "t1",
        type: "DEPOSIT",
        amount: 6175.0,
        description: "Payment from TechFlow Solutions - INV-0001",
        bankAccountId: bankAccounts[0].id,
        date: new Date("2026-03-28"),
      },
    }),
    prisma.transaction.upsert({
      where: { id: "t2" },
      update: {},
      create: {
        id: "t2",
        type: "DEPOSIT",
        amount: 7500.0,
        description: "Payment from BlockPay Systems - INV-0003",
        bankAccountId: bankAccounts[0].id,
        date: new Date("2026-03-25"),
      },
    }),
    prisma.transaction.upsert({
      where: { id: "t3" },
      update: {},
      create: {
        id: "t3",
        type: "WITHDRAWAL",
        amount: 3200.0,
        description: "Monthly office rent",
        bankAccountId: bankAccounts[0].id,
        date: new Date("2026-03-01"),
      },
    }),
    prisma.transaction.upsert({
      where: { id: "t4" },
      update: {},
      create: {
        id: "t4",
        type: "DEPOSIT",
        amount: 4550.0,
        description: "Payment from BlockPay Systems - INV-0004",
        bankAccountId: bankAccounts[0].id,
        date: new Date("2026-03-20"),
      },
    }),
  ])

  console.log("Created transactions")

  // Create expenses
  await Promise.all([
    prisma.expense.upsert({
      where: { id: "ex1" },
      update: {},
      create: {
        id: "ex1",
        description: "Vercel Pro Plan",
        amount: 240.0,
        category: "SOFTWARE",
        vendor: "Vercel",
        status: "PAID",
        organizationId: org.id,
        date: new Date("2026-03-01"),
      },
    }),
    prisma.expense.upsert({
      where: { id: "ex2" },
      update: {},
      create: {
        id: "ex2",
        description: "GitHub Enterprise",
        amount: 252.0,
        category: "SOFTWARE",
        vendor: "GitHub",
        status: "PAID",
        organizationId: org.id,
        date: new Date("2026-03-01"),
      },
    }),
    prisma.expense.upsert({
      where: { id: "ex3" },
      update: {},
      create: {
        id: "ex3",
        description: "Office Space Rent",
        amount: 3200.0,
        category: "OFFICE",
        vendor: "Paradise Realty",
        status: "PAID",
        organizationId: org.id,
        date: new Date("2026-03-01"),
      },
    }),
    prisma.expense.upsert({
      where: { id: "ex4" },
      update: {},
      create: {
        id: "ex4",
        description: "MacBook Pro M4",
        amount: 3499.0,
        category: "HARDWARE",
        vendor: "Apple",
        status: "APPROVED",
        organizationId: org.id,
        date: new Date("2026-03-15"),
      },
    }),
    prisma.expense.upsert({
      where: { id: "ex5" },
      update: {},
      create: {
        id: "ex5",
        description: "Google Ads Campaign",
        amount: 1500.0,
        category: "MARKETING",
        vendor: "Google",
        status: "PENDING",
        organizationId: org.id,
        date: new Date("2026-03-20"),
      },
    }),
    prisma.expense.upsert({
      where: { id: "ex6" },
      update: {},
      create: {
        id: "ex6",
        description: "Contractor - UI Design",
        amount: 2600.0,
        category: "CONTRACTOR",
        vendor: "DesignPro",
        status: "PAID",
        organizationId: org.id,
        date: new Date("2026-03-10"),
      },
    }),
  ])

  console.log("Created expenses")

  // Create credits
  await Promise.all([
    prisma.credit.upsert({
      where: { id: "cr1" },
      update: {},
      create: {
        id: "cr1",
        number: "CR-0001",
        description: "Overpayment refund - TechFlow",
        amount: 500.0,
        remaining: 500.0,
        status: "ACTIVE",
        organizationId: org.id,
        issuedAt: new Date("2026-03-20"),
      },
    }),
    prisma.credit.upsert({
      where: { id: "cr2" },
      update: {},
      create: {
        id: "cr2",
        number: "CR-0002",
        description: "Service credit - project scope change",
        amount: 1200.0,
        remaining: 0,
        status: "USED",
        organizationId: org.id,
        issuedAt: new Date("2026-02-15"),
      },
    }),
  ])

  console.log("Created credits")

  // Create loans
  await Promise.all([
    prisma.loan.upsert({
      where: { id: "l1" },
      update: {},
      create: {
        id: "l1",
        name: "Business Equipment Loan",
        lender: "Republic Bank",
        amount: 25000.0,
        remainingBalance: 18750.0,
        interestRate: 5.5,
        monthlyPayment: 478.0,
        startDate: new Date("2025-06-01"),
        endDate: new Date("2030-06-01"),
        status: "ACTIVE",
        organizationId: org.id,
      },
    }),
    prisma.loan.upsert({
      where: { id: "l2" },
      update: {},
      create: {
        id: "l2",
        name: "Working Capital Line",
        lender: "First Citizens Bank",
        amount: 50000.0,
        remainingBalance: 35000.0,
        interestRate: 7.2,
        monthlyPayment: 990.0,
        startDate: new Date("2025-09-01"),
        endDate: new Date("2029-09-01"),
        status: "ACTIVE",
        organizationId: org.id,
      },
    }),
  ])

  console.log("Created loans")

  // Create chart of accounts
  const accounts = await Promise.all([
    prisma.chartOfAccount.upsert({
      where: { code_organizationId: { code: "1000", organizationId: org.id } },
      update: {},
      create: {
        code: "1000",
        name: "Cash",
        type: "ASSET",
        organizationId: org.id,
      },
    }),
    prisma.chartOfAccount.upsert({
      where: { code_organizationId: { code: "1200", organizationId: org.id } },
      update: {},
      create: {
        code: "1200",
        name: "Accounts Receivable",
        type: "ASSET",
        organizationId: org.id,
      },
    }),
    prisma.chartOfAccount.upsert({
      where: { code_organizationId: { code: "4000", organizationId: org.id } },
      update: {},
      create: {
        code: "4000",
        name: "Service Revenue",
        type: "REVENUE",
        organizationId: org.id,
      },
    }),
    prisma.chartOfAccount.upsert({
      where: { code_organizationId: { code: "5000", organizationId: org.id } },
      update: {},
      create: {
        code: "5000",
        name: "Operating Expenses",
        type: "EXPENSE",
        organizationId: org.id,
      },
    }),
  ])

  console.log("Created chart of accounts:", accounts.length)

  console.log("Seeding completed successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
