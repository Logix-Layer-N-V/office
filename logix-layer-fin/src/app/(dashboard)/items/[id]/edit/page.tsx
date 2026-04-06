"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { DetailHeader } from "@/components/ui/detail-header"
import { useApi, apiMutate } from "@/hooks/use-api"
import { Save } from "lucide-react"
import type { Item } from "@/types"

export default function ItemEditPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [name, setName] = useState("")
  const [type, setType] = useState("SERVICE")
  const [unit, setUnit] = useState("hour")
  const [rate, setRate] = useState(0)
  const [description, setDescription] = useState("")
  const [isActive, setIsActive] = useState(true)

  const { data: item, loading } = useApi<Item | null>(`/api/items/${id}`, null)

  useEffect(() => {
    if (item) {
      setName(item.name)
      setType(item.type)
      setUnit(item.unit)
      setRate(item.rate)
      setDescription(item.description || "")
      setIsActive(item.isActive)
    }
  }, [item])

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

  const handleSave = async () => {
    try {
      await apiMutate(`/api/items/${id}`, "PUT", {
        name,
        type,
        unit,
        rate,
        description,
        isActive,
      })
      router.push(`/items/${id}`)
    } catch (error) {
      console.error("Failed to save item:", error)
    }
  }

  return (
    <div>
      <DetailHeader backHref={`/items/${id}`} backLabel="Back to item" title={`Edit ${item?.name}`}
        actions={<button className="btn-primary" onClick={handleSave}><Save className="h-3.5 w-3.5" /> Save Changes</button>}
      />
      <div className="p-6 space-y-6">
        <div className="card p-5 space-y-4">
          <div><label className="label">Item Name</label><input type="text" className="input" value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Type</label>
              <select className="input" value={type} onChange={(e) => setType(e.target.value)}><option value="SERVICE">Service</option><option value="PRODUCT">Product</option><option value="API_COST">API Cost</option><option value="AI_TOKEN">AI Token Cost</option></select>
            </div>
            <div><label className="label">Unit</label>
              <select className="input" value={unit} onChange={(e) => setUnit(e.target.value)}><option>hour</option><option>license</option><option>month</option><option>transaction</option><option>1M tokens</option><option>unit</option></select>
            </div>
          </div>
          <div><label className="label">Rate (USD)</label><input type="number" className="input" step="0.01" value={rate} onChange={(e) => setRate(parseFloat(e.target.value))} /></div>
          <div><label className="label">Description</label><textarea className="input" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="active" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded border-surface-300" />
            <label htmlFor="active" className="text-xs text-surface-700">Active</label>
          </div>
        </div>
      </div>
    </div>
  )
}
