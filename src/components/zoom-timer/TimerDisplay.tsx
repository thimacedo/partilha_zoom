'use client'

import { useTimerStore, TimerPhase } from '@/store/timer-store'

function formatTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

function getPhaseLabel(phase: TimerPhase): string {
  switch (phase) {
    case 'idle': return 'Pronto'
    case 'phase1': return ''
    case 'phaseTransition': return 'Transição'
    case 'phase2': return ''
    case 'timeUp': return 'Tempo Esgotado'
  }
}

function getTextColor(phase: TimerPhase, totalRemainingSeconds: number, phase2Seconds: number): string {
  if (phase === 'idle') return 'text-emerald-600 dark:text-emerald-400'
  if (phase === 'timeUp') return 'text-red-600 dark:text-red-400'
  if (phase === 'phaseTransition') return 'text-amber-600 dark:text-amber-400'
  
  if (totalRemainingSeconds <= 30) return 'text-red-600 dark:text-red-400'
  if (totalRemainingSeconds <= phase2Seconds) return 'text-amber-600 dark:text-amber-400'
  
  const phase1Remaining = totalRemainingSeconds - phase2Seconds;
  if (phase1Remaining <= 30) return 'text-amber-600 dark:text-amber-400'
  
  return 'text-emerald-600 dark:text-emerald-400'
}

function getRingColor(phase: TimerPhase, totalRemainingSeconds: number, phase2Seconds: number): string {
  if (phase === 'idle') return '#10b981' // emerald-500
  if (phase === 'timeUp') return '#ef4444' // red-500
  if (phase === 'phaseTransition') return '#f59e0b' // amber-500
  
  if (totalRemainingSeconds <= 30) return '#ef4444' // red-500
  if (totalRemainingSeconds <= phase2Seconds) return '#f59e0b' // amber-500
  
  const phase1Remaining = totalRemainingSeconds - phase2Seconds;
  if (phase1Remaining <= 30) return '#f59e0b' // amber-500
  
  return '#10b981' // emerald-500
}

export function TimerDisplay() {
  const phase = useTimerStore((s) => s.phase)
  const remainingSeconds = useTimerStore((s) => s.remainingSeconds)
  const isPaused = useTimerStore((s) => s.isPaused)
  const phase1Seconds = useTimerStore((s) => s.phase1Seconds)
  const phase2Seconds = useTimerStore((s) => s.phase2Seconds)
  const customEndMessage = useTimerStore((s) => s.customEndMessage)
  
  const speakers = useTimerStore((s) => s.speakers)
  const currentSpeakerIndex = useTimerStore((s) => s.currentSpeakerIndex)

  const currentSpeaker = currentSpeakerIndex >= 0 && currentSpeakerIndex < speakers.length
    ? speakers[currentSpeakerIndex]
    : null

  const totalRemainingSeconds = 
    phase === 'idle' ? (phase1Seconds + phase2Seconds) :
    phase === 'phase1' ? (remainingSeconds + phase2Seconds) :
    phase === 'phaseTransition' ? phase2Seconds :
    phase === 'phase2' ? remainingSeconds :
    0;

  const totalDuration = phase1Seconds + phase2Seconds;
  const progress = totalDuration > 0 && phase !== 'idle' && phase !== 'timeUp'
    ? ((totalDuration - totalRemainingSeconds) / totalDuration) * 100
    : 0;

  const timeDisplay = formatTime(totalRemainingSeconds)
  const phaseLabel = getPhaseLabel(phase)
  const textColor = getTextColor(phase, totalRemainingSeconds, phase2Seconds)
  const ringColor = getRingColor(phase, totalRemainingSeconds, phase2Seconds)

  // SVG circular ring calculations
  const radius = 85
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className="w-full bg-card/40 backdrop-blur-md border border-border/60 rounded-2xl p-6 sm:p-8 md:p-10 shadow-xl flex flex-col items-center justify-center transition-all duration-300">
      {/* Circular SVG timer ring */}
      <div className="relative w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 flex items-center justify-center">
        <svg
          className="absolute inset-0 -rotate-90 w-full h-full"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Base Background Track */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            className="text-muted/30 dark:text-muted/10"
          />

          {/* Dotted/Dashed guide track when Idle */}
          {phase === 'idle' && (
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke={ringColor}
              strokeWidth="4"
              strokeDasharray="4 4"
              className="opacity-30"
            />
          )}

          {/* Progress stroke */}
          {phase !== 'idle' && phase !== 'timeUp' && (
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
          )}

          {/* Time up pulsing ring */}
          {phase === 'timeUp' && (
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke={ringColor}
              strokeWidth="5"
              className="animate-pulse"
            />
          )}
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
          {/* Phase label */}
          <div className="flex items-center gap-2">
            <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest ${textColor} transition-colors duration-500 bg-current/10 px-2.5 py-0.5 rounded-full`}>
              {phaseLabel}
            </span>
            {isPaused && (
              <span className="text-[10px] sm:text-xs font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full animate-pulse">
                PAUSADO
              </span>
            )}
          </div>

          {/* Main time display */}
          <div className={`text-5xl sm:text-6xl md:text-7xl font-extrabold tabular-nums tracking-tight ${textColor} transition-colors duration-500 drop-shadow-sm`}>
            {timeDisplay}
          </div>

          {/* Active speaker (Spotlight) */}
          {currentSpeaker && (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[10px] sm:text-xs px-3 py-1 rounded-full border border-emerald-200/50 dark:border-emerald-800/40 font-semibold flex items-center gap-1.5 mt-1 max-w-[180px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="truncate">{currentSpeaker.name}</span>
            </div>
          )}

          {/* Phase indicator dots */}
          <div className="flex items-center gap-2 mt-2">
            <div className={`h-2 w-2 rounded-full transition-colors duration-300 ${
              phase === 'phase1' ? 'bg-emerald-500 ring-4 ring-emerald-500/30' : 
              ['phaseTransition', 'phase2', 'timeUp'].includes(phase) ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'
            }`} />
            <div className="h-0.5 w-6 bg-border/50" />
            <div className={`h-2 w-2 rounded-full transition-colors duration-300 ${
              phase === 'phase2' ? 'bg-amber-500 ring-4 ring-amber-500/30' : 
              phase === 'timeUp' ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-700'
            }`} />
          </div>

          {/* Phase info */}
          {phase === 'idle' && (
            <div className="text-[9px] sm:text-[10px] text-muted-foreground mt-1 text-center font-medium">
              {formatTime(phase1Seconds)} + {formatTime(phase2Seconds)} (total)
            </div>
          )}
          {phase === 'phase1' && (
            <div className="text-[9px] sm:text-[10px] text-muted-foreground mt-1 text-center">
              <span>Restam {formatTime(remainingSeconds)}</span>
              <span className="mx-1">·</span>
              <span className="font-semibold text-foreground">total {formatTime(totalRemainingSeconds)}</span>
            </div>
          )}
          {phase === 'phase2' && (
            <div className="text-[9px] sm:text-[10px] text-muted-foreground mt-1 text-center font-medium text-amber-600 dark:text-amber-400">
              {formatTime(remainingSeconds)} restantes
            </div>
          )}
          {phase === 'timeUp' && (
            <div className="text-[10px] sm:text-xs text-red-500 font-bold mt-1 max-w-[160px] truncate text-center" title={customEndMessage}>
              {customEndMessage || 'Tempo esgotado!'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
