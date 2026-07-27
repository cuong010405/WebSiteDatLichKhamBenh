"use client"

import React, { createContext, useCallback, useContext, useState, useEffect } from "react"

interface LoadingState {
  visible: boolean
  message: string
}

interface LoadingContextValue {
  loading: LoadingState
  show: (message?: string) => void
  hide: () => void
}

const LoadingContext = createContext<LoadingContextValue>({
  loading: { visible: false, message: "" },
  show: () => {},
  hide: () => {},
})

let globalShowHandler: ((message?: string) => void) | null = null
let globalHideHandler: (() => void) | null = null

/**
 * Global Singleton LoadingService for calling loading overlay anywhere in the system.
 * Usage:
 *   LoadingService.Show("ĐANG XỬ LÝ...")
 *   LoadingService.Hide()
 */
export const LoadingService = {
  Show: (message = "ĐANG XỬ LÝ...") => {
    if (globalShowHandler) globalShowHandler(message)
  },
  show: (message = "ĐANG XỬ LÝ...") => {
    if (globalShowHandler) globalShowHandler(message)
  },
  Hide: () => {
    if (globalHideHandler) globalHideHandler()
  },
  hide: () => {
    if (globalHideHandler) globalHideHandler()
  },
}

export const GlobalLoadingService = LoadingService

export function useLoading() {
  return useContext(LoadingContext)
}

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState<LoadingState>({ visible: false, message: "" })

  const show = useCallback((message = "ĐANG XỬ LÝ...") => {
    setLoading({ visible: true, message })
  }, [])

  const hide = useCallback(() => {
    setLoading({ visible: false, message: "" })
  }, [])

  useEffect(() => {
    globalShowHandler = show
    globalHideHandler = hide
    return () => {
      globalShowHandler = null
      globalHideHandler = null
    }
  }, [show, hide])

  return (
    <LoadingContext.Provider value={{ loading, show, hide }}>
      {children}
    </LoadingContext.Provider>
  )
}

