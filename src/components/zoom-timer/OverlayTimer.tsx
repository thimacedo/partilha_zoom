'use client'

import { useTimerStore, TimerPhase } from '@/store/timer-store'
import { motion, AnimatePresence } from 'framer-motion'
import { Minimize2, Maximize2, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
  if (phase === 'idle') return 'bg-gray-900/90'
  if (phase === 'timeUp') return 'bg-red-950/95'
  if (phase === 'phaseTransition') return 'bg-amber-950/95'
  if (phase === 'phase1') {
    if (remaining <= 30) return 'bg-amber-950/90'
    return 'bg-gray-900/90'
  }
  if (phase === 'phase2') {
    if (remaining <= 30) return 'bg-red-950/90'
    if (remaining <= 60) return 'bg-amber-950/90'
    return 'bg-gray-900/90'
  }
  return 'bg-gray-900/90'
}

export function OverlayTimer() {
  const overlayMode = useTimerStore((s) => s.overlayMode)
  const toggleOverlay = useTimerStore((s) => s.toggleOverlay)
  const phase = useTimerStore((s) => s.phase)
  const remainingSeconds = useTimerStore((s) => s.remainingSeconds)
  const isPaused = useTimerStore((s) => s.isPaused)
  const isRunning = useTimerStore((s) => s.isRunning)
  const soundEnabled = useTimerStore((s) => s.soundEnabled)
  const toggleSound = useTimerStore((s) => s.toggleSound)
  const speakers = useTimerStore((s) => s.speakers)
  const currentSpeakerIndex = useTimerStore((s) => s.currentSpeakerIndex)

  const currentSpeaker = currentSpeakerIndex >= 0 && currentSpeakerIndex < speakers.length
    ? speakers[currentSpeakerIndex]
    : null

  const textColor = getCompactTextColor(phase, remainingSeconds)
  const bgColor = getCompactBg(phase, remainingSeconds)
  const phaseLabel = getPhaseShortLabel(phase)

  if (!overlayMode) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-3 right-3 z-50"
      >
        <div className={`${bgColor} backdrop-blur-sm rounded-xl shadow-2xl border border-white/10 overflow-hidden transition-colors duration-500`}>
          {/* Main overlay content */}
          <div className="p-3 flex items-center gap-3">
            {/* Timer display */}
            <div className="flex items-center gap-2">
              {phaseLabel && (
                <span className={`text-[10px] font-bold uppercase tracking-wider ${textColor} bg-white/10 px-1.5 py-0.5 rounded`}>
                  {phaseLabel}
                </span>
              )}
              <span className={`text-2xl sm:text-3xl font-bold tabular-nums ${textColor} transition-colors duration-500`}>
                {phase === 'idle' ? '--:--' : formatTimeCompact(remainingSeconds)}
              </span>
              {isPaused && (
                <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded">
                  PAUSE
                </span>
              )}
            </div>

            {/* Current speaker */}
            {currentSpeaker && (
              <div className="hidden sm:flex items-center gap-1.5 pl-2 border-l border-white/20">
                <span className="text-[10px] text-white/60">👤</span>
                <span className="text-xs font-medium text-white/90 max-w-[80px] truncate">
                  {currentSpeaker.name}
                </span>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center gap-1 pl-2 border-l border-white/20">
              <button
                onClick={toggleSound}
                className="p-1 rounded hover:bg-white/10 transition-colors"
                title={soundEnabled ? 'Desativar som' : 'Ativar som'}
              >
                {soundEnabled ? (
                  <Volume2 className="h-3.5 w-3.5 text-white/70" />
                ) : (
                  <VolumeX className="h-3.5 w-3.5 text-white/40" />
                )}
              </button>
              <button
                onClick={toggleOverlay}
                className="p-1 rounded hover:bg-white/10 transition-colors"
                title="Modo completo"
              >
                <Maximize2 className="h-3.5 w-3.5 text-white/70" />
              </button>
            </div>
          </div>

          {/* Time up overlay animation */}
          {phase === 'timeUp' && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              className="bg-red-600/30 border-t border-red-400/30 px-3 py-2"
            >
              <div className="text-center text-sm font-bold text-red-200">
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

  if (overlayMode) return null

  return (
    <Button
      onClick={toggleOverlay}
      variant="outline"
      size="sm"
      className="gap-1.5 text-xs"
      title="Modo sobreposição (Zoom)"
    >
      <Minimize2 className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">Modo Zoom</span>
    </Button>
  )
}
