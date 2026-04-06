"use client"

import { useState, useEffect, useCallback } from "react"

interface UseApiResult<T> {
  data: T
  loading: boolean
  error: string | null
  refresh: () => void
}

/**
 * useApi - React hook for fetching data from API routes
 * Automatically handles loading and error states
 * @param url - API endpoint to fetch from
 * @param initialData - Default data while loading
 */
export function useApi<T>(url: string, initialData: T): UseApiResult<T> {
  const [data, setData] = useState<T>(initialData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(url)
      if (!res.ok) throw new Error(`Failed to fetch ${url}`)
      const json = await res.json()
      setData(json)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }, [url])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refresh: fetchData }
}

/**
 * apiMutate - Helper for POST, PUT, PATCH, DELETE requests
 * @param url - API endpoint
 * @param method - HTTP method
 * @param body - Request body (optional)
 * @returns Response JSON
 */
export async function apiMutate<T>(
  url: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  body?: unknown
): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }))
    throw new Error(err.error || "Request failed")
  }
  return res.json()
}
