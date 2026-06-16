'use client'

import { useTimerStore } from '@/store/timer-store'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, ArrowRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PhaseTransitionAlert() {
  const showPhaseTransition = useTimerStore((s) => s.showPhaseTransition)
  const phase2Minutes = useTimerStore((s) => s.phase2Minutes)
  const dismissPhaseTransition = useTimerStore((s) => s.dismissPhaseTransition)

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
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-2 border-amber-300 dark:border-amber-700 rounded-2xl p-6 sm:p-8 shadow-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1 text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Clock className="h-6 w-6 text-amber-600" />
                  <span className="text-sm font-semibold uppercase tracking-wider text-amber-600">
                    Fim da 1ª Fase
                  </span>
                </div>
                
                <div className="text-4xl sm:text-5xl font-bold text-amber-700 dark:text-amber-400 mb-3">
                  {phase2Minutes} {phase2Minutes === 1 ? 'minuto' : 'minutos'}
                </div>
                
                <div className="flex items-center justify-center gap-2 text-amber-600">
                  <span>1ª Fase</span>
                  <ArrowRight className="h-4 w-4" />
                  <span className="font-bold">2ª Fase</span>
                </div>
                
                <p className="text-sm text-amber-600/80 mt-3">
                  Restam {phase2Minutes} {phase2Minutes === 1 ? 'minuto' : 'minutos'} para a conclusão
                </p>
              </div>
              
              <Button
                onClick={dismissPhaseTransition}
                variant="ghost"
                size="sm"
                className="text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/30 -mt-2 -mr-2"
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
          <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border-2 border-red-300 dark:border-red-700 rounded-2xl p-6 sm:p-8 shadow-lg">
            <div className="text-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="text-5xl sm:text-6xl mb-4"
              >
                ⏰
              </motion.div>
              
              <div className="text-3xl sm:text-4xl font-bold text-red-600 dark:text-red-400 mb-3">
                {customEndMessage || 'Tempo esgotado!'}
              </div>
              
              <p className="text-sm text-red-500/80 mb-4">
                O tempo total da fala foi encerrado
              </p>
              
              <Button
                onClick={resetTimer}
                variant="outline"
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
