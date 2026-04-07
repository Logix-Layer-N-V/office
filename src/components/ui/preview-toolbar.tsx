"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Download, Loader2, Pencil, Printer, Send, ZoomIn, ZoomOut, Maximize2 } from "lucide-react"

const ZOOM_LEVELS = [50, 75, 100, 125, 150, 200]

interface PreviewToolbarProps {
  backHref: string
  backLabel: string
  editHref: string
  zoom: number
  onZoomChange: (z: number) => void
  /** Document number for the PDF filename, e.g. "EST-2025-001" */
  documentNumber?: string
}

export function PreviewToolbar({ backHref, backLabel, editHref, zoom, onZoomChange, documentNumber }: PreviewToolbarProps) {
  const router = useRouter()
  const [pdfLoading, setPdfLoading] = useState(false)

  const zoomIn = () => {
    const next = ZOOM_LEVELS.find((z) => z > zoom)
    if (next) onZoomChange(next)
  }

  const zoomOut = () => {
    const prev = [...ZOOM_LEVELS].reverse().find((z) => z < zoom)
    if (prev) onZoomChange(prev)
  }

  const resetZoom = () => onZoomChange(100)

  const downloadPdf = async () => {
    setPdfLoading(true)
    try {
      const el = document.getElementById("document-preview")
      if (!el) return

      const html2canvas = (await import("html2canvas-pro")).default
      const { jsPDF } = await import("jspdf")

      // A4 dimensions in mm
      const a4W = 210
      const a4H = 297

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        width: el.scrollWidth,
        height: el.scrollHeight,
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })

      // Scale image to fit A4 width, then check if it overflows height
      const imgW = a4W
      const imgH = (canvas.height * a4W) / canvas.width

      if (imgH <= a4H) {
        // Fits on one page
        pdf.addImage(imgData, "PNG", 0, 0, imgW, imgH)
      } else {
        // Multi-page: slice the canvas
        const pageHeightPx = (a4H / a4W) * canvas.width
        let yOffset = 0
        let page = 0

        while (yOffset < canvas.height) {
          if (page > 0) pdf.addPage()

          const sliceH = Math.min(pageHeightPx, canvas.height - yOffset)
          const sliceCanvas = document.createElement("canvas")
          sliceCanvas.width = canvas.width
          sliceCanvas.height = sliceH
          const ctx = sliceCanvas.getContext("2d")
          if (ctx) {
            ctx.drawImage(canvas, 0, -yOffset)
          }

          const sliceData = sliceCanvas.toDataURL("image/png")
          const sliceImgH = (sliceH * a4W) / canvas.width
          pdf.addImage(sliceData, "PNG", 0, 0, imgW, sliceImgH)

          yOffset += pageHeightPx
          page++
        }
      }

      const filename = documentNumber
        ? `${documentNumber.replace(/\s+/g, "-")}.pdf`
        : "document.pdf"
      pdf.save(filename)
    } catch (err) {
      console.error("PDF generation failed:", err)
    } finally {
      setPdfLoading(false)
    }
  }

  return (
    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-surface-200 print:hidden">
      <div className="mx-auto max-w-5xl flex items-center justify-between px-4 py-2.5">
        {/* Left — back */}
        <button onClick={() => router.push(backHref)} className="flex items-center gap-2 text-sm text-surface-600 hover:text-surface-800 transition-colors">
          <ArrowLeft className="h-4 w-4" /> {backLabel}
        </button>

        {/* Center — zoom controls */}
        <div className="flex items-center gap-1 bg-surface-100 rounded-lg p-1">
          <button
            onClick={zoomOut}
            disabled={zoom <= ZOOM_LEVELS[0]}
            className="p-1.5 rounded-md hover:bg-white text-surface-600 hover:text-surface-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>

          <button
            onClick={resetZoom}
            className="min-w-[3.5rem] px-2 py-1 rounded-md text-xs font-semibold font-mono text-surface-700 hover:bg-white transition-colors text-center"
            title="Reset zoom"
          >
            {zoom}%
          </button>

          <button
            onClick={zoomIn}
            disabled={zoom >= ZOOM_LEVELS[ZOOM_LEVELS.length - 1]}
            className="p-1.5 rounded-md hover:bg-white text-surface-600 hover:text-surface-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </button>

          <div className="w-px h-5 bg-surface-300 mx-1" />

          <button
            onClick={resetZoom}
            className="p-1.5 rounded-md hover:bg-white text-surface-600 hover:text-surface-800 transition-colors"
            title="Fit to page"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>

        {/* Right — actions */}
        <div className="flex items-center gap-2">
          <button onClick={() => router.push(editHref)} className="btn-secondary text-xs"><Pencil className="h-3.5 w-3.5" /> Edit</button>
          <button onClick={() => window.print()} className="btn-secondary text-xs"><Printer className="h-3.5 w-3.5" /> Print</button>
          <button onClick={downloadPdf} disabled={pdfLoading} className="btn-secondary text-xs">
            {pdfLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
            {pdfLoading ? "Generating..." : "PDF"}
          </button>
          <button className="btn-primary text-xs"><Send className="h-3.5 w-3.5" /> Send</button>
        </div>
      </div>
    </div>
  )
}

interface PreviewContainerProps {
  zoom: number
  children: React.ReactNode
}

export function PreviewContainer({ zoom, children }: PreviewContainerProps) {
  return (
    <div className="py-8 px-4 print:p-0 overflow-auto">
      <div
        id="document-preview"
        className="mx-auto transition-transform duration-200 ease-out"
        style={{
          transform: `scale(${zoom / 100})`,
          transformOrigin: "top center",
          width: "210mm",
        }}
      >
        {children}
      </div>
    </div>
  )
}
