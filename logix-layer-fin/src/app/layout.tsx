import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Logix Layer Finance",
  description: "Finance Department — Logix Layer N.V.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  )
}
