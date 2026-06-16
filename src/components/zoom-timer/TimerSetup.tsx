'use client'

import { useTimerStore } from '@/store/timer-store'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Play, RotateCcw, Pause, Volume2, VolumeX, Sun, Moon, Plus, Minus, Settings2 } from 'lucide-react'
import { useState } from 'react'

const PRESETS = [
  { label: '3+2 min', p1: 180, p2: 120 },
  { label: '4+1 min', p1: 240, p2: 60 },
  { label: '5+5 min', p1: 300, p2: 300 },
  { label: '7+3 min', p1: 420, p2: 180 },
  { label: '10+5 min', p1: 600, p2: 300 },
  { label: '2+1 min', p1: 120, p2: 60 },
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
  const darkMode = useTimerStore((s) => s.darkMode)

  const setPhase1Seconds = useTimerStore((s) => s.setPhase1Seconds)
  const setPhase2Seconds = useTimerStore((s) => s.setPhase2Seconds)
  const setCustomEndMessage = useTimerStore((s) => s.setCustomEndMessage)
  const startTimer = useTimerStore((s) => s.startTimer)
  const pauseTimer = useTimerStore((s) => s.pauseTimer)
  const resumeTimer = useTimerStore((s) => s.resumeTimer)
  const resetTimer = useTimerStore((s) => s.resetTimer)
  const toggleSound = useTimerStore((s) => s.toggleSound)
  const toggleDarkMode = useTimerStore((s) => s.toggleDarkMode)

  const [showAdvanced, setShowAdvanced] = useState(false)

  const isIdle = phase === 'idle'
  const totalSeconds = phase1Seconds + phase2Seconds

  const applyPreset = (p1: number, p2: number) => {
    if (!isIdle) return
    setPhase1Seconds(p1)
    setPhase2Seconds(p2)
  }

  const p1Min = Math.floor(phase1Seconds / 60)
  const p2Min = Math.floor(phase2Seconds / 60)

  const adjustP1 = (amount: number) => {
    if (!isIdle) return
    setPhase1Seconds(Math.max(0, phase1Seconds + amount * 60))
  }

  const adjustP2 = (amount: number) => {
    if (!isIdle) return
    setPhase2Seconds(Math.max(0, phase2Seconds + amount * 60))
  }

  return (
    <div className="w-full bg-card/40 backdrop-blur-md border border-border/60 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
      {/* Top Presets Row */}
      {isIdle && (
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Presets Rápidos</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {PRESETS.map((preset) => {
              const active = phase1Seconds === preset.p1 && phase2Seconds === preset.p2
              return (
                <button
                  key={preset.label}
                  onClick={() => applyPreset(preset.p1, preset.p2)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all border ${
                    active
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                      : 'bg-muted/30 border-transparent text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                  }`}
                >
                  {preset.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Main Configurations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Phase 1 Input Card */}
        <div className={`flex flex-col gap-1.5 p-3 rounded-xl border transition-all ${
          isIdle 
            ? 'border-emerald-500/10 bg-emerald-500/[0.01]' 
            : 'border-border/40 bg-muted/10 opacity-70'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              1ª Fase (Principal)
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">{p1Min}m</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0 rounded-lg"
              onClick={() => adjustP1(-1)}
              disabled={!isIdle || p1Min <= 0}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <Input
              type="number"
              min={0}
              max={99}
              value={p1Min}
              onChange={(e) => setPhase1Seconds(Math.max(0, Number(e.target.value)) * 60)}
              disabled={!isIdle}
              className="text-center font-bold text-lg h-8 px-1 focus-visible:ring-emerald-500"
            />
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0 rounded-lg"
              onClick={() => adjustP1(1)}
              disabled={!isIdle || p1Min >= 99}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Phase 2 Input Card */}
        <div className={`flex flex-col gap-1.5 p-3 rounded-xl border transition-all ${
          isIdle 
            ? 'border-amber-500/10 bg-amber-500/[0.01]' 
            : 'border-border/40 bg-muted/10 opacity-70'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              2ª Fase (Acordo/Tolerância)
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">{p2Min}m</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0 rounded-lg"
              onClick={() => adjustP2(-1)}
              disabled={!isIdle || p2Min <= 0}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <Input
              type="number"
              min={0}
              max={99}
              value={p2Min}
              onChange={(e) => setPhase2Seconds(Math.max(0, Number(e.target.value)) * 60)}
              disabled={!isIdle}
              className="text-center font-bold text-lg h-8 px-1 focus-visible:ring-amber-500"
            />
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0 rounded-lg"
              onClick={() => adjustP2(1)}
              disabled={!isIdle || p2Min >= 99}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Action panel & details */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1 border-t border-border/40">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-bold px-2.5 py-1 border-border bg-muted/20">
            {formatTotal(totalSeconds)} min total
          </Badge>
          {isIdle && (
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 text-xs font-medium ${showAdvanced ? 'text-foreground bg-muted/50' : 'text-muted-foreground'}`}
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <Settings2 className="h-3.5 w-3.5 mr-1" />
              Opções
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 justify-end">
          {/* Main Action Trigger */}
          {isIdle ? (
            <Button
              onClick={startTimer}
              disabled={totalSeconds === 0}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md shadow-emerald-500/10 h-9 px-5 rounded-xl transition-all duration-200"
            >
              <Play className="h-4 w-4 mr-1.5 fill-current" />
              Iniciar
            </Button>
          ) : (
            <div className="flex items-center gap-1.5">
              {isRunning && !isPaused ? (
                <Button
                  onClick={pauseTimer}
                  variant="outline"
                  className="border-amber-500/40 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20 h-9 px-4 rounded-xl transition-all duration-200"
                >
                  <Pause className="h-4 w-4 mr-1.5 fill-current" />
                  Pausar
                </Button>
              ) : isPaused ? (
                <Button
                  onClick={resumeTimer}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-9 px-4 rounded-xl transition-all duration-200"
                >
                  <Play className="h-4 w-4 mr-1.5 fill-current" />
                  Retomar
                </Button>
              ) : null}
              <Button
                onClick={resetTimer}
                variant="outline"
                className="h-9 px-4 rounded-xl transition-all duration-200 border-border hover:bg-muted"
              >
                <RotateCcw className="h-4 w-4 mr-1.5" />
                Reiniciar
              </Button>
            </div>
          )}

          {/* Quick Sound/Theme options */}
          <div className="flex items-center gap-1 border-l border-border/40 pl-2 ml-1">
            <Button
              onClick={toggleSound}
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl hover:bg-muted"
              title={soundEnabled ? 'Desativar som' : 'Ativar som'}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4 text-emerald-600" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
            </Button>
            <Button
              onClick={toggleDarkMode}
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl hover:bg-muted"
              title={darkMode ? 'Modo claro' : 'Modo escuro'}
            >
              {darkMode ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Advanced collapsible section */}
      {isIdle && showAdvanced && (
        <div className="p-3 bg-muted/20 border border-border/50 rounded-xl space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider animate-pulse">
            Mensagem Final do Cronômetro
          </label>
          <Input
            value={customEndMessage}
            onChange={(e) => setCustomEndMessage(e.target.value)}
            placeholder="Mensagem final (ex: Tempo esgotado!)"
            className="text-xs h-8 focus-visible:ring-border"
          />
        </div>
      )}
    </div>
  )
}
