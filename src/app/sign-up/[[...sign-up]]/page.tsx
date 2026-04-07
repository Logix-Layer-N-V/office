"use client"

import { SignUp } from "@clerk/nextjs"
import { LogixLogo } from "@/components/ui/logix-logo"

export default function SignUpPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left — Form */}
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex items-center gap-2">
          <LogixLogo size={28} />
          <span className="text-sm font-semibold text-[#3B2D8E]">Logix Layer</span>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <SignUp
              appearance={{
                elements: {
                  rootBox: "w-full",
                  cardBox: "w-full shadow-none border-0",
                  card: "w-full shadow-none border-0 p-0",
                  headerTitle: "text-2xl font-bold text-surface-800",
                  headerSubtitle: "text-sm text-surface-500",
                  socialButtonsBlockButton: "border border-surface-200 hover:bg-surface-50 text-surface-700 font-medium",
                  formButtonPrimary: "bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-md",
                  formFieldInput: "border-surface-200 focus:border-brand-500 focus:ring-brand-500 rounded-md",
                  formFieldLabel: "text-xs font-medium text-surface-500",
                  footerActionLink: "text-brand-600 hover:text-brand-700 font-medium",
                  dividerLine: "bg-surface-200",
                  dividerText: "text-surface-400 text-xs",
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Right — Branding panel */}
      <div className="relative hidden bg-gradient-to-br from-[#3B2D8E] to-[#2a1f6e] lg:block">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12">
          <div className="mb-8 flex flex-col gap-3">
            <div className="flex gap-3">
              <div className="h-14 w-14 rounded bg-white/20" />
              <div className="h-14 w-14 rounded bg-[#6DC944]" />
              <div className="h-14 w-14 rounded bg-[#6DC944]" />
            </div>
            <div className="flex gap-3">
              <div className="h-14 w-14 rounded bg-white/30" />
              <div className="h-14 w-14 rounded bg-white/20" />
              <div className="h-14 w-14 rounded bg-[#6DC944]" />
            </div>
            <div className="flex gap-3">
              <div className="h-14 w-14 rounded bg-white/30" />
              <div className="h-14 w-[7.5rem] rounded bg-white/20" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white mb-2">Logix Layer Finance</h2>
          <p className="text-white/60 text-center max-w-sm">
            Create your account to get started with the Finance Department.
          </p>
        </div>
      </div>
    </div>
  )
}
