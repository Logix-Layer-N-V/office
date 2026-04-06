import { type LucideIcon } from "lucide-react"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-xl bg-surface-100 p-3">
        <Icon className="h-6 w-6 text-surface-400" />
      </div>
      <h3 className="mt-3 text-sm font-medium text-surface-700">{title}</h3>
      <p className="mt-1 text-xs text-surface-400 max-w-xs">{description}</p>
      {action && (
        <button onClick={action.onClick} className="btn-primary mt-4">
          {action.label}
        </button>
      )}
    </div>
  )
}
