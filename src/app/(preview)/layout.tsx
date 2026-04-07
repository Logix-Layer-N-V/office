/**
 * Preview layout — no sidebar, no header, just the document.
 * Full-screen white background for A4 document preview.
 */
export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-100 print:bg-white">
      {children}
    </div>
  )
}
