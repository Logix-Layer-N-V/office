"use client"

/**
 * settings/page.tsx
 * WAT:    App settings — company info, multi-currency, tax, integrations
 * WAAROM: Centraal beheer van alle app configuratie
 */

import { useState } from "react"
import { Header } from "@/components/dashboard/header"
import { Building2, Globe, CreditCard, Shield, Bell, Palette, Key, Trash2, Plus, GripVertical } from "lucide-react"

const defaultCurrencies = [
  { code: "USD", name: "US Dollar", symbol: "$", rate: 1.0, isBase: true },
  { code: "EUR", name: "Euro", symbol: "€", rate: 0.92, isBase: false },
  { code: "GBP", name: "British Pound", symbol: "£", rate: 0.79, isBase: false },
  { code: "USDT", name: "Tether", symbol: "₮", rate: 1.0, isBase: false },
  { code: "BTC", name: "Bitcoin", symbol: "₿", rate: 0.000012, isBase: false },
  { code: "SRD", name: "Surinaamse Dollar", symbol: "SRD", rate: 36.25, isBase: false },
]

type SettingsTab = "company" | "currency" | "tax" | "integrations" | "notifications" | "appearance" | "api"

export default function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>("company")
  const [currencies, setCurrencies] = useState(defaultCurrencies)

  const tabs: { key: SettingsTab; label: string; icon: typeof Building2 }[] = [
    { key: "company", label: "Company", icon: Building2 },
    { key: "currency", label: "Currencies", icon: Globe },
    { key: "tax", label: "Tax Settings", icon: CreditCard },
    { key: "integrations", label: "Integrations", icon: Shield },
    { key: "notifications", label: "Notifications", icon: Bell },
    { key: "appearance", label: "Appearance", icon: Palette },
    { key: "api", label: "API Keys", icon: Key },
  ]

  return (
    <div>
      <Header title="Settings" subtitle="Configure your finance department" />

      <div className="flex">
        {/* Settings Sidebar */}
        <nav className="w-48 border-r border-surface-200 bg-white min-h-[calc(100vh-48px)]">
          <div className="p-2 space-y-0.5">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setTab(key)}
                className={`flex items-center gap-2.5 w-full rounded-md px-3 py-2 text-xs font-medium transition-colors ${tab === key ? "bg-brand-50 text-brand-700" : "text-surface-500 hover:bg-surface-50 hover:text-surface-700"}`}>
                <Icon className="h-3.5 w-3.5" /> {label}
              </button>
            ))}
          </div>
        </nav>

        {/* Settings Content */}
        <div className="flex-1 p-6 max-w-3xl">
          {/* Company */}
          {tab === "company" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-sm font-semibold text-surface-800 mb-1">Company Information</h2>
                <p className="text-2xs text-surface-400">This appears on your invoices, proposals and reports.</p>
              </div>
              <div className="card p-5 space-y-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-brand-600 text-white text-lg font-bold">LL</div>
                  <div>
                    <button className="btn-secondary text-2xs">Upload Logo</button>
                    <p className="text-2xs text-surface-400 mt-1">PNG, JPG up to 2MB</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="label">Company Name</label><input type="text" className="input" defaultValue="Logix Layer N.V." /></div>
                  <div><label className="label">Website</label><input type="url" className="input" defaultValue="https://logixlayer.com" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="label">CEO</label><input type="text" className="input" defaultValue="Jason Walcott" /></div>
                  <div><label className="label">CTO</label><input type="text" className="input" defaultValue="Kenscky Alimoestar" /></div>
                </div>
                <div><label className="label">Address</label><textarea className="input" rows={2} defaultValue="" placeholder="Street, City, Country" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="label">Email</label><input type="email" className="input" defaultValue="" placeholder="finance@logixlayer.com" /></div>
                  <div><label className="label">Phone</label><input type="tel" className="input" defaultValue="" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="label">Tax ID / VAT</label><input type="text" className="input" defaultValue="" /></div>
                  <div><label className="label">Registration Number</label><input type="text" className="input" defaultValue="" /></div>
                </div>
              </div>
              <div className="flex justify-end"><button className="btn-primary">Save Changes</button></div>
            </div>
          )}

          {/* Multi-Currency */}
          {tab === "currency" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-sm font-semibold text-surface-800 mb-1">Multi-Currency Settings</h2>
                <p className="text-2xs text-surface-400">Manage currencies and exchange rates for international invoicing.</p>
              </div>

              <div className="card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-semibold text-surface-700">Base Currency</h3>
                    <p className="text-2xs text-surface-400">All amounts are converted to this currency for reporting</p>
                  </div>
                  <select className="input w-40" defaultValue="USD">
                    {currencies.map(c => <option key={c.code} value={c.code}>{c.symbol} {c.code} — {c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between px-4 py-3 border-b border-surface-100">
                  <h3 className="text-xs font-semibold text-surface-700">Active Currencies</h3>
                  <button className="btn-ghost text-2xs"><Plus className="h-3 w-3" /> Add Currency</button>
                </div>
                <table className="table-compact">
                  <thead>
                    <tr>
                      <th className="w-6"></th>
                      <th>Currency</th>
                      <th>Symbol</th>
                      <th className="text-right">Exchange Rate</th>
                      <th>Status</th>
                      <th className="w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {currencies.map((cur) => (
                      <tr key={cur.code}>
                        <td><GripVertical className="h-3 w-3 text-surface-300" /></td>
                        <td>
                          <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-100 text-2xs font-bold text-surface-600">{cur.symbol}</span>
                            <div>
                              <p className="text-xs font-medium text-surface-800">{cur.code}</p>
                              <p className="text-2xs text-surface-400">{cur.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="font-mono text-xs">{cur.symbol}</td>
                        <td className="text-right">
                          {cur.isBase ? (
                            <span className="badge-info">Base</span>
                          ) : (
                            <input type="number" className="input w-24 text-right text-xs" step="0.0001" defaultValue={cur.rate} />
                          )}
                        </td>
                        <td><span className="badge-success">Active</span></td>
                        <td>
                          {!cur.isBase && (
                            <button className="rounded p-1 text-surface-300 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="card p-5 space-y-3">
                <h3 className="text-xs font-semibold text-surface-700">Auto-Update Rates</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-surface-600">Automatically fetch exchange rates daily</p>
                    <p className="text-2xs text-surface-400">Uses European Central Bank rates (free)</p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input type="checkbox" className="peer sr-only" defaultChecked />
                    <div className="h-5 w-9 rounded-full bg-surface-200 peer-checked:bg-brand-600 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full" />
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-2xs text-surface-400">Last updated: Apr 6, 2026 — 08:00 UTC</p>
                  <button className="btn-ghost text-2xs">Refresh Now</button>
                </div>
              </div>

              <div className="flex justify-end"><button className="btn-primary">Save Currency Settings</button></div>
            </div>
          )}

          {/* Tax Settings */}
          {tab === "tax" && (
            <div className="space-y-6">
              <div><h2 className="text-sm font-semibold text-surface-800 mb-1">Tax Settings</h2><p className="text-2xs text-surface-400">Configure tax rates for invoices and proposals.</p></div>
              <div className="card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div><h3 className="text-xs font-semibold text-surface-700">Enable Tax</h3><p className="text-2xs text-surface-400">Apply tax to invoices and proposals</p></div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input type="checkbox" className="peer sr-only" />
                    <div className="h-5 w-9 rounded-full bg-surface-200 peer-checked:bg-brand-600 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full" />
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="label">Default Tax Rate (%)</label><input type="number" className="input" step="0.1" defaultValue={0} /></div>
                  <div><label className="label">Tax Label</label><input type="text" className="input" defaultValue="VAT" placeholder="e.g. VAT, GST, Sales Tax" /></div>
                </div>
                <div><label className="label">Tax ID on Documents</label><input type="text" className="input" defaultValue="" placeholder="Displayed on invoices" /></div>
              </div>

              <div className="card p-5 space-y-3">
                <h3 className="text-xs font-semibold text-surface-700">Tax Rates</h3>
                <div className="space-y-2">
                  {[{ name: "Standard", rate: 21 }, { name: "Reduced", rate: 9 }, { name: "Zero", rate: 0 }].map((t) => (
                    <div key={t.name} className="flex items-center gap-3 p-2 rounded-md border border-surface-100">
                      <input type="text" className="input flex-1" defaultValue={t.name} />
                      <input type="number" className="input w-20 text-right" defaultValue={t.rate} />
                      <span className="text-2xs text-surface-400">%</span>
                      <button className="text-surface-300 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  ))}
                </div>
                <button className="btn-ghost text-2xs"><Plus className="h-3 w-3" /> Add Tax Rate</button>
              </div>
              <div className="flex justify-end"><button className="btn-primary">Save Tax Settings</button></div>
            </div>
          )}

          {/* Integrations */}
          {tab === "integrations" && (
            <div className="space-y-6">
              <div><h2 className="text-sm font-semibold text-surface-800 mb-1">Integrations</h2><p className="text-2xs text-surface-400">Connect external services.</p></div>
              {[
                { name: "Clerk", desc: "Authentication & user management", status: "connected", color: "bg-purple-50 text-purple-700" },
                { name: "Neon", desc: "PostgreSQL serverless database", status: "connected", color: "bg-emerald-50 text-emerald-700" },
                { name: "Resend", desc: "Transactional email delivery", status: "not_connected", color: "bg-surface-100 text-surface-500" },
                { name: "Stripe", desc: "Payment processing", status: "not_connected", color: "bg-surface-100 text-surface-500" },
                { name: "Vercel", desc: "Hosting & deployment", status: "connected", color: "bg-black/5 text-surface-800" },
                { name: "Cloudinary", desc: "Media storage & optimization", status: "not_connected", color: "bg-surface-100 text-surface-500" },
              ].map((int) => (
                <div key={int.name} className="card p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-md ${int.color} text-xs font-bold`}>{int.name.slice(0, 2)}</div>
                    <div><p className="text-xs font-semibold text-surface-800">{int.name}</p><p className="text-2xs text-surface-400">{int.desc}</p></div>
                  </div>
                  {int.status === "connected" ? (
                    <div className="flex items-center gap-2"><span className="badge-success">Connected</span><button className="btn-ghost text-2xs">Configure</button></div>
                  ) : (
                    <button className="btn-secondary text-2xs">Connect</button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Notifications */}
          {tab === "notifications" && (
            <div className="space-y-6">
              <div><h2 className="text-sm font-semibold text-surface-800 mb-1">Notifications</h2><p className="text-2xs text-surface-400">Configure email and in-app notifications.</p></div>
              <div className="card p-5 space-y-4">
                {[
                  { label: "Invoice paid", desc: "When a client pays an invoice" },
                  { label: "Invoice overdue", desc: "When an invoice passes its due date" },
                  { label: "Proposal approved", desc: "When a client approves a proposal" },
                  { label: "New payment received", desc: "When a payment is recorded" },
                  { label: "Low balance alert", desc: "When a bank account drops below threshold" },
                  { label: "Monthly report ready", desc: "Monthly financial report generated" },
                ].map((n) => (
                  <div key={n.label} className="flex items-center justify-between py-1">
                    <div><p className="text-xs text-surface-700">{n.label}</p><p className="text-2xs text-surface-400">{n.desc}</p></div>
                    <div className="flex gap-3">
                      <label className="flex items-center gap-1 text-2xs text-surface-500"><input type="checkbox" defaultChecked className="rounded border-surface-300" /> Email</label>
                      <label className="flex items-center gap-1 text-2xs text-surface-500"><input type="checkbox" defaultChecked className="rounded border-surface-300" /> In-app</label>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end"><button className="btn-primary">Save Notifications</button></div>
            </div>
          )}

          {/* Appearance */}
          {tab === "appearance" && (
            <div className="space-y-6">
              <div><h2 className="text-sm font-semibold text-surface-800 mb-1">Appearance</h2><p className="text-2xs text-surface-400">Customize the look and feel.</p></div>
              <div className="card p-5 space-y-4">
                <div><label className="label">Brand Color</label>
                  <div className="flex gap-2">
                    {["#2563eb", "#7c3aed", "#059669", "#d97706", "#dc2626", "#0891b2"].map((c) => (
                      <button key={c} className="h-8 w-8 rounded-full border-2 border-white shadow-sm ring-1 ring-surface-200 hover:ring-brand-500" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="label">Date Format</label><select className="input"><option>MMM D, YYYY</option><option>DD/MM/YYYY</option><option>YYYY-MM-DD</option><option>MM/DD/YYYY</option></select></div>
                  <div><label className="label">Number Format</label><select className="input"><option>1,234.56</option><option>1.234,56</option><option>1 234.56</option></select></div>
                </div>
                <div><label className="label">Default Hourly Rate (USD)</label><input type="number" className="input w-32" step="0.01" defaultValue={65} /></div>
                <div><label className="label">Invoice Prefix</label><input type="text" className="input w-32" defaultValue="INV-" /></div>
              </div>
              <div className="flex justify-end"><button className="btn-primary">Save Appearance</button></div>
            </div>
          )}

          {/* API Keys */}
          {tab === "api" && (
            <div className="space-y-6">
              <div><h2 className="text-sm font-semibold text-surface-800 mb-1">API Keys</h2><p className="text-2xs text-surface-400">Manage API keys for external integrations.</p></div>
              <div className="card p-5 space-y-3">
                {[
                  { name: "Production API Key", key: "ll_live_****...3f9a", created: "Mar 1, 2026" },
                  { name: "Development API Key", key: "ll_test_****...7b2c", created: "Feb 15, 2026" },
                ].map((k) => (
                  <div key={k.name} className="flex items-center justify-between p-3 rounded-md border border-surface-100">
                    <div><p className="text-xs font-medium text-surface-800">{k.name}</p><p className="text-2xs font-mono text-surface-400">{k.key}</p><p className="text-2xs text-surface-400">Created: {k.created}</p></div>
                    <div className="flex gap-2"><button className="btn-ghost text-2xs">Reveal</button><button className="btn-ghost text-2xs text-red-500">Revoke</button></div>
                  </div>
                ))}
              </div>
              <button className="btn-secondary"><Plus className="h-3.5 w-3.5" /> Generate New Key</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
