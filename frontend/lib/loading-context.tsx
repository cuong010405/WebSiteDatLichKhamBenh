"use client"

import React, { createContext, useCallback, useContext, useState } from "react"

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

export function useLoading() {
  return useContext(LoadingContext)
}

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState<LoadingState>({ visible: false, message: "" })

  const show = useCallback((message = "Đang xử lý...") => {
    setLoading({ visible: true, message })
  }, [])

  const hide = useCallback(() => {
    setLoading({ visible: false, message: "" })
  }, [])

  return (
    <LoadingContext.Provider value={{ loading, show, hide }}>
      {children}
    </LoadingContext.Provider>
  )
}
