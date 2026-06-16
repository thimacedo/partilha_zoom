'use client'

import { useTimerStore } from '@/store/timer-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Settings, Play, RotateCcw, Pause, Volume2, VolumeX, Zap } from 'lucide-react'

const PRESETS = [
  { label: '3 + 2', p1: 3, p2: 2, total: 5 },
  { label: '4 + 1', p1: 4, p2: 1, total: 5 },
  { label: '5 + 5', p1: 5, p2: 5, total: 10 },
  { label: '7 + 3', p1: 7, p2: 3, total: 10 },
  { label: '10 + 5', p1: 10, p2: 5, total: 15 },
  { label: '2 + 1', p1: 2, p2: 1, total: 3 },
]

export function TimerSetup() {
  const phase1Minutes = useTimerStore((s) => s.phase1Minutes)
  const phase2Minutes = useTimerStore((s) => s.phase2Minutes)
  const customEndMessage = useTimerStore((s) => s.customEndMessage)
  const phase = useTimerStore((s) => s.phase)
  const isRunning = useTimerStore((s) => s.isRunning)
  const isPaused = useTimerStore((s) => s.isPaused)
  const soundEnabled = useTimerStore((s) => s.soundEnabled)

  const setPhase1Minutes = useTimerStore((s) => s.setPhase1Minutes)
  const setPhase2Minutes = useTimerStore((s) => s.setPhase2Minutes)
  const setCustomEndMessage = useTimerStore((s) => s.setCustomEndMessage)
  const startTimer = useTimerStore((s) => s.startTimer)
  const pauseTimer = useTimerStore((s) => s.pauseTimer)
  const resumeTimer = useTimerStore((s) => s.resumeTimer)
  const resetTimer = useTimerStore((s) => s.resetTimer)
  const toggleSound = useTimerStore((s) => s.toggleSound)

  const isIdle = phase === 'idle'
  const totalTime = phase1Minutes + phase2Minutes

  const applyPreset = (p1: number, p2: number) => {
    if (!isIdle) return
    setPhase1Minutes(p1)
    setPhase2Minutes(p2)
  }

  return (
    <Card className="w-full border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Settings className="h-4 w-4" />
          Configuração do Timer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick presets */}
        {isIdle && (
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Presets rápidos
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => applyPreset(preset.p1, preset.p2)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all border ${
                    phase1Minutes === preset.p1 && phase2Minutes === preset.p2
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-700 dark:bg-emerald-950 dark:border-emerald-700 dark:text-emerald-300'
                      : 'bg-muted/50 border-border/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {preset.label}
                  <span className="text-[10px] ml-1 opacity-60">{preset.total}m</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Phase configuration */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phase1" className="text-sm font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              1ª Fase (min)
            </Label>
            <div className="relative">
              <Input
                id="phase1"
                type="number"
                min={0}
                max={99}
                value={phase1Minutes}
                onChange={(e) => setPhase1Minutes(Number(e.target.value))}
                disabled={!isIdle}
                className="text-center text-lg font-semibold pr-12 h-11"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                min
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phase2" className="text-sm font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              2ª Fase (min)
            </Label>
            <div className="relative">
              <Input
                id="phase2"
                type="number"
                min={0}
                max={99}
                value={phase2Minutes}
                onChange={(e) => setPhase2Minutes(Number(e.target.value))}
                disabled={!isIdle}
                className="text-center text-lg font-semibold pr-12 h-11"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                min
              </span>
            </div>
          </div>
        </div>

        {/* Total time display */}
        <div className="bg-muted/50 rounded-lg px-3 py-2.5 text-center border border-border/30">
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-muted-foreground">Tempo total:</span>
            <span className="font-bold text-lg text-foreground">{totalTime} min</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 mt-1">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-emerald-300 text-emerald-600">
              {phase1Minutes} min
            </Badge>
            <span className="text-muted-foreground text-xs">+</span>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-amber-300 text-amber-600">
              {phase2Minutes} min
            </Badge>
          </div>
        </div>

        {/* Custom end message */}
        <div className="space-y-2">
          <Label htmlFor="endMessage" className="text-sm font-medium">
            Mensagem final
          </Label>
          <Input
            id="endMessage"
            value={customEndMessage}
            onChange={(e) => setCustomEndMessage(e.target.value)}
            disabled={!isIdle}
            placeholder="Tempo esgotado!"
            className="text-sm"
          />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 pt-1">
          {isIdle ? (
            <Button
              onClick={startTimer}
              disabled={totalTime === 0}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white h-11"
              size="lg"
            >
              <Play className="h-4 w-4 mr-2" />
              Iniciar
            </Button>
          ) : (
            <>
              {isRunning && !isPaused ? (
                <Button
                  onClick={pauseTimer}
                  variant="outline"
                  size="lg"
                  className="flex-1 border-amber-500 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 h-11"
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Pausar
                </Button>
              ) : isPaused ? (
                <Button
                  onClick={resumeTimer}
                  size="lg"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white h-11"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Retomar
                </Button>
              ) : null}
              <Button
                onClick={resetTimer}
                variant="outline"
                size="lg"
                className="flex-1 h-11"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reiniciar
              </Button>
            </>
          )}
          <Button
            onClick={toggleSound}
            variant="ghost"
            size="lg"
            className="shrink-0 h-11 w-11 p-0"
            title={soundEnabled ? 'Desativar som' : 'Ativar som'}
          >
            {soundEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>

        {/* Keyboard shortcut hint */}
        {isIdle && (
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground/60">
              Enter = Iniciar · Espaço = Pausar/Retomar · Esc = Reiniciar
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
