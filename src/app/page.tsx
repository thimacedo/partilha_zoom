'use client'

import { useTimer } from '@/components/zoom-timer/use-timer'
import { useKeyboardShortcuts } from '@/components/zoom-timer/use-keyboard-shortcuts'
import { TimerSetup } from '@/components/zoom-timer/TimerSetup'
import { TimerDisplay } from '@/components/zoom-timer/TimerDisplay'
import { PhaseTransitionAlert, TimeUpAlert } from '@/components/zoom-timer/PhaseAlert'
import { SpeakerQueue } from '@/components/zoom-timer/SpeakerQueue'
import { OverlayTimer, OverlayToggleButton } from '@/components/zoom-timer/OverlayTimer'
import { FullscreenTimer, FullscreenToggleButton } from '@/components/zoom-timer/FullscreenTimer'
import { useTimerStore } from '@/store/timer-store'
import { Timer, MonitorSmartphone, Keyboard } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export default function Home() {
  // Initialize the timer hook (handles ticking and sound)
  useTimer()
  useKeyboardShortcuts()

  const overlayMode = useTimerStore((s) => s.overlayMode)
  const phase = useTimerStore((s) => s.phase)

  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col bg-background">
        {/* Header */}
        <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="bg-emerald-600 text-white p-1.5 rounded-lg shadow-sm">
                <Timer className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold leading-tight">Zoom Timer</h1>
                <p className="text-xs text-muted-foreground leading-tight">Cronômetro para reuniões</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                    <MonitorSmartphone className="h-3.5 w-3.5" />
                    <span>PC · Android · iOS</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Compatível com PC, Android e iOS</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                    <Keyboard className="h-3 w-3" />
                    <span>Atalhos</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <div className="space-y-1 text-xs">
                    <p><kbd className="font-mono bg-muted px-1 rounded">Enter</kbd> Iniciar</p>
                    <p><kbd className="font-mono bg-muted px-1 rounded">Espaço</kbd> Pausar/Retomar</p>
                    <p><kbd className="font-mono bg-muted px-1 rounded">Esc</kbd> Reiniciar/Sair</p>
                    <p><kbd className="font-mono bg-muted px-1 rounded">F</kbd> Tela cheia</p>
                    <p><kbd className="font-mono bg-muted px-1 rounded">O</kbd> Modo Zoom</p>
                    <p><kbd className="font-mono bg-muted px-1 rounded">M</kbd> Som on/off</p>
                    <p><kbd className="font-mono bg-muted px-1 rounded">N</kbd> Próximo falante</p>
                  </div>
                </TooltipContent>
              </Tooltip>
              <FullscreenToggleButton />
              <OverlayToggleButton />
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-4 sm:py-6">
          {/* Overlay mode - compact view */}
          {overlayMode ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-full">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">Timer ativo no modo sobreposição</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  O timer aparece no canto superior direito da tela
                </p>
                <p className="text-xs text-muted-foreground/60">
                  Ideal para compartilhar a tela no Zoom
                </p>
              </div>
              <div className="w-full max-w-sm">
                <TimerSetup />
              </div>
            </div>
          ) : (
            /* Full mode */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Left column - Timer setup & controls */}
              <div className="lg:col-span-1 space-y-4 sm:space-y-6 order-2 lg:order-1">
                <TimerSetup />
                <SpeakerQueue />
              </div>

              {/* Right column - Timer display & alerts */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-6 order-1 lg:order-2">
                <TimerDisplay />
                
                {/* Phase alerts */}
                <PhaseTransitionAlert />
                <TimeUpAlert />
                
                {/* Quick tips when idle */}
                {phase === 'idle' && (
                  <div className="bg-muted/30 rounded-xl p-4 sm:p-5 space-y-3 border border-border/30">
                    <h3 className="text-sm font-semibold flex items-center gap-1.5">
                      💡 Como usar
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted-foreground">
                      <div className="space-y-1.5 p-3 bg-background/50 rounded-lg">
                        <p className="font-medium text-foreground flex items-center gap-1.5">
                          <span className="w-5 h-5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded flex items-center justify-center text-[10px]">⏱</span>
                          Timer de 2 fases
                        </p>
                        <p>Configure os tempos da 1ª e 2ª fase. Ao fim da 1ª, um aviso mostra o tempo restante.</p>
                      </div>
                      <div className="space-y-1.5 p-3 bg-background/50 rounded-lg">
                        <p className="font-medium text-foreground flex items-center gap-1.5">
                          <span className="w-5 h-5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded flex items-center justify-center text-[10px]">👥</span>
                          Fila de falantes
                        </p>
                        <p>Adicione participantes na ordem das mãos levantadas ou entrada. Avance automaticamente.</p>
                      </div>
                      <div className="space-y-1.5 p-3 bg-background/50 rounded-lg">
                        <p className="font-medium text-foreground flex items-center gap-1.5">
                          <span className="w-5 h-5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded flex items-center justify-center text-[10px]">📺</span>
                          Modo Zoom
                        </p>
                        <p>Ative o modo sobreposição para exibir o timer compacto no canto da tela durante o Zoom.</p>
                      </div>
                      <div className="space-y-1.5 p-3 bg-background/50 rounded-lg">
                        <p className="font-medium text-foreground flex items-center gap-1.5">
                          <span className="w-5 h-5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded flex items-center justify-center text-[10px]">🔔</span>
                          Alerta sonoro
                        </p>
                        <p>Um sinal suave toca ao mudar de fase e ao esgotar o tempo. Pode ser desativado.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-border/50 bg-card/30 mt-auto">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>Zoom Timer · Compatível com Zoom, Google Meet, Teams</span>
            <span className="hidden sm:inline">Responsivo · PC · Android · iOS</span>
          </div>
        </footer>

        {/* Overlay timer (renders as fixed position) */}
        <OverlayTimer />

        {/* Fullscreen timer (renders as fixed position) */}
        <FullscreenTimer />
      </div>
    </TooltipProvider>
  )
}
