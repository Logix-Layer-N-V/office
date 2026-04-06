"use client"

/**
 * line-items-editor.tsx
 * WAT:    Editable line items tabel voor proposals/estimates/invoices
 * WAAROM: Herbruikbare editor met inline bewerking en totaalberekening
 */

import { useState } from "react"
import { Plus, Trash2, GripVertical } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export interface LineItem {
  id: string
  description: string
  hours: number
  rate: number
  amount: number
}

interface LineItemsEditorProps {
  items: LineItem[]
  onChange: (items: LineItem[]) => void
  defaultRate?: number
}

export function LineItemsEditor({ items, onChange, defaultRate = 65 }: LineItemsEditorProps) {
  const addItem = () => {
    const newItem: LineItem = {
      id: `item-${Date.now()}`,
      description: "",
      hours: 0,
      rate: defaultRate,
      amount: 0,
    }
    onChange([...items, newItem])
  }

  const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
    onChange(items.map((item) => {
      if (item.id !== id) return item
      const updated = { ...item, [field]: value }
      updated.amount = updated.hours * updated.rate
      return updated
    }))
  }

  const removeItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id))
  }

  const subtotal = items.reduce((s, i) => s + i.amount, 0)

  return (
    <div>
      <div className="rounded-md border border-surface-200 overflow-hidden">
        <table className="table-compact">
          <thead>
            <tr>
              <th className="w-6"></th>
              <th>Description</th>
              <th className="w-20 text-right">Hours</th>
              <th className="w-24 text-right">Rate</th>
              <th className="w-28 text-right">Amount</th>
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-6 text-surface-400 text-xs">No line items. Click &quot;Add line item&quot; to start.</td></tr>
            ) : (
              items.map((item) => (
                <tr key={item.id}>
                  <td className="text-center"><GripVertical className="h-3 w-3 text-surface-300 cursor-grab" /></td>
                  <td>
                    <input type="text" value={item.description} onChange={(e) => updateItem(item.id, "description", e.target.value)}
                      className="input" placeholder="Service or product description" />
                  </td>
                  <td>
                    <input type="number" value={item.hours || ""} onChange={(e) => updateItem(item.id, "hours", parseFloat(e.target.value) || 0)}
                      className="input text-right" step="0.5" min="0" />
                  </td>
                  <td>
                    <input type="number" value={item.rate || ""} onChange={(e) => updateItem(item.id, "rate", parseFloat(e.target.value) || 0)}
                      className="input text-right" step="0.01" min="0" />
                  </td>
                  <td className="text-right font-medium text-surface-800">{formatCurrency(item.amount)}</td>
                  <td>
                    <button onClick={() => removeItem(item.id)} className="rounded p-1 text-surface-300 hover:text-red-500 hover:bg-red-50">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between mt-2">
        <button type="button" onClick={addItem} className="btn-ghost text-2xs">
          <Plus className="h-3 w-3" /> Add line item
        </button>
        <div className="text-right">
          <span className="text-2xs text-surface-400">Subtotal</span>
          <p className="text-sm font-semibold text-surface-800">{formatCurrency(subtotal)}</p>
        </div>
      </div>
    </div>
  )
}
