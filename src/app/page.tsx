'use client'

import { useTimer } from '@/components/zoom-timer/use-timer'
import { useKeyboardShortcuts } from '@/components/zoom-timer/use-keyboard-shortcuts'
import { TimerSetup } from '@/components/zoom-timer/TimerSetup'
import { TimerDisplay } from '@/components/zoom-timer/TimerDisplay'
import { PhaseTransitionAlert, TimeUpAlert } from '@/components/zoom-timer/PhaseAlert'
import { SpeakerQueue } from '@/components/zoom-timer/SpeakerQueue'
import { OverlayTimer, OverlayToggleButton } from '@/components/zoom-timer/OverlayTimer'
import { FullscreenTimer, FullscreenToggleButton } from '@/components/zoom-timer/FullscreenTimer'
import { DarkModeSync } from '@/components/zoom-timer/DarkModeSync'
import { SessionHistory } from '@/components/zoom-timer/SessionHistory'
import { useTimerStore } from '@/store/timer-store'
import { Timer, MonitorSmartphone, Keyboard } from 'lucide-react'
import { useEffect } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useZoomSdk } from '@/hooks/use-zoom-sdk'
import { Share2, Users } from 'lucide-react'

export default function Home() {
  useTimer()
  useKeyboardShortcuts()
  const { isInZoom, shareApp, sendInvitation } = useZoomSdk()

  // Sync dark mode class on <html>
  const darkMode = useTimerStore((s) => s.darkMode)
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const overlayMode = useTimerStore((s) => s.overlayMode)
  const isRunning = useTimerStore((s) => s.isRunning)
  const phase = useTimerStore((s) => s.phase)

  // The overlay auto-shows when running; overlayMode is the manual toggle
  const overlayActive = overlayMode || isRunning || phase === 'timeUp'

  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col bg-background">
        {/* Header */}
        <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
          <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-600 text-white p-1.5 rounded-lg shadow-sm">
                <Timer className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-base font-bold leading-tight">SPH Timer</h1>
                <p className="text-[10px] text-muted-foreground leading-tight hidden sm:block">Cronômetro para reuniões</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="hidden md:flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                    <Keyboard className="h-3 w-3" />
                    Atalhos
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <div className="space-y-0.5 text-xs">
                    <p><kbd className="font-mono bg-muted px-1 rounded">Enter</kbd> Iniciar</p>
                    <p><kbd className="font-mono bg-muted px-1 rounded">Espaço</kbd> Pausar/Retomar</p>
                    <p><kbd className="font-mono bg-muted px-1 rounded">Esc</kbd> Reiniciar/Sair</p>
                    <p><kbd className="font-mono bg-muted px-1 rounded">F</kbd> Tela cheia</p>
                    <p><kbd className="font-mono bg-muted px-1 rounded">O</kbd> Overlay SPH</p>
                    <p><kbd className="font-mono bg-muted px-1 rounded">M</kbd> Som</p>
                    <p><kbd className="font-mono bg-muted px-1 rounded">D</kbd> Tema</p>
                    <p><kbd className="font-mono bg-muted px-1 rounded">N</kbd> Próximo falante</p>
                  </div>
                </TooltipContent>
              </Tooltip>
              <div className="hidden sm:flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                <MonitorSmartphone className="h-3 w-3" />
                PC · Android · iOS
              </div>
              {isInZoom && (
                <>
                  <button
                    onClick={shareApp}
                    className="flex items-center gap-1 text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded hover:bg-blue-700 transition-colors shadow-sm font-medium cursor-pointer"
                    title="Compartilhar tela do cronômetro na reunião"
                  >
                    <Share2 className="h-3 w-3" />
                    <span>Compartilhar</span>
                  </button>
                  <button
                    onClick={sendInvitation}
                    className="flex items-center gap-1 text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded hover:text-foreground hover:bg-muted/80 transition-colors font-medium cursor-pointer"
                    title="Convidar participantes a abrir o app"
                  >
                    <Users className="h-3 w-3" />
                    <span>Convidar</span>
                  </button>
                </>
              )}
              <FullscreenToggleButton />
              <OverlayToggleButton />
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-4 sm:py-5">
          {/* Timer setup - always visible, compact single row on desktop */}
          <div className="mb-4 sm:mb-5">
            <TimerSetup />
          </div>

          {/* Main grid: Timer display + Speaker queue */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
            {/* Timer display + alerts */}
            <div className="lg:col-span-2 space-y-3">
              <TimerDisplay />
              <PhaseTransitionAlert />
              <TimeUpAlert />
            </div>

            {/* Speaker queue + history */}
            <div className="lg:col-span-1 space-y-4">
              <SpeakerQueue />
              <SessionHistory />
            </div>
          </div>
        </main>

        {/* How to use section at the bottom */}
        <footer className="mt-auto">
          {phase === 'idle' && (
            <div className="border-t border-border/50 bg-muted/20">
              <div className="max-w-5xl mx-auto px-4 py-4">
                <h3 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                  💡 Como usar
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-muted-foreground">
                  <div className="p-2 bg-background/50 rounded-lg">
                    <p className="font-medium text-foreground mb-0.5">⏱ Timer de 2 fases</p>
                    <p>Configure os tempos. Ao fim da 1ª fase, um aviso mostra o tempo restante.</p>
                  </div>
                  <div className="p-2 bg-background/50 rounded-lg">
                    <p className="font-medium text-foreground mb-0.5">👥 Fila de falantes</p>
                    <p>Adicione participantes na ordem das mãos levantadas ou entrada.</p>
                  </div>
                  <div className="p-2 bg-background/50 rounded-lg">
                    <p className="font-medium text-foreground mb-0.5">📺 Modo SPH</p>
                    <p>O timer aparece automaticamente no canto da tela ao iniciar.</p>
                  </div>
                  <div className="p-2 bg-background/50 rounded-lg">
                    <p className="font-medium text-foreground mb-0.5">🔔 Alerta sonoro</p>
                    <p>Sinal suave ao mudar de fase e ao esgotar o tempo.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="border-t border-border/50 bg-card/30 px-4 py-2">
            <div className="max-w-5xl mx-auto flex items-center justify-between text-[10px] text-muted-foreground">
              <span>SPH Timer · Zoom · Google Meet · Teams</span>
              <span className="hidden sm:inline">Responsivo · PC · Android · iOS</span>
            </div>
          </div>
        </footer>

        {/* Overlay timer - auto shows when running */}
        <OverlayTimer />
        {/* Fullscreen timer */}
        <FullscreenTimer />
      </div>
    </TooltipProvider>
  )
}
