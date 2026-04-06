/**
 * logix-logo.tsx
 * WAT:    Logix Layer logo component (grid icon)
 * WAAROM: Inline SVG zodat het altijd rendert, geen externe file nodig
 */

interface LogixLogoProps {
  size?: number
  className?: string
}

export function LogixLogo({ size = 28, className }: LogixLogoProps) {
  const s = size / 28 // scale factor
  const g = 2 * s     // gap between blocks
  const b = 8 * s     // block size

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Row 1 */}
      <rect x="0" y="0" width="8" height="8" fill="#3B2D8E" />
      <rect x="10" y="0" width="8" height="8" fill="#6DC944" />
      <rect x="20" y="0" width="8" height="8" fill="#6DC944" />
      {/* Row 2 */}
      <rect x="0" y="10" width="8" height="8" fill="#3B2D8E" />
      <rect x="10" y="10" width="8" height="8" fill="#3B2D8E" />
      <rect x="20" y="10" width="8" height="8" fill="#6DC944" />
      {/* Row 3 */}
      <rect x="0" y="20" width="8" height="8" fill="#3B2D8E" />
      <rect x="10" y="20" width="18" height="8" fill="#3B2D8E" />
    </svg>
  )
}
