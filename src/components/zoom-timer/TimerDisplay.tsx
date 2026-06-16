'use client'

import { useTimerStore, TimerPhase } from '@/store/timer-store'
import { useMemo } from 'react'

function formatTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

function getPhaseLabel(phase: TimerPhase): string {
  switch (phase) {
    case 'idle': return 'Pronto'
    case 'phase1': return '1ª Fase'
    case 'phaseTransition': return 'Transição'
    case 'phase2': return '2ª Fase'
    case 'timeUp': return 'Finalizado'
  }
}

function getTextColor(phase: TimerPhase, remainingSeconds: number): string {
  if (phase === 'idle') return 'text-emerald-600 dark:text-emerald-400'
  if (phase === 'timeUp') return 'text-red-600 dark:text-red-400'
  if (phase === 'phaseTransition') return 'text-amber-600 dark:text-amber-400'
  if (phase === 'phase1') {
    if (remainingSeconds <= 30) return 'text-amber-600 dark:text-amber-400'
    return 'text-emerald-600 dark:text-emerald-400'
  }
  if (phase === 'phase2') {
    if (remainingSeconds <= 30) return 'text-red-600 dark:text-red-400'
    if (remainingSeconds <= 60) return 'text-amber-600 dark:text-amber-400'
    return 'text-amber-600 dark:text-amber-400'
  }
  return 'text-emerald-600 dark:text-emerald-400'
}

function getRingColor(phase: TimerPhase, remainingSeconds: number): string {
  if (phase === 'phase1') {
    if (remainingSeconds <= 30) return '#f59e0b' // amber-500
    return '#10b981' // emerald-500
  }
  if (phase === 'phase2') {
    if (remainingSeconds <= 30) return '#ef4444' // red-500
    if (remainingSeconds <= 60) return '#f59e0b' // amber-500
    return '#f59e0b' // amber-500
  }
  return '#10b981' // emerald-500
}

function getTrackColor(phase: TimerPhase): string {
  if (phase === 'phase1') return 'rgba(16,185,129,0.15)'
  if (phase === 'phase2') return 'rgba(245,158,11,0.15)'
  return 'rgba(16,185,129,0.15)'
}

export function TimerDisplay() {
  const phase = useTimerStore((s) => s.phase)
  const remainingSeconds = useTimerStore((s) => s.remainingSeconds)
  const isPaused = useTimerStore((s) => s.isPaused)
  const phase1Seconds = useTimerStore((s) => s.phase1Seconds)
  const phase2Seconds = useTimerStore((s) => s.phase2Seconds)

  const timeDisplay = formatTime(remainingSeconds)
  const phaseLabel = getPhaseLabel(phase)
  const textColor = getTextColor(phase, remainingSeconds)

  const totalForPhase = phase === 'phase1' ? phase1Seconds : phase2Seconds
  const progress = totalForPhase > 0 && (phase === 'phase1' || phase === 'phase2')
    ? ((totalForPhase - remainingSeconds) / totalForPhase) * 100
    : 0

  const ringColor = getRingColor(phase, remainingSeconds)
  const trackColor = getTrackColor(phase)

  // SVG circular ring calculations
  const radius = 88
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  const showRing = phase === 'phase1' || phase === 'phase2'

  return (
    <div className="w-full flex flex-col items-center justify-center py-6 sm:py-8 md:py-10">
      {/* Circular SVG timer ring */}
      <div className="relative w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80">
        {showRing && (
          <svg
            className="absolute inset-0 -rotate-90"
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Track */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke={trackColor}
              strokeWidth="6"
            />
            {/* Progress */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke={ringColor}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
        )}

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 sm:gap-1.5">
          {/* Phase label */}
          <div className="flex items-center gap-2">
            <span className={`text-xs sm:text-sm font-medium uppercase tracking-wider ${textColor} transition-colors duration-500`}>
              {phaseLabel}
            </span>
            {isPaused && (
              <span className="text-[10px] sm:text-xs font-medium bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">
                PAUSADO
              </span>
            )}
          </div>

          {/* Main time display */}
          <div className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tabular-nums tracking-tight ${textColor} transition-colors duration-500`}>
            {phase === 'idle' ? '--:--' : timeDisplay}
          </div>

          {/* Phase indicator dots */}
          <div className="flex items-center gap-2 mt-1">
            <div className={`h-2 w-2 rounded-full transition-colors duration-300 ${
              phase === 'phase1' ? 'bg-emerald-500 ring-2 ring-emerald-500/30' : 
              ['phaseTransition', 'phase2', 'timeUp'].includes(phase) ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
            }`} />
            <div className="h-0.5 w-6 bg-border" />
            <div className={`h-2 w-2 rounded-full transition-colors duration-300 ${
              phase === 'phase2' ? 'bg-amber-500 ring-2 ring-amber-500/30' : 
              phase === 'timeUp' ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-600'
            }`} />
          </div>

          {/* Phase info */}
          {phase === 'phase1' && (
            <div className="text-[10px] sm:text-xs text-muted-foreground mt-1 text-center">
              <span>+ {formatTime(phase2Seconds)} na 2ª fase</span>
              <span className="mx-1">·</span>
              <span className="font-medium">total {formatTime(remainingSeconds + phase2Seconds)}</span>
            </div>
          )}
          {phase === 'phase2' && totalForPhase > 0 && (
            <div className="text-[10px] sm:text-xs text-muted-foreground mt-1">
              {formatTime(totalForPhase)} total desta fase
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
