'use client'

import { useTimerStore, TimerPhase } from '@/store/timer-store'
import { Card } from '@/components/ui/card'
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

function getPhaseColor(phase: TimerPhase, remainingSeconds: number): string {
  if (phase === 'idle') return 'from-emerald-500/10 to-teal-500/10'
  if (phase === 'timeUp') return 'from-red-500/10 to-rose-500/10'
  if (phase === 'phaseTransition') return 'from-amber-500/10 to-orange-500/10'
  
  // Warning colors when time is running low
  const totalForPhase = phase === 'phase1' 
    ? useTimerStore.getState().phase1Minutes * 60 
    : useTimerStore.getState().phase2Minutes * 60
  
  if (phase === 'phase1') {
    return 'from-emerald-500/10 to-teal-500/10'
  }
  if (phase === 'phase2') {
    if (remainingSeconds <= 30) return 'from-red-500/10 to-rose-500/10'
    if (remainingSeconds <= 60) return 'from-amber-500/10 to-orange-500/10'
    return 'from-amber-500/10 to-orange-500/10'
  }
  return 'from-emerald-500/10 to-teal-500/10'
}

function getTextColor(phase: TimerPhase, remainingSeconds: number): string {
  if (phase === 'idle') return 'text-emerald-600'
  if (phase === 'timeUp') return 'text-red-600'
  if (phase === 'phaseTransition') return 'text-amber-600'
  if (phase === 'phase1') {
    if (remainingSeconds <= 30) return 'text-amber-600'
    return 'text-emerald-600'
  }
  if (phase === 'phase2') {
    if (remainingSeconds <= 30) return 'text-red-600'
    if (remainingSeconds <= 60) return 'text-amber-600'
    return 'text-amber-600'
  }
  return 'text-emerald-600'
}

function getProgress(phase: TimerPhase, remainingSeconds: number): number {
  if (phase === 'idle' || phase === 'timeUp') return 0
  const totalForPhase = phase === 'phase1' 
    ? useTimerStore.getState().phase1Minutes * 60 
    : useTimerStore.getState().phase2Minutes * 60
  if (totalForPhase === 0) return 0
  return ((totalForPhase - remainingSeconds) / totalForPhase) * 100
}

export function TimerDisplay() {
  const phase = useTimerStore((s) => s.phase)
  const remainingSeconds = useTimerStore((s) => s.remainingSeconds)
  const isPaused = useTimerStore((s) => s.isPaused)
  const isRunning = useTimerStore((s) => s.isRunning)
  const phase1Minutes = useTimerStore((s) => s.phase1Minutes)
  const phase2Minutes = useTimerStore((s) => s.phase2Minutes)

  const timeDisplay = formatTime(remainingSeconds)
  const phaseLabel = getPhaseLabel(phase)
  const bgGradient = getPhaseColor(phase, remainingSeconds)
  const textColor = getTextColor(phase, remainingSeconds)
  const progress = getProgress(phase, remainingSeconds)

  const progressColor = useMemo(() => {
    if (phase === 'phase1') return 'bg-emerald-500'
    if (phase === 'phase2') {
      if (remainingSeconds <= 30) return 'bg-red-500'
      if (remainingSeconds <= 60) return 'bg-amber-500'
      return 'bg-amber-500'
    }
    return 'bg-emerald-500'
  }, [phase, remainingSeconds])

  const totalSeconds = (phase === 'phase1' ? phase1Minutes : phase2Minutes) * 60

  return (
    <Card className={`w-full overflow-hidden border-border/50 shadow-sm bg-gradient-to-br ${bgGradient} transition-colors duration-500`}>
      <div className="p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center gap-2 sm:gap-3">
        {/* Phase label */}
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium uppercase tracking-wider ${textColor} transition-colors duration-500`}>
            {phaseLabel}
          </span>
          {isPaused && (
            <span className="text-xs font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
              PAUSADO
            </span>
          )}
        </div>

        {/* Main time display */}
        <div className={`text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tabular-nums tracking-tight ${textColor} transition-colors duration-500`}>
          {timeDisplay}
        </div>

        {/* Progress bar */}
        {(phase === 'phase1' || phase === 'phase2') && totalSeconds > 0 && (
          <div className="w-full max-w-md mt-2">
            <div className="h-2 bg-black/10 rounded-full overflow-hidden">
              <div
                className={`h-full ${progressColor} rounded-full transition-all duration-1000 ease-linear`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
              <span>0:00</span>
              <span>{phase === 'phase1' ? `${phase1Minutes}:00` : `${phase2Minutes}:00`}</span>
            </div>
          </div>
        )}

        {/* Phase indicator dots */}
        <div className="flex items-center gap-3 mt-2">
          <div className={`h-2.5 w-2.5 rounded-full transition-colors duration-300 ${
            phase === 'phase1' ? 'bg-emerald-500 ring-2 ring-emerald-500/30' : 
            phase === 'phaseTransition' || phase === 'phase2' || phase === 'timeUp' ? 'bg-emerald-500' : 'bg-gray-300'
          }`} />
          <div className="h-0.5 w-8 bg-border" />
          <div className={`h-2.5 w-2.5 rounded-full transition-colors duration-300 ${
            phase === 'phase2' ? 'bg-amber-500 ring-2 ring-amber-500/30' : 
            phase === 'timeUp' ? 'bg-amber-500' : 'bg-gray-300'
          }`} />
        </div>
      </div>
    </Card>
  )
}
