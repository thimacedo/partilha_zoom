'use client'

import { useTimerStore, TimerPhase } from '@/store/timer-store'
import { motion, AnimatePresence } from 'framer-motion'
import { Minimize2, Volume2, VolumeX, SkipForward, Pause, Play, RotateCcw } from 'lucide-react'

function formatTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

function getPhaseLabel(phase: TimerPhase): string {
  switch (phase) {
    case 'idle': return ''
    case 'phase1': return '1ª Fase'
    case 'phaseTransition': return 'Transição'
    case 'phase2': return '2ª Fase'
    case 'timeUp': return 'Tempo Esgotado'
  }
}

function getBgColor(phase: TimerPhase, remaining: number): string {
  if (phase === 'idle') return 'from-gray-900 to-gray-950'
  if (phase === 'timeUp') return 'from-red-950 to-red-950'
  if (phase === 'phaseTransition') return 'from-amber-950 to-amber-950'
  if (phase === 'phase1') {
    if (remaining <= 30) return 'from-amber-950 to-gray-950'
    return 'from-emerald-950 to-gray-950'
  }
  if (phase === 'phase2') {
    if (remaining <= 30) return 'from-red-950 to-gray-950'
    if (remaining <= 60) return 'from-amber-950 to-gray-950'
    return 'from-amber-950/50 to-gray-950'
  }
  return 'from-gray-900 to-gray-950'
}

function getTimerColor(phase: TimerPhase, remaining: number): string {
  if (phase === 'idle') return 'text-white/60'
  if (phase === 'timeUp') return 'text-red-400'
  if (phase === 'phaseTransition') return 'text-amber-400'
  if (phase === 'phase1') {
    if (remaining <= 30) return 'text-amber-400'
    return 'text-emerald-400'
  }
  if (phase === 'phase2') {
    if (remaining <= 30) return 'text-red-400'
    if (remaining <= 60) return 'text-amber-400'
    return 'text-amber-400'
  }
  return 'text-white'
}

function getRingStroke(phase: TimerPhase, remaining: number): string {
  if (phase === 'phase1') {
    if (remaining <= 30) return '#f59e0b'
    return '#10b981'
  }
  if (phase === 'phase2') {
    if (remaining <= 30) return '#ef4444'
    if (remaining <= 60) return '#f59e0b'
    return '#f59e0b'
  }
  return '#10b981'
}

export function FullscreenTimer() {
  const fullscreenMode = useTimerStore((s) => s.fullscreenMode)
  const toggleFullscreen = useTimerStore((s) => s.toggleFullscreen)
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
  const customEndMessage = useTimerStore((s) => s.customEndMessage)
  const pauseTimer = useTimerStore((s) => s.pauseTimer)
  const resumeTimer = useTimerStore((s) => s.resumeTimer)
  const resetTimer = useTimerStore((s) => s.resetTimer)
  const nextSpeaker = useTimerStore((s) => s.nextSpeaker)
  const startTimer = useTimerStore((s) => s.startTimer)
  const showPhaseTransition = useTimerStore((s) => s.showPhaseTransition)
  const dismissPhaseTransition = useTimerStore((s) => s.dismissPhaseTransition)

  const currentSpeaker = currentSpeakerIndex >= 0 && currentSpeakerIndex < speakers.length
    ? speakers[currentSpeakerIndex]
    : null

  const totalForPhase = phase === 'phase1' ? phase1Seconds : phase2Seconds
  const progress = totalForPhase > 0 && (phase === 'phase1' || phase === 'phase2')
    ? ((totalForPhase - remainingSeconds) / totalForPhase) * 100
    : 0

  // SVG circular ring
  const radius = 140
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference
  const ringStroke = getRingStroke(phase, remainingSeconds)

  if (!fullscreenMode) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-50 bg-gradient-to-br ${getBgColor(phase, remainingSeconds)} flex flex-col items-center justify-center transition-colors duration-1000`}
      >
        {/* Top controls */}
        <div className="absolute top-4 right-4 flex items-center gap-2 opacity-20 hover:opacity-100 transition-opacity">
          <button onClick={toggleSound} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white/70">
            {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </button>
          <button onClick={toggleFullscreen} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white/70" title="Sair do modo tela cheia">
            <Minimize2 className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 sm:gap-5 px-6">
          {/* Phase indicator */}
          {phase !== 'idle' && (
            <div className="flex items-center gap-3">
              <div className={`h-3 w-3 rounded-full ${phase === 'phase1' ? 'bg-emerald-400' : phase === 'phase2' ? 'bg-amber-400' : 'bg-red-400'} ${isRunning && !isPaused ? 'animate-pulse' : ''}`} />
              <span className="text-white/70 text-lg sm:text-xl font-medium uppercase tracking-widest">
                {getPhaseLabel(phase)}
              </span>
              {isPaused && (
                <span className="text-amber-400 text-sm font-bold bg-amber-400/10 px-3 py-1 rounded-full">PAUSADO</span>
              )}
            </div>
          )}

          {/* Circular ring + time */}
          <div className="relative w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] md:w-[440px] md:h-[440px]">
            {(phase === 'phase1' || phase === 'phase2') && totalForPhase > 0 && (
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 320 320">
                <circle cx="160" cy="160" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                <circle
                  cx="160" cy="160" r={radius} fill="none"
                  stroke={ringStroke} strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className={`text-[6rem] sm:text-[8rem] md:text-[10rem] font-bold tabular-nums tracking-tighter leading-none ${getTimerColor(phase, remainingSeconds)} transition-colors duration-1000`}>
                {phase === 'idle' ? '--:--' : formatTime(remainingSeconds)}
              </div>
            </div>
          </div>

          {/* Phase 2 info during Phase 1 */}
          {phase === 'phase1' && (
            <div className="text-center mt-1">
              <div className="text-white/30 text-sm">
                + {formatTime(phase2Seconds)} na 2ª fase · restam {formatTime(remainingSeconds + phase2Seconds)} no total
              </div>
            </div>
          )}

          {/* Current speaker */}
          {currentSpeaker && (
            <div className="mt-1 text-center">
              <div className="text-white/40 text-sm uppercase tracking-wider mb-0.5">Falante</div>
              <div className="text-white text-2xl sm:text-3xl font-semibold">{currentSpeaker.name}</div>
            </div>
          )}

          {/* Phase transition alert */}
          {showPhaseTransition && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-amber-500/20 border border-amber-400/30 rounded-2xl px-8 py-5 text-center">
              <div className="text-amber-400 text-3xl sm:text-4xl font-bold mb-1">
                {phase2Seconds >= 60 
                  ? `${Math.floor(phase2Seconds / 60)} ${Math.floor(phase2Seconds / 60) === 1 ? 'minuto' : 'minutos'}`
                  : `${phase2Seconds} segundos`
                }
              </div>
              <div className="text-amber-300/80 text-sm">Restantes para a 2ª fase</div>
              <button onClick={dismissPhaseTransition} className="mt-2 px-4 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-sm transition-colors">
                Continuar
              </button>
            </motion.div>
          )}

          {/* Time up alert */}
          {phase === 'timeUp' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="text-6xl mb-3">⏰</motion.div>
              <div className="text-red-400 text-3xl sm:text-4xl font-bold">{customEndMessage}</div>
            </motion.div>
          )}

          {/* Bottom controls */}
          <div className="flex items-center gap-3 mt-3 opacity-20 hover:opacity-100 transition-opacity">
            {phase === 'idle' ? (
              <button onClick={startTimer} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors">
                <Play className="h-4 w-4" /> Iniciar
              </button>
            ) : (
              <>
                {isRunning && !isPaused ? (
                  <button onClick={pauseTimer} className="px-6 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 rounded-lg font-medium flex items-center gap-2 transition-colors">
                    <Pause className="h-4 w-4" /> Pausar
                  </button>
                ) : isPaused ? (
                  <button onClick={resumeTimer} className="px-6 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-lg font-medium flex items-center gap-2 transition-colors">
                    <Play className="h-4 w-4" /> Retomar
                  </button>
                ) : null}
                <button onClick={resetTimer} className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white/70 rounded-lg font-medium flex items-center gap-2 transition-colors">
                  <RotateCcw className="h-4 w-4" /> Reiniciar
                </button>
                {currentSpeakerIndex >= 0 && currentSpeakerIndex < speakers.length - 1 && (
                  <button onClick={() => { nextSpeaker(); resetTimer(); setTimeout(() => startTimer(), 50) }} className="px-6 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-lg font-medium flex items-center gap-2 transition-colors">
                    <SkipForward className="h-4 w-4" /> Próximo
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Speaker queue strip */}
        {speakers.length > 0 && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center justify-center gap-2 overflow-x-auto px-4 opacity-20 hover:opacity-100 transition-opacity">
              {speakers.map((speaker, index) => (
                <div key={speaker.id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap ${
                  index === currentSpeakerIndex ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  index < currentSpeakerIndex ? 'bg-white/5 text-white/30 line-through' : 'bg-white/10 text-white/50'
                }`}>
                  <span className="font-bold">{index + 1}</span>
                  <span>{speaker.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

export function FullscreenToggleButton() {
  const fullscreenMode = useTimerStore((s) => s.fullscreenMode)
  const toggleFullscreen = useTimerStore((s) => s.toggleFullscreen)

  if (fullscreenMode) return null

  return (
    <button
      onClick={toggleFullscreen}
      className="flex items-center gap-1.5 text-xs bg-muted/50 px-2 py-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      title="Modo tela cheia (Zoom)"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>
      </svg>
      <span className="hidden sm:inline">Tela cheia</span>
    </button>
  )
}
