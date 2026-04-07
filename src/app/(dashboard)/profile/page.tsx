"use client"

import { useState } from "react"
import { useUser, useClerk } from "@clerk/nextjs"
import { Header } from "@/components/dashboard/header"
import { User, Mail, Shield, Camera, ExternalLink, LogOut } from "lucide-react"

export default function ProfilePage() {
  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()
  const [saving, setSaving] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [initialized, setInitialized] = useState(false)

  if (isLoaded && !initialized && user) {
    setFirstName(user.firstName || "")
    setLastName(user.lastName || "")
    setInitialized(true)
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-surface-50">
        <Header title="My Profile" subtitle="Manage your personal information" />
        <div className="flex items-center justify-center p-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      </div>
    )
  }

  if (!user) return null

  const email = user.emailAddresses?.[0]?.emailAddress || ""
  const initials = (user.firstName?.[0] || email[0] || "U").toUpperCase()
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || email.split("@")[0]
  const imageUrl = user.imageUrl

  async function handleSave() {
    setSaving(true)
    try {
      await user!.update({ firstName, lastName })
    } catch { /* silently */ }
    setSaving(false)
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <Header title="My Profile" subtitle="Manage your personal information" />

      <div className="p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Profile card */}
          <div className="lg:col-span-1">
            <div className="card p-6 text-center">
              {/* Avatar */}
              <div className="relative mx-auto mb-4 h-24 w-24">
                {imageUrl ? (
                  <img src={imageUrl} alt={fullName} className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-md" />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-3xl font-bold shadow-md">
                    {initials}
                  </div>
                )}
                <button
                  onClick={() => user.setProfileImage({ file: null })}
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-white border-2 border-surface-200 flex items-center justify-center text-surface-500 hover:text-brand-600 hover:border-brand-300 transition-colors shadow-sm"
                  title="Change avatar"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
              </div>

              <h2 className="text-lg font-bold text-surface-900">{fullName}</h2>
              <p className="text-sm text-surface-500 mt-0.5">{email}</p>

              {/* Role badge */}
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1">
                <Shield className="h-3 w-3 text-brand-600" />
                <span className="text-2xs font-semibold text-brand-700">Admin</span>
              </div>

              {/* Quick stats */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-surface-50 p-3">
                  <p className="text-xl font-bold text-surface-800">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "—"}
                  </p>
                  <p className="text-2xs text-surface-500">Member since</p>
                </div>
                <div className="rounded-lg bg-surface-50 p-3">
                  <p className="text-xl font-bold text-surface-800">
                    {user.lastSignInAt ? new Date(user.lastSignInAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                  </p>
                  <p className="text-2xs text-surface-500">Last sign-in</p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 space-y-2">
                <a
                  href="https://accounts.clerk.com/user"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-surface-200 px-4 py-2.5 text-xs font-medium text-surface-600 hover:bg-surface-50 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Manage Account on Clerk
                </a>
                <button
                  onClick={() => signOut({ redirectUrl: "/sign-in" })}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Right: Edit form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Info */}
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-5">
                <User className="h-4 w-4 text-brand-600" />
                <h3 className="text-sm font-semibold text-surface-900">Personal Information</h3>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">First Name</label>
                    <input
                      type="text"
                      className="input w-full"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <label className="label">Last Name</label>
                    <input
                      type="text"
                      className="input w-full"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSave}
                    className="btn-primary"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-5">
                <Mail className="h-4 w-4 text-brand-600" />
                <h3 className="text-sm font-semibold text-surface-900">Email Address</h3>
              </div>

              <div className="rounded-lg border border-surface-100 bg-surface-50/50 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50">
                    <Mail className="h-4 w-4 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-surface-800">{email}</p>
                    <p className="text-2xs text-surface-400">Primary email — managed by Clerk</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-2xs font-semibold text-emerald-700">Verified</span>
              </div>
            </div>

            {/* Security */}
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-5">
                <Shield className="h-4 w-4 text-brand-600" />
                <h3 className="text-sm font-semibold text-surface-900">Security</h3>
              </div>

              <div className="space-y-3">
                <div className="rounded-lg border border-surface-100 bg-surface-50/50 p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-surface-800">Password</p>
                    <p className="text-2xs text-surface-400">Change your password via Clerk</p>
                  </div>
                  <a
                    href="https://accounts.clerk.com/user/security"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-brand-600 hover:text-brand-700"
                  >
                    Change →
                  </a>
                </div>
                <div className="rounded-lg border border-surface-100 bg-surface-50/50 p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-surface-800">Two-Factor Authentication</p>
                    <p className="text-2xs text-surface-400">Add an extra layer of security</p>
                  </div>
                  <a
                    href="https://accounts.clerk.com/user/security"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-brand-600 hover:text-brand-700"
                  >
                    Configure →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
