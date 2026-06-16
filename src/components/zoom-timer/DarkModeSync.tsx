'use client'

import { useEffect } from 'react'
import { useTimerStore } from '@/store/timer-store'

/**
 * Syncs the Zustand darkMode state with the <html> element's class,
 * so Tailwind's dark: variant works properly.
 */
export function DarkModeSync() {
  const darkMode = useTimerStore((s) => s.darkMode)

  useEffect(() => {
    // Initialize from localStorage on mount
    const stored = localStorage.getItem('zoom-timer-state')
    if (stored) {
      try {
        const data = JSON.parse(stored)
        if (data.darkMode) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      } catch {
        // ignore
      }
    }
  }, [])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  return null
}
