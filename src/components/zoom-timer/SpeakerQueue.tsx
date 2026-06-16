'use client'

import { useTimerStore } from '@/store/timer-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Users, Plus, X, ChevronUp, ChevronDown, SkipForward, Trash2, Check, HelpCircle } from 'lucide-react'
import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface SpeakerQueueProps {
  isInZoom?: boolean
  isHostOrCoHost?: boolean
}

export function SpeakerQueue({ isInZoom = false, isHostOrCoHost = false }: SpeakerQueueProps) {
  const speakers = useTimerStore((s) => s.speakers)
  const currentSpeakerIndex = useTimerStore((s) => s.currentSpeakerIndex)
  const addSpeaker = useTimerStore((s) => s.addSpeaker)
  const removeSpeaker = useTimerStore((s) => s.removeSpeaker)
  const moveSpeaker = useTimerStore((s) => s.moveSpeaker)
  const nextSpeaker = useTimerStore((s) => s.nextSpeaker)
  const setCurrentSpeaker = useTimerStore((s) => s.setCurrentSpeaker)
  const clearSpeakers = useTimerStore((s) => s.clearSpeakers)
  const resetTimer = useTimerStore((s) => s.resetTimer)
  const startTimer = useTimerStore((s) => s.startTimer)
  const phase = useTimerStore((s) => s.phase)

  const [newName, setNewName] = useState('')

  const handleAdd = useCallback(() => {
    const trimmed = newName.trim()
    if (trimmed) {
      addSpeaker(trimmed)
      setNewName('')
    }
  }, [newName, addSpeaker])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd()
    }
  }, [handleAdd])

  const handleStartForSpeaker = useCallback((index: number) => {
    setCurrentSpeaker(index)
    if (phase !== 'phase1' && phase !== 'phase2') {
      resetTimer()
      setTimeout(() => {
        startTimer()
      }, 50)
    }
  }, [phase, setCurrentSpeaker, resetTimer, startTimer])

  const handleNext = useCallback(() => {
    nextSpeaker()
    if (phase !== 'idle') {
      resetTimer()
      setTimeout(() => {
        startTimer()
      }, 50)
    }
  }, [phase, nextSpeaker, resetTimer, startTimer])

  return (
    <Card className="w-full border-border/60 bg-card/40 backdrop-blur-md shadow-lg rounded-2xl overflow-hidden transition-all duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-bold tracking-tight text-foreground">
            <Users className="h-4 w-4 text-emerald-500" />
            Ordem de Partilhas
            {speakers.length > 0 && (
              <Badge variant="secondary" className="text-[10px] font-bold px-1.5 py-0 h-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-transparent">
                {speakers.length}
              </Badge>
            )}
          </CardTitle>
          {speakers.length > 0 && (
            <Button
              onClick={clearSpeakers}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive h-7 px-2 rounded-lg text-xs"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Limpar
            </Button>
          )}
        </div>

        {/* Zoom Sync Status Banner */}
        {isInZoom && (
          <div className="mt-2 text-[10px] rounded-lg p-2 border transition-all duration-200">
            {isHostOrCoHost ? (
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 border-emerald-500/10">
                <Check className="h-3.5 w-3.5 shrink-0" />
                <span className="font-semibold">Mãos levantadas no Zoom serão adicionadas automaticamente!</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 bg-amber-500/5 border-amber-500/10">
                <HelpCircle className="h-3.5 w-3.5 shrink-0" />
                <span>Mãos levantadas requerem Host/Co-host executando o app.</span>
              </div>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-3 pt-1">
        {/* Add speaker input */}
        <div className="flex gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nome do participante..."
            className="text-xs h-9 rounded-xl focus-visible:ring-emerald-500"
          />
          <Button
            onClick={handleAdd}
            disabled={!newName.trim()}
            size="sm"
            className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white h-9 w-9 p-0 rounded-xl shadow-sm"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Speaker list */}
        {speakers.length > 0 ? (
          <div className="space-y-1">
            <ScrollArea className="max-h-56">
              <div className="space-y-1 pr-1.5 py-0.5">
                <AnimatePresence mode="popLayout">
                  {speakers.map((speaker, index) => {
                    const isCurrent = index === currentSpeakerIndex
                    const isPassed = index < currentSpeakerIndex
                    
                    return (
                      <motion.div
                        key={speaker.id}
                        layout
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.18 }}
                        className={`flex items-center gap-2 px-2.5 py-2 rounded-xl transition-all border group relative ${
                          isCurrent
                            ? 'bg-emerald-500/5 border-emerald-500/30 shadow-sm'
                            : isPassed
                            ? 'bg-muted/10 border-transparent opacity-60'
                            : 'bg-muted/20 border-transparent hover:border-border/60 hover:bg-muted/40'
                        }`}
                        onClick={() => setCurrentSpeaker(index)}
                      >
                        {/* Left Active border accent indicator */}
                        {isCurrent && (
                          <div className="absolute left-0 top-1 bottom-1 w-1 bg-emerald-500 rounded-r-md" />
                        )}

                        {/* Position number */}
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 transition-colors ${
                          isCurrent
                            ? 'bg-emerald-600 text-white'
                            : isPassed
                            ? 'bg-muted text-muted-foreground'
                            : 'bg-border text-foreground/75'
                        }`}>
                          {index + 1}
                        </span>

                        {/* Name */}
                        <span className={`flex-1 text-xs truncate ${
                          isCurrent ? 'font-bold text-emerald-700 dark:text-emerald-300' : 'text-foreground/90'
                        }`}>
                          {speaker.name}
                        </span>

                        {/* Current speaker badge */}
                        {isCurrent && (
                          <Badge className="bg-emerald-500 text-[9px] font-bold px-1.5 py-0 h-4 border-transparent shadow-none">
                            Partilhando
                          </Badge>
                        )}

                        {/* Already spoke */}
                        {isPassed && (
                          <Badge variant="secondary" className="text-[9px] font-semibold px-1.5 py-0 h-4 bg-muted/40 border-transparent">
                            Concluído
                          </Badge>
                        )}

                        {/* Reorder + remove */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0">
                          <button
                            onClick={(e) => { e.stopPropagation(); if (index > 0) moveSpeaker(index, index - 1) }}
                            className="hover:text-emerald-600 p-0.5 text-muted-foreground transition-colors"
                            disabled={index === 0}
                          >
                            <ChevronUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); if (index < speakers.length - 1) moveSpeaker(index, index + 1) }}
                            className="hover:text-emerald-600 p-0.5 text-muted-foreground transition-colors"
                            disabled={index === speakers.length - 1}
                          >
                            <ChevronDown className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); removeSpeaker(speaker.id) }}
                            className="text-muted-foreground hover:text-destructive p-0.5 transition-colors"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            </ScrollArea>

            {/* Next speaker button */}
            {currentSpeakerIndex < speakers.length - 1 && currentSpeakerIndex >= 0 && (
              <Button
                onClick={handleNext}
                variant="outline"
                size="sm"
                className="w-full mt-2 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/5 h-8 text-xs font-semibold rounded-xl"
              >
                <SkipForward className="h-3 w-3 mr-1.5" />
                Próxima: {speakers[currentSpeakerIndex + 1]?.name}
              </Button>
            )}

            {/* Start for first speaker */}
            {currentSpeakerIndex === -1 && speakers.length > 0 && (
              <Button
                onClick={() => handleStartForSpeaker(0)}
                size="sm"
                className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs font-semibold rounded-xl shadow-sm"
              >
                <SkipForward className="h-3 w-3 mr-1.5" />
                Iniciar com: {speakers[0].name}
              </Button>
            )}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground/60 border border-dashed border-border/60 rounded-xl">
            <Users className="h-6 w-6 mx-auto mb-1 opacity-30 text-muted-foreground" />
            <p className="text-xs font-medium">Adicione participantes</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
