'use client'

import { useTimerStore, TimerPhase } from '@/store/timer-store'
import { motion, AnimatePresence } from 'framer-motion'
import { Maximize2, Minimize2, Volume2, VolumeX, Eye, EyeOff } from 'lucide-react'

function formatTimeCompact(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

function getPhaseShortLabel(phase: TimerPhase): string {
  switch (phase) {
    case 'idle': return ''
    case 'phase1': return '1ª'
    case 'phaseTransition': return '→'
    case 'phase2': return '2ª'
    case 'timeUp': return 'FIM'
  }
}

function getCompactTextColor(phase: TimerPhase, remaining: number): string {
  if (phase === 'idle') return 'text-white'
  if (phase === 'timeUp') return 'text-red-300'
  if (phase === 'phaseTransition') return 'text-amber-300'
  if (phase === 'phase1') {
    if (remaining <= 30) return 'text-amber-300'
    return 'text-emerald-300'
  }
  if (phase === 'phase2') {
    if (remaining <= 30) return 'text-red-300'
    if (remaining <= 60) return 'text-amber-300'
    return 'text-amber-300'
  }
  return 'text-white'
}

function getCompactBg(phase: TimerPhase, remaining: number): string {
  if (phase === 'idle') return 'bg-gray-900/95'
  if (phase === 'timeUp') return 'bg-red-950/95'
  if (phase === 'phaseTransition') return 'bg-amber-950/95'
  if (phase === 'phase1') {
    if (remaining <= 30) return 'bg-amber-950/95'
    return 'bg-gray-900/95'
  }
  if (phase === 'phase2') {
    if (remaining <= 30) return 'bg-red-950/95'
    if (remaining <= 60) return 'bg-amber-950/95'
    return 'bg-gray-900/95'
  }
  return 'bg-gray-900/95'
}

export function OverlayTimer() {
  const overlayVisible = useTimerStore((s) => s.overlayMode)
  const toggleOverlay = useTimerStore((s) => s.toggleOverlay)
  const phase = useTimerStore((s) => s.phase)
  const remainingSeconds = useTimerStore((s) => s.remainingSeconds)
  const isPaused = useTimerStore((s) => s.isPaused)
  const isRunning = useTimerStore((s) => s.isRunning)
  const soundEnabled = useTimerStore((s) => s.soundEnabled)
  const toggleSound = useTimerStore((s) => s.toggleSound)
  const speakers = useTimerStore((s) => s.speakers)
  const currentSpeakerIndex = useTimerStore((s) => s.currentSpeakerIndex)
  const phase1Seconds = useTimerStore((s) => s.phase1Seconds)
  const phase2Seconds = useTimerStore((s) => s.phase2Seconds)

  const currentSpeaker = currentSpeakerIndex >= 0 && currentSpeakerIndex < speakers.length
    ? speakers[currentSpeakerIndex]
    : null

  const textColor = getCompactTextColor(phase, remainingSeconds)
  const bgColor = getCompactBg(phase, remainingSeconds)
  const phaseLabel = getPhaseShortLabel(phase)

  // Auto-show overlay when timer is running (natural Zoom behavior)
  const shouldShowOverlay = overlayVisible || isRunning || phase === 'timeUp'

  // Progress for mini ring
  const totalForPhase = phase === 'phase1' ? phase1Seconds : phase2Seconds
  const progress = totalForPhase > 0 && (phase === 'phase1' || phase === 'phase2')
    ? ((totalForPhase - remainingSeconds) / totalForPhase) * 100
    : 0

  if (!shouldShowOverlay) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, x: 20 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        exit={{ opacity: 0, y: -20, x: 20 }}
        className="fixed top-3 right-3 z-50"
      >
        <div className={`${bgColor} backdrop-blur-md rounded-xl shadow-2xl border border-white/10 overflow-hidden transition-colors duration-500`}>
          <div className="p-2.5 sm:p-3 flex items-center gap-2.5">
            {/* Mini circular progress */}
            {(phase === 'phase1' || phase === 'phase2') && totalForPhase > 0 && (
              <div className="relative w-10 h-10 shrink-0">
                <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                  <circle
                    cx="20" cy="20" r="16" fill="none"
                    stroke={phase === 'phase1' ? '#10b981' : remainingSeconds <= 30 ? '#ef4444' : '#f59e0b'}
                    strokeWidth="3" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 16}`}
                    strokeDashoffset={`${2 * Math.PI * 16 * (1 - progress / 100)}`}
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-[8px] font-bold ${textColor}`}>{phaseLabel}</span>
                </div>
              </div>
            )}

            {/* Timer display */}
            <div className="flex items-center gap-2">
              {(phase === 'idle' || phase === 'timeUp') && phaseLabel && (
                <span className={`text-[9px] font-bold uppercase tracking-wider ${textColor} bg-white/10 px-1.5 py-0.5 rounded`}>
                  {phaseLabel}
                </span>
              )}
              <span className={`text-xl sm:text-2xl font-bold tabular-nums ${textColor} transition-colors duration-500`}>
                {phase === 'idle' ? '--:--' : formatTimeCompact(remainingSeconds)}
              </span>
              {isPaused && (
                <span className="text-[9px] font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded">
                  PAUSE
                </span>
              )}
            </div>

            {/* Current speaker */}
            {currentSpeaker && (
              <div className="hidden sm:flex items-center gap-1 pl-2 border-l border-white/20">
                <span className="text-[10px] text-white/60">👤</span>
                <span className="text-xs font-medium text-white/90 max-w-[80px] truncate">
                  {currentSpeaker.name}
                </span>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center gap-0.5 pl-2 border-l border-white/20">
              <button
                onClick={toggleSound}
                className="p-1.5 rounded hover:bg-white/10 transition-colors"
                title={soundEnabled ? 'Desativar som' : 'Ativar som'}
              >
                {soundEnabled ? <Volume2 className="h-3 w-3 text-white/70" /> : <VolumeX className="h-3 w-3 text-white/40" />}
              </button>
              <button
                onClick={toggleOverlay}
                className="p-1.5 rounded hover:bg-white/10 transition-colors"
                title={overlayVisible ? 'Ocultar overlay' : 'Mostrar overlay'}
              >
                {overlayVisible ? <Eye className="h-3 w-3 text-white/70" /> : <EyeOff className="h-3 w-3 text-white/40" />}
              </button>
            </div>
          </div>

          {/* Time up overlay animation */}
          {phase === 'timeUp' && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              className="bg-red-600/30 border-t border-red-400/30 px-3 py-1.5"
            >
              <div className="text-center text-xs font-bold text-red-200">
                Tempo esgotado!
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export function OverlayToggleButton() {
  const overlayMode = useTimerStore((s) => s.overlayMode)
  const toggleOverlay = useTimerStore((s) => s.toggleOverlay)
  const isRunning = useTimerStore((s) => s.isRunning)
  const phase = useTimerStore((s) => s.phase)

  // Overlay auto-shows when running, so the toggle controls whether it stays visible when idle
  const isActive = overlayMode || isRunning || phase === 'timeUp'

  return (
    <button
      onClick={toggleOverlay}
      className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-md transition-colors ${
        isActive
          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
          : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
      }`}
      title={isActive ? 'Ocultar timer na tela' : 'Mostrar timer na tela (Zoom)'}
    >
      {isActive ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
      <span className="hidden sm:inline">{isActive ? 'Visível' : 'Zoom'}</span>
    </button>
  )
}
