"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { DetailHeader } from "@/components/ui/detail-header"
import { useApi, apiMutate } from "@/hooks/use-api"
import { Save } from "lucide-react"
import type { Client } from "@/types"

export default function ClientEditPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [name, setName] = useState("")
  const [company, setCompany] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [taxId, setTaxId] = useState("")
  const [status, setStatus] = useState("ACTIVE")
  const [notes, setNotes] = useState("")

  const { data: client, loading } = useApi<Client | null>(`/api/clients/${id}`, null)

  useEffect(() => {
    if (client) {
      setName(client.name)
      setCompany(client.company || "")
      setEmail(client.email)
      setPhone(client.phone || "")
      setAddress(client.address || "")
      setTaxId(client.taxId || "")
      setStatus(client.status)
      setNotes(client.notes || "")
    }
  }, [client])

  if (loading) {
    return (
      <div>
        <DetailHeader backHref="/clients" backLabel="Back to clients" title="Loading..." />
        <div className="flex items-center justify-center p-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      </div>
    )
  }

  if (!client) {
    return (
      <div>
        <DetailHeader backHref="/clients" backLabel="Back to clients" title="Not Found" />
        <div className="flex flex-col items-center justify-center p-12 text-surface-400">
          <p>The requested client was not found.</p>
          <a href="/clients" className="mt-2 text-brand-600 hover:underline">Back to clients</a>
        </div>
      </div>
    )
  }

  const handleSave = async () => {
    try {
      await apiMutate(`/api/clients/${id}`, "PUT", {
        name,
        company,
        email,
        phone,
        address,
        taxId,
        status,
        notes,
      })
      router.push(`/clients/${id}`)
    } catch (error) {
      console.error("Failed to save client:", error)
    }
  }

  return (
    <div>
      <DetailHeader backHref={`/clients/${id}`} backLabel="Back to client" title={`Edit ${client?.name}`}
        actions={<button className="btn-primary" onClick={handleSave}><Save className="h-3.5 w-3.5" /> Save Changes</button>}
      />
      <div className="p-6 space-y-6">
        <div className="card p-5 space-y-4">
          <h3 className="text-xs font-semibold text-surface-700">Contact Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Contact Name</label><input type="text" className="input" value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div><label className="label">Company Name</label><input type="text" className="input" value={company} onChange={(e) => setCompany(e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Email</label><input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div><label className="label">Phone</label><input type="tel" className="input" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
          </div>
          <div><label className="label">Address</label><input type="text" className="input" value={address} onChange={(e) => setAddress(e.target.value)} /></div>
        </div>
        <div className="card p-5 space-y-4">
          <h3 className="text-xs font-semibold text-surface-700">Business Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Tax ID / VAT</label><input type="text" className="input" value={taxId} onChange={(e) => setTaxId(e.target.value)} /></div>
            <div><label className="label">Status</label>
              <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}><option>ACTIVE</option><option>INACTIVE</option><option>LEAD</option><option>ARCHIVED</option></select>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <label className="label">Internal Notes</label>
          <textarea className="input" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>
    </div>
  )
}
