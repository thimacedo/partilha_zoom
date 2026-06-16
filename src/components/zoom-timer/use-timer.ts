'use client'

import { useEffect, useRef } from 'react'
import { useTimerStore } from '@/store/timer-store'
import { useAudio } from './use-audio'

export function useTimer() {
  const tick = useTimerStore((s) => s.tick)
  const isRunning = useTimerStore((s) => s.isRunning)
  const isPaused = useTimerStore((s) => s.isPaused)
  const phase = useTimerStore((s) => s.phase)
  const { playChime, playAlert } = useAudio()
  const prevPhaseRef = useRef(phase)

  useEffect(() => {
    if (!isRunning || isPaused) return

    const interval = setInterval(() => {
      tick()
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, isPaused, tick])

  // Play sounds on phase transitions
  useEffect(() => {
    if (prevPhaseRef.current !== phase) {
      if (phase === 'phaseTransition') {
        playChime()
      } else if (phase === 'timeUp') {
        playAlert()
      }
      prevPhaseRef.current = phase
    }
  }, [phase, playChime, playAlert])
}
