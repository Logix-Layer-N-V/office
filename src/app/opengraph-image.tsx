import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Logix Layer Finance"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0a0a0a",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 32,
        }}
      >
        {/* Logo grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ width: 56, height: 56, background: "#3B2D8E" }} />
            <div style={{ width: 56, height: 56, background: "#6DC944" }} />
            <div style={{ width: 56, height: 56, background: "#6DC944" }} />
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ width: 56, height: 56, background: "#3B2D8E" }} />
            <div style={{ width: 56, height: 56, background: "#3B2D8E" }} />
            <div style={{ width: 56, height: 56, background: "#6DC944" }} />
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ width: 56, height: 56, background: "#3B2D8E" }} />
            <div style={{ width: 124, height: 56, background: "#3B2D8E" }} />
          </div>
        </div>

        {/* Text */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 64, fontWeight: 700, color: "#ffffff", letterSpacing: "-1px" }}>
            Logix Layer Finance
          </div>
          <div style={{ fontSize: 28, color: "#888888" }}>
            Finance Department — Logix Layer N.V.
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
