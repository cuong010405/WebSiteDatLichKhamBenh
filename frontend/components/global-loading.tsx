"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useLoading } from "@/lib/loading-context"

export function GlobalLoading() {
  const { loading } = useLoading()

  return (
    <AnimatePresence>
      {loading.visible && (
        <motion.div
          key="global-loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/30" />

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative z-10 flex flex-col items-center gap-5 bg-white rounded-3xl px-10 py-8 shadow-2xl shadow-black/10 border border-slate-100"
          >
            {/* Spinner */}
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-[3px] border-slate-100" />
              <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-primary animate-spin" />
              <div className="absolute inset-1.5 rounded-full border-[2px] border-transparent border-t-blue-400 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
            </div>

            {/* Message */}
            <p className="text-sm font-black text-slate-700 uppercase tracking-widest text-center">
              {loading.message}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
