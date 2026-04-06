/**
 * navigation.ts
 * WAT:    Sidebar navigatie configuratie
 * WAAROM: Centrale plek voor alle menu items
 * GEBRUIK: import { navigation } from "@/constants/navigation"
 */

import {
  LayoutDashboard,
  FileText,
  Calculator,
  Receipt,
  CreditCard,
  Landmark,
  ArrowDownUp,
  Wallet,
  TrendingDown,
  BookOpen,
  Users,
  Package,
  Bitcoin,
  CalendarDays,
  BarChart3,
  FolderKanban,
  ClipboardList,
  ListTodo,
  Settings,
  Zap,
  type LucideIcon,
} from "lucide-react"

// --- Types ---
export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  badge?: number
}

export interface NavGroup {
  title: string
  items: NavItem[]
}

// --- Navigation config ---
export const navigation: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/overview", icon: LayoutDashboard },
      { label: "Calendar", href: "/calendar", icon: CalendarDays },
    ],
  },
  {
    title: "CRM",
    items: [
      { label: "Clients", href: "/clients", icon: Users },
      { label: "Items", href: "/items", icon: Package },
    ],
  },
  {
    title: "Sales",
    items: [
      { label: "Proposals", href: "/proposals", icon: FileText },
      { label: "Estimates", href: "/estimates", icon: Calculator },
      { label: "Invoices", href: "/invoices", icon: Receipt },
      { label: "Payments", href: "/payments", icon: CreditCard },
    ],
  },
  {
    title: "Project Management",
    items: [
      { label: "Projects", href: "/projects", icon: FolderKanban },
      { label: "Scrum Board", href: "/sprints", icon: Zap },
      { label: "Work Orders", href: "/work-orders", icon: ClipboardList },
      { label: "Tasks", href: "/tasks", icon: ListTodo },
    ],
  },
  {
    title: "Banking",
    items: [
      { label: "Bank Accounts", href: "/banks", icon: Landmark },
      { label: "Crypto / USDT", href: "/banks?tab=crypto", icon: Bitcoin },
      { label: "Transactions", href: "/banks?tab=transactions", icon: ArrowDownUp },
    ],
  },
  {
    title: "Accounting",
    items: [
      { label: "Expenses", href: "/expenses", icon: TrendingDown },
      { label: "Credits", href: "/credits", icon: Wallet },
      { label: "Loans", href: "/loans", icon: Landmark },
      { label: "General Ledger", href: "/general-ledger", icon: BookOpen },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Reports", href: "/reports", icon: BarChart3 },
      { label: "Users & Roles", href: "/settings/users", icon: Users },
      { label: "Documentation", href: "/docs", icon: BookOpen },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
]
