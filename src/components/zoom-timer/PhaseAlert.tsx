'use client'

import { useTimerStore } from '@/store/timer-store'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, ArrowRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

function formatTimeCompact(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export function PhaseTransitionAlert() {
  const showPhaseTransition = useTimerStore((s) => s.showPhaseTransition)
  const phase2Seconds = useTimerStore((s) => s.phase2Seconds)
  const dismissPhaseTransition = useTimerStore((s) => s.dismissPhaseTransition)

  const phase2Minutes = Math.floor(phase2Seconds / 60)

  return (
    <AnimatePresence>
      {showPhaseTransition && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="w-full"
        >
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-2 border-amber-300 dark:border-amber-700 rounded-2xl p-5 sm:p-6 shadow-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <span className="text-sm font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    Fim da 1ª Fase
                  </span>
                </div>
                
                <div className="text-3xl sm:text-4xl font-bold text-amber-700 dark:text-amber-400 mb-2">
                  {phase2Seconds >= 60 
                    ? `${phase2Minutes} ${phase2Minutes === 1 ? 'minuto' : 'minutos'}`
                    : `${phase2Seconds} segundos`
                  }
                </div>
                
                <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400 text-sm">
                  <span>1ª Fase</span>
                  <ArrowRight className="h-4 w-4" />
                  <span className="font-bold">2ª Fase</span>
                </div>
                
                <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-2">
                  Restam {formatTimeCompact(phase2Seconds)} para a conclusão
                </p>
              </div>
              
              <Button
                onClick={dismissPhaseTransition}
                variant="ghost"
                size="sm"
                className="text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/30 -mt-1 -mr-1 h-7 w-7 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function TimeUpAlert() {
  const phase = useTimerStore((s) => s.phase)
  const customEndMessage = useTimerStore((s) => s.customEndMessage)
  const resetTimer = useTimerStore((s) => s.resetTimer)

  return (
    <AnimatePresence>
      {phase === 'timeUp' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="w-full"
        >
          <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border-2 border-red-300 dark:border-red-700 rounded-2xl p-5 sm:p-6 shadow-lg">
            <div className="text-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="text-4xl sm:text-5xl mb-3"
              >
                ⏰
              </motion.div>
              
              <div className="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
                {customEndMessage || 'Tempo esgotado!'}
              </div>
              
              <p className="text-xs text-red-500/70 dark:text-red-400/70 mb-3">
                O tempo total da fala foi encerrado
              </p>
              
              <Button
                onClick={resetTimer}
                variant="outline"
                size="sm"
                className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                Novo Timer
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
