'use client'

import { useTimerStore } from '@/store/timer-store'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Play, RotateCcw, Pause, Volume2, VolumeX, Zap, Sun, Moon } from 'lucide-react'

const PRESETS = [
  { label: '3+2', p1: 180, p2: 120 },
  { label: '4+1', p1: 240, p2: 60 },
  { label: '5+5', p1: 300, p2: 300 },
  { label: '7+3', p1: 420, p2: 180 },
  { label: '10+5', p1: 600, p2: 300 },
  { label: '2+1', p1: 120, p2: 60 },
]

function formatTotal(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s > 0 ? `${m}:${s.toString().padStart(2, '0')}` : `${m}`
}

export function TimerSetup() {
  const phase1Seconds = useTimerStore((s) => s.phase1Seconds)
  const phase2Seconds = useTimerStore((s) => s.phase2Seconds)
  const customEndMessage = useTimerStore((s) => s.customEndMessage)
  const phase = useTimerStore((s) => s.phase)
  const isRunning = useTimerStore((s) => s.isRunning)
  const isPaused = useTimerStore((s) => s.isPaused)
  const soundEnabled = useTimerStore((s) => s.soundEnabled)

  const setPhase1Seconds = useTimerStore((s) => s.setPhase1Seconds)
  const setPhase2Seconds = useTimerStore((s) => s.setPhase2Seconds)
  const setCustomEndMessage = useTimerStore((s) => s.setCustomEndMessage)
  const startTimer = useTimerStore((s) => s.startTimer)
  const pauseTimer = useTimerStore((s) => s.pauseTimer)
  const resumeTimer = useTimerStore((s) => s.resumeTimer)
  const resetTimer = useTimerStore((s) => s.resetTimer)
  const toggleSound = useTimerStore((s) => s.toggleSound)
  const toggleDarkMode = useTimerStore((s) => s.toggleDarkMode)
  const darkMode = useTimerStore((s) => s.darkMode)

  const isIdle = phase === 'idle'
  const totalSeconds = phase1Seconds + phase2Seconds

  const applyPreset = (p1: number, p2: number) => {
    if (!isIdle) return
    setPhase1Seconds(p1)
    setPhase2Seconds(p2)
  }

  // Parse minutes from seconds
  const p1Min = Math.floor(phase1Seconds / 60)
  const p2Min = Math.floor(phase2Seconds / 60)

  return (
    <div className="w-full space-y-3">
      {/* Single-line config on desktop, stacked on mobile */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2 sm:gap-3">
        {/* Presets - compact on desktop */}
        {isIdle && (
          <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => applyPreset(preset.p1, preset.p2)}
                className={`px-2 py-1 rounded-md text-xs font-medium transition-all border ${
                  phase1Seconds === preset.p1 && phase2Seconds === preset.p2
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-700 dark:bg-emerald-950 dark:border-emerald-700 dark:text-emerald-300'
                    : 'bg-muted/50 border-border/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Time inputs + controls in one row on desktop */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2 lg:gap-3">
        {/* Phase 1 input */}
        <div className="flex items-center gap-1.5 flex-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <Input
            type="number"
            min={0}
            max={99}
            value={p1Min}
            onChange={(e) => setPhase1Seconds(Number(e.target.value) * 60)}
            disabled={!isIdle}
            className="text-center text-sm font-semibold w-16 h-9"
          />
          <span className="text-xs text-muted-foreground shrink-0">min 1ª</span>
        </div>

        <span className="hidden lg:block text-muted-foreground text-xs">+</span>

        {/* Phase 2 input */}
        <div className="flex items-center gap-1.5 flex-1">
          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
          <Input
            type="number"
            min={0}
            max={99}
            value={p2Min}
            onChange={(e) => setPhase2Seconds(Number(e.target.value) * 60)}
            disabled={!isIdle}
            className="text-center text-sm font-semibold w-16 h-9"
          />
          <span className="text-xs text-muted-foreground shrink-0">min 2ª</span>
        </div>

        {/* Total badge */}
        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className="text-[10px] px-2 py-0.5 border-border/50">
            {formatTotal(totalSeconds)} min total
          </Badge>
        </div>

        {/* Divider */}
        <div className="hidden lg:block w-px h-6 bg-border" />

        {/* Action buttons */}
        <div className="flex items-center gap-1.5">
          {isIdle ? (
            <Button
              onClick={startTimer}
              disabled={totalSeconds === 0}
              className="bg-emerald-600 hover:bg-emerald-700 text-white h-9 px-4"
              size="sm"
            >
              <Play className="h-3.5 w-3.5 mr-1.5" />
              Iniciar
            </Button>
          ) : (
            <>
              {isRunning && !isPaused ? (
                <Button
                  onClick={pauseTimer}
                  variant="outline"
                  size="sm"
                  className="border-amber-500 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 h-9"
                >
                  <Pause className="h-3.5 w-3.5 mr-1" />
                  Pausar
                </Button>
              ) : isPaused ? (
                <Button
                  onClick={resumeTimer}
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white h-9"
                >
                  <Play className="h-3.5 w-3.5 mr-1" />
                  Retomar
                </Button>
              ) : null}
              <Button
                onClick={resetTimer}
                variant="outline"
                size="sm"
                className="h-9"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                Reiniciar
              </Button>
            </>
          )}
        </div>

        {/* Divider */}
        <div className="hidden lg:block w-px h-6 bg-border" />

        {/* Utility buttons */}
        <div className="flex items-center gap-1">
          <Button
            onClick={toggleSound}
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0"
            title={soundEnabled ? 'Desativar som' : 'Ativar som'}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
          </Button>
          <Button
            onClick={toggleDarkMode}
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0"
            title={darkMode ? 'Modo claro' : 'Modo escuro'}
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Custom end message - full width but compact */}
      {isIdle && (
        <div className="flex items-center gap-2">
          <Input
            value={customEndMessage}
            onChange={(e) => setCustomEndMessage(e.target.value)}
            placeholder="Mensagem final (ex: Tempo esgotado!)"
            className="text-xs h-8"
          />
        </div>
      )}
    </div>
  )
}
