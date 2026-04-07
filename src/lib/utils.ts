/**
 * utils.ts
 * WAT:    Utility functies voor de hele app
 * WAAROM: Centrale plek voor herbruikbare helpers
 * GEBRUIK: import { cn, formatCurrency } from "@/lib/utils"
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// --- Class merging ---
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// --- Currency formatting ---
export function formatCurrency(amount: number | string, currency = "USD"): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(num)
}

// --- Date formatting ---
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "-"
  const d = typeof date === "string" ? new Date(date) : date
  if (isNaN(d.getTime())) return "-"
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d)
}

export function formatDateShort(date: Date | string | null | undefined): string {
  if (!date) return "-"
  const d = typeof date === "string" ? new Date(date) : date
  if (isNaN(d.getTime())) return "-"
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(d)
}

// --- Number generators ---
export function generateNumber(prefix: string, count: number): string {
  return `${prefix}-${String(count + 1).padStart(4, "0")}`
}

// --- Status helpers ---
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    DRAFT: "badge-neutral",
    SENT: "badge-info",
    APPROVED: "badge-success",
    ACCEPTED: "badge-success",
    PAID: "badge-success",
    COMPLETED: "badge-success",
    ACTIVE: "badge-success",
    PENDING: "badge-warning",
    PARTIAL: "badge-warning",
    VIEWED: "badge-info",
    OVERDUE: "badge-danger",
    REJECTED: "badge-danger",
    CANCELLED: "badge-danger",
    EXPIRED: "badge-danger",
    FAILED: "badge-danger",
    DEFAULTED: "badge-danger",
  }
  return colors[status] || "badge-neutral"
}

// --- Percentage calculation ---
export function calcPercentage(value: number, total: number): number {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}
