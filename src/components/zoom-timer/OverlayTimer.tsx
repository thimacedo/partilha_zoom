'use client'

import { useTimerStore, TimerPhase } from '@/store/timer-store'
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, VolumeX, Eye, EyeOff, Video } from 'lucide-react'
import { useZoomSdk } from '@/hooks/use-zoom-sdk'

function formatTimeCompact(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

function getCompactTextColor(phase: TimerPhase, totalRemaining: number, phase2Seconds: number): string {
  if (phase === 'idle') return 'text-white'
  if (phase === 'timeUp') return 'text-red-300'
  if (phase === 'phaseTransition') return 'text-amber-300'
  
  if (totalRemaining <= 30) return 'text-red-300'
  if (totalRemaining <= phase2Seconds) return 'text-amber-300'
  
  const phase1Remaining = totalRemaining - phase2Seconds
  if (phase1Remaining <= 30) return 'text-amber-300'
  
  return 'text-emerald-300'
}

function getCompactBg(phase: TimerPhase, totalRemaining: number, phase2Seconds: number): string {
  if (phase === 'idle') return 'bg-gray-900/95'
  if (phase === 'timeUp') return 'bg-red-950/95'
  if (phase === 'phaseTransition') return 'bg-amber-950/95'
  
  if (totalRemaining <= 30) return 'bg-red-950/95'
  if (totalRemaining <= phase2Seconds) return 'bg-amber-950/95'
  
  const phase1Remaining = totalRemaining - phase2Seconds
  if (phase1Remaining <= 30) return 'bg-amber-950/95'
  
  return 'bg-gray-900/95'
}

export function OverlayTimer({ isCameraContext = false }: { isCameraContext?: boolean }) {
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
  const showPhaseTransition = useTimerStore((s) => s.showPhaseTransition)
  const dismissPhaseTransition = useTimerStore((s) => s.dismissPhaseTransition)

  const currentSpeaker = currentSpeakerIndex >= 0 && currentSpeakerIndex < speakers.length
    ? speakers[currentSpeakerIndex]
    : null

  const totalRemainingSeconds = 
    phase === 'idle' ? (phase1Seconds + phase2Seconds) :
    phase === 'phase1' ? (remainingSeconds + phase2Seconds) :
    phase === 'phaseTransition' ? phase2Seconds :
    phase === 'phase2' ? remainingSeconds :
    0;

  const totalDuration = phase1Seconds + phase2Seconds
  const progress = totalDuration > 0 && phase !== 'idle' && phase !== 'timeUp'
    ? ((totalDuration - totalRemainingSeconds) / totalDuration) * 100
    : 0

  const timeDisplay = formatTimeCompact(totalRemainingSeconds)
  const textColor = getCompactTextColor(phase, totalRemainingSeconds, phase2Seconds)
  const bgColor = getCompactBg(phase, totalRemainingSeconds, phase2Seconds)

  // Auto-show overlay when timer is running
  // In Camera Context, we always want it visible
  const shouldShowOverlay = isCameraContext || overlayVisible || isRunning || phase === 'timeUp'

  if (!shouldShowOverlay) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, x: 20 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        exit={{ opacity: 0, y: -20, x: 20 }}
        className={isCameraContext ? "relative" : "fixed top-3 right-3 z-50"}
      >
        <div className={`${bgColor} backdrop-blur-md rounded-xl shadow-2xl border border-white/10 overflow-hidden transition-colors duration-500`}>
          {/* Main overlay row */}
          <div className="px-3 py-2 sm:px-3.5 sm:py-2.5 flex items-center gap-2">
            {/* Mini circular progress */}
            {phase !== 'idle' && phase !== 'timeUp' && totalDuration > 0 && (
              <div className="relative w-9 h-9 shrink-0">
                <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2.5" />
                  <circle
                    cx="18" cy="18" r="14" fill="none"
                    stroke={totalRemainingSeconds <= 30 ? '#ef4444' : totalRemainingSeconds <= phase2Seconds ? '#f59e0b' : '#10b981'}
                    strokeWidth="2.5" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 14}`}
                    strokeDashoffset={`${2 * Math.PI * 14 * (1 - progress / 100)}`}
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-[7px] font-bold ${textColor}`}>
                    {phase === 'phase1' ? '1ª' : '2ª'}
                  </span>
                </div>
              </div>
            )}

            {/* Timer info column */}
            <div className="flex flex-col gap-0.5 min-w-0">
              {/* Main time row */}
              <div className="flex items-center gap-1.5">
                {phase === 'idle' && (
                  <span className="text-[9px] font-bold uppercase tracking-wider text-white/50 bg-white/10 px-1.5 py-0.5 rounded">
                    PRONTO
                  </span>
                )}
                {phase === 'timeUp' && (
                  <span className="text-[9px] font-bold uppercase tracking-wider text-red-300 bg-red-500/20 px-1.5 py-0.5 rounded">
                    FIM
                  </span>
                )}
                <span className={`text-lg sm:text-xl font-bold tabular-nums leading-none ${textColor} transition-colors duration-500`}>
                  {timeDisplay}
                </span>
                {isPaused && (
                  <span className="text-[8px] font-bold text-amber-300 bg-amber-500/20 px-1 py-0.5 rounded leading-none">
                    PAUSE
                  </span>
                )}
              </div>

              {/* Phase info sub-row */}
              <div className="flex items-center gap-1.5 text-[9px] leading-none">
                {phase === 'phase1' && (
                  <span className="text-white/40">
                    restam {formatTimeCompact(totalRemainingSeconds)} no total
                  </span>
                )}
                {phase === 'phase2' && (
                  <span className="text-white/40">tempo final</span>
                )}
                {phase === 'idle' && (
                  <span className="text-white/30">{formatTimeCompact(totalRemainingSeconds)} total</span>
                )}
              </div>
            </div>

            {/* Current speaker */}
            {currentSpeaker && (
              <div className="hidden sm:flex items-center gap-1 pl-2 border-l border-white/20 shrink-0">
                <span className="text-[10px] text-white/60">👤</span>
                <span className="text-[11px] font-medium text-white/90 max-w-[80px] truncate">
                  {currentSpeaker.name}
                </span>
              </div>
            )}

            {/* Controls */}
            {!isCameraContext && (
              <div className="flex items-center gap-0.5 pl-2 border-l border-white/20 shrink-0">
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
            )}
          </div>

          {/* Phase transition message in overlay */}
          <AnimatePresence>
            {showPhaseTransition && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="bg-amber-500/20 border-t border-amber-400/30 px-3 py-2 flex items-center justify-between gap-2">
                  <span className="text-amber-300 text-xs font-bold pl-1">
                    {phase2Seconds >= 60 
                      ? `${Math.floor(phase2Seconds / 60)} ${Math.floor(phase2Seconds / 60) === 1 ? 'Minuto' : 'Minutos'}`
                      : `${phase2Seconds} Segundos`
                    }
                  </span>
                  <button
                    onClick={dismissPhaseTransition}
                    className="text-[9px] text-amber-300/90 hover:text-amber-200 bg-amber-500/30 hover:bg-amber-500/40 px-2 py-0.5 rounded shrink-0 transition-colors font-semibold"
                  >
                    OK
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Time up message in overlay */}
          <AnimatePresence>
            {phase === 'timeUp' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="bg-red-600/30 border-t border-red-400/30 px-3 py-2 text-center">
                  <span className="text-xs font-bold text-red-200">
                    ⏰ Tempo esgotado!
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export function OverlayToggleButton() {
  const { isInZoom, setCameraMode, runningContext } = useZoomSdk()
  const overlayMode = useTimerStore((s) => s.overlayMode)
  const toggleOverlay = useTimerStore((s) => s.toggleOverlay)
  const isRunning = useTimerStore((s) => s.isRunning)
  const phase = useTimerStore((s) => s.phase)

  const isActive = overlayMode || isRunning || phase === 'timeUp'
  const isCameraActive = runningContext === 'inCamera'

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={toggleOverlay}
        className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-md transition-colors ${
          isActive
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
            : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
        }`}
        title={isActive ? 'Ocultar timer na tela' : 'Mostrar timer na tela (SPH)'}
      >
        {isActive ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
        <span className="hidden sm:inline">{isActive ? 'Visível' : 'SPH'}</span>
      </button>

      {isInZoom && (
        <button
          onClick={setCameraMode}
          disabled={isCameraActive}
          className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-md transition-colors ${
            isCameraActive
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
              : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
          title="Colocar timer sobre o seu vídeo para todos verem"
        >
          <Video className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{isCameraActive ? 'Na Câmera' : 'Vídeo'}</span>
        </button>
      )}
    </div>
  )
}
