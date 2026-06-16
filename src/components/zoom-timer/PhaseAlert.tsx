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
  const phase2RemainingSeconds = phase2Seconds % 60

  let timeText = ''
  if (phase2Seconds >= 60) {
    if (phase2RemainingSeconds === 0) {
      timeText = `${phase2Minutes} ${phase2Minutes === 1 ? 'Minuto' : 'Minutos'}`
    } else {
      timeText = `${phase2Minutes} ${phase2Minutes === 1 ? 'Minuto' : 'Minutos'} e ${phase2RemainingSeconds} ${phase2RemainingSeconds === 1 ? 'Segundo' : 'Segundos'}`
    }
  } else {
    timeText = `${phase2Seconds} ${phase2Seconds === 1 ? 'Segundo' : 'Segundos'}`
  }

  return (
    <AnimatePresence>
      {showPhaseTransition && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -15 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="w-full text-center"
        >
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-300/60 dark:border-amber-700/50 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col items-center justify-center">
            {/* Close button */}
            <Button
              onClick={dismissPhaseTransition}
              variant="ghost"
              size="sm"
              className="absolute top-2.5 right-2.5 text-amber-600/70 hover:text-amber-700 hover:bg-amber-100/50 dark:text-amber-400/70 dark:hover:text-amber-300 dark:hover:bg-amber-900/30 h-7 w-7 p-0 rounded-lg"
            >
              <X className="h-4 w-4" />
            </Button>
            
            <div className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-amber-600 dark:text-amber-400 tracking-tight drop-shadow-sm">
              {timeText}
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
