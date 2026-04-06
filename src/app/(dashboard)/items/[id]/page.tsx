"use client"

import { useParams } from "next/navigation"
import { DetailHeader } from "@/components/ui/detail-header"
import { useApi } from "@/hooks/use-api"
import { formatCurrency } from "@/lib/utils"
import { Wrench, Package, Cloud, Cpu, ToggleRight, ToggleLeft } from "lucide-react"
import type { Item } from "@/types"

const typeIcons = { SERVICE: Wrench, PRODUCT: Package, API_COST: Cloud, AI_TOKEN: Cpu }

export default function ItemDetailPage() {
  const params = useParams()
  const id = params.id as string
  const { data: item, loading } = useApi<Item | null>(`/api/items/${id}`, null)

  if (loading) {
    return (
      <div>
        <DetailHeader backHref="/items" backLabel="Items" title="Loading..." />
        <div className="flex items-center justify-center p-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div>
        <DetailHeader backHref="/items" backLabel="Items" title="Not Found" />
        <div className="flex flex-col items-center justify-center p-12 text-surface-400">
          <p>The requested item was not found.</p>
          <a href="/items" className="mt-2 text-brand-600 hover:underline">Back to items</a>
        </div>
      </div>
    )
  }

  const Icon = typeIcons[item.type as keyof typeof typeIcons]

  return (
    <div>
      <DetailHeader backHref="/items" backLabel="Items" title={item.name} subtitle={item.type}
        editHref={`/items/${id}/edit`}
      />
      <div className="p-6 max-w-3xl space-y-4">
        <div className="card p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-brand-50 p-2">{Icon && <Icon className="h-5 w-5 text-brand-600" />}</div>
              <div>
                <p className="text-sm font-semibold text-surface-800">{item?.name}</p>
                <span className="badge-info">{item?.type.replace(/_/g, " ")}</span>
              </div>
            </div>
            {item?.isActive ? <ToggleRight className="h-6 w-6 text-emerald-500" /> : <ToggleLeft className="h-6 w-6 text-surface-300" />}
          </div>
          <div className="grid grid-cols-3 gap-4 border-t border-surface-100 pt-4">
            <div><p className="text-2xs text-surface-400">Rate</p><p className="text-lg font-bold text-surface-800">{formatCurrency(item?.rate || 0)}</p></div>
            <div><p className="text-2xs text-surface-400">Unit</p><p className="text-sm font-medium text-surface-700">per {item?.unit}</p></div>
            <div><p className="text-2xs text-surface-400">Status</p><p className="text-sm font-medium text-emerald-600">{item?.isActive ? "Active" : "Inactive"}</p></div>
          </div>
        </div>
        <div className="card p-5">
          <h3 className="text-xs font-semibold text-surface-700 mb-2">Description</h3>
          <p className="text-xs text-surface-500">{item?.description}</p>
        </div>
      </div>
    </div>
  )
}
