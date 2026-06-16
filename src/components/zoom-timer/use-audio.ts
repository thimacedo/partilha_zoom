'use client'

import { useCallback, useRef } from 'react'
import { useTimerStore } from '@/store/timer-store'

export function useAudio() {
  const audioContextRef = useRef<AudioContext | null>(null)
  const soundEnabled = useTimerStore((s) => s.soundEnabled)

  const getContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext()
    }
    return audioContextRef.current
  }, [])

  const playChime = useCallback(() => {
    if (!soundEnabled) return
    try {
      const ctx = getContext()
      const now = ctx.currentTime

      // Create a gentle chime with two tones
      const frequencies = [523.25, 659.25] // C5, E5
      frequencies.forEach((freq, i) => {
        const oscillator = ctx.createOscillator()
        const gainNode = ctx.createGain()
        
        oscillator.type = 'sine'
        oscillator.frequency.setValueAtTime(freq, now + i * 0.3)
        
        gainNode.gain.setValueAtTime(0, now + i * 0.3)
        gainNode.gain.linearRampToValueAtTime(0.3, now + i * 0.3 + 0.05)
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + i * 0.3 + 0.8)
        
        oscillator.connect(gainNode)
        gainNode.connect(ctx.destination)
        
        oscillator.start(now + i * 0.3)
        oscillator.stop(now + i * 0.3 + 0.8)
      })
    } catch {
      // Audio not available
    }
  }, [soundEnabled, getContext])

  const playAlert = useCallback(() => {
    if (!soundEnabled) return
    try {
      const ctx = getContext()
      const now = ctx.currentTime

      // More urgent alert sound - three ascending tones
      const frequencies = [440, 554.37, 659.25] // A4, C#5, E5
      frequencies.forEach((freq, i) => {
        const oscillator = ctx.createOscillator()
        const gainNode = ctx.createGain()
        
        oscillator.type = 'triangle'
        oscillator.frequency.setValueAtTime(freq, now + i * 0.25)
        
        gainNode.gain.setValueAtTime(0, now + i * 0.25)
        gainNode.gain.linearRampToValueAtTime(0.4, now + i * 0.25 + 0.03)
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + i * 0.25 + 0.6)
        
        oscillator.connect(gainNode)
        gainNode.connect(ctx.destination)
        
        oscillator.start(now + i * 0.25)
        oscillator.stop(now + i * 0.25 + 0.6)
      })
    } catch {
      // Audio not available
    }
  }, [soundEnabled, getContext])

  return { playChime, playAlert }
}
