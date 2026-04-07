import type { Metadata } from "next"
import { ClerkProvider } from "@clerk/nextjs"
import "./globals.css"

export const metadata: Metadata = {
  title: "Logix Layer Finance",
  description: "Finance Department — Logix Layer N.V.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider signInUrl="/sign-in" signUpUrl="/sign-up" afterSignOutUrl="/sign-in">
      <html lang="en">
        <body className="font-sans">{children}</body>
      </html>
    </ClerkProvider>
  )
}
