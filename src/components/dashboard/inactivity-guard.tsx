"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useClerk } from "@clerk/nextjs"

const IDLE_TIMEOUT = 10 * 60 * 1000   // 10 minutes
const WARNING_SECONDS = 30             // 30-second countdown

export function InactivityGuard() {
  const { signOut } = useClerk()
  const [showWarning, setShowWarning] = useState(false)
  const [countdown, setCountdown] = useState(WARNING_SECONDS)
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countdownTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  const doSignOut = useCallback(() => {
    clearTimers()
    setShowWarning(false)
    signOut({ redirectUrl: "/sign-in" })
  }, [signOut])

  const clearTimers = () => {
    if (idleTimer.current) clearTimeout(idleTimer.current)
    if (countdownTimer.current) clearInterval(countdownTimer.current)
    idleTimer.current = null
    countdownTimer.current = null
  }

  const startWarning = useCallback(() => {
    setCountdown(WARNING_SECONDS)
    setShowWarning(true)

    let sec = WARNING_SECONDS
    countdownTimer.current = setInterval(() => {
      sec -= 1
      setCountdown(sec)
      if (sec <= 0) {
        doSignOut()
      }
    }, 1000)
  }, [doSignOut])

  const resetIdle = useCallback(() => {
    // If warning is showing, don't reset from activity
    if (showWarning) return

    clearTimers()
    idleTimer.current = setTimeout(() => {
      startWarning()
    }, IDLE_TIMEOUT)
  }, [showWarning, startWarning])

  const handleResume = () => {
    clearTimers()
    setShowWarning(false)
    setCountdown(WARNING_SECONDS)
    // Restart idle timer
    idleTimer.current = setTimeout(() => {
      startWarning()
    }, IDLE_TIMEOUT)
  }

  useEffect(() => {
    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "click"]
    events.forEach((e) => window.addEventListener(e, resetIdle, { passive: true }))
    // Start initial timer
    resetIdle()

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetIdle))
      clearTimers()
    }
  }, [resetIdle])

  if (!showWarning) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl">
        {/* Timer circle */}
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border-4 border-red-100 bg-red-50">
          <span className="text-2xl font-bold text-red-600">{countdown}</span>
        </div>

        <h2 className="text-center text-lg font-bold text-surface-900">Session Expiring</h2>
        <p className="mt-2 text-center text-sm text-surface-500">
          You&apos;ve been inactive for 10 minutes. You&apos;ll be signed out in{" "}
          <span className="font-semibold text-red-600">{countdown} seconds</span>.
        </p>

        {/* Progress bar */}
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-surface-200">
          <div
            className="h-full rounded-full bg-red-500 transition-all duration-1000 ease-linear"
            style={{ width: `${(countdown / WARNING_SECONDS) * 100}%` }}
          />
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={doSignOut}
            className="flex-1 rounded-lg border border-surface-200 px-4 py-2.5 text-sm font-medium text-surface-700 hover:bg-surface-50 transition-colors"
          >
            Log Out
          </button>
          <button
            onClick={handleResume}
            className="flex-1 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
          >
            Resume Session
          </button>
        </div>
      </div>
    </div>
  )
}
