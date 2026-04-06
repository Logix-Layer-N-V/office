/**
 * stat-card.tsx
 * WAT:    KPI stat card component
 * WAAROM: Herbruikbare metric weergave
 */

import { cn } from "@/lib/utils"
import { type LucideIcon, TrendingUp, TrendingDown } from "lucide-react"

interface StatCardProps {
  title: string
  value: string
  change?: { value: string; positive: boolean }
  icon: LucideIcon
  iconColor?: string
}

export function StatCard({ title, value, change, icon: Icon, iconColor = "text-brand-600" }: StatCardProps) {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-2xs font-medium uppercase tracking-wider text-surface-400">{title}</p>
          <p className="mt-1 text-lg font-semibold text-surface-800">{value}</p>
          {change && (
            <div className="mt-1 flex items-center gap-1">
              {change.positive ? (
                <TrendingUp className="h-3 w-3 text-emerald-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span className={cn("text-2xs font-medium", change.positive ? "text-emerald-600" : "text-red-600")}>
                {change.value}
              </span>
            </div>
          )}
        </div>
        <div className={cn("rounded-md bg-surface-50 p-2", iconColor)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  )
}
