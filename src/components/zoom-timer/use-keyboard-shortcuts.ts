'use client'

import { useEffect } from 'react'
import { useTimerStore } from '@/store/timer-store'

export function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }

      const store = useTimerStore.getState()
      const { phase, isRunning, isPaused } = store

      switch (e.key) {
        case 'Enter':
          if (phase === 'idle') {
            e.preventDefault()
            store.startTimer()
          }
          break
        case ' ':
          e.preventDefault()
          if (isRunning && !isPaused) {
            store.pauseTimer()
          } else if (isPaused) {
            store.resumeTimer()
          } else if (phase === 'idle') {
            store.startTimer()
          }
          break
        case 'Escape':
          e.preventDefault()
          if (store.fullscreenMode) {
            store.toggleFullscreen()
          } else {
            store.resetTimer()
          }
          break
        case 'f':
        case 'F':
          e.preventDefault()
          store.toggleFullscreen()
          break
        case 'o':
        case 'O':
          e.preventDefault()
          store.toggleOverlay()
          break
        case 'm':
        case 'M':
          e.preventDefault()
          store.toggleSound()
          break
        case 'd':
        case 'D':
          e.preventDefault()
          store.toggleDarkMode()
          break
        case 'n':
        case 'N':
          e.preventDefault()
          if (store.currentSpeakerIndex < store.speakers.length - 1) {
            store.nextSpeaker()
            if (phase !== 'idle') {
              store.resetTimer()
              setTimeout(() => store.startTimer(), 50)
            }
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
}
