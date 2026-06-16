'use client'

import { useTimerStore } from '@/store/timer-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Users, Plus, X, ChevronUp, ChevronDown, SkipForward, Trash2 } from 'lucide-react'
import { useState, useCallback } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'

export function SpeakerQueue() {
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
  const [isDragOver, setIsDragOver] = useState(false)

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
      // Small delay to allow state to reset before starting
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
    <Card className="w-full border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" />
            Fila de Falantes
          </CardTitle>
          {speakers.length > 0 && (
            <Button
              onClick={clearSpeakers}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive h-7"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Limpar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Add speaker input */}
        <div className="flex gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nome do participante..."
            className="text-sm"
          />
          <Button
            onClick={handleAdd}
            disabled={!newName.trim()}
            size="sm"
            className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Speaker list */}
        {speakers.length > 0 ? (
          <div className="space-y-1">
            <ScrollArea className="max-h-64">
              <div className="space-y-1 pr-1">
                <AnimatePresence mode="popLayout">
                  {speakers.map((speaker, index) => (
                    <motion.div
                      key={speaker.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                      className={`flex items-center gap-2 p-2 rounded-lg transition-colors cursor-pointer group ${
                        index === currentSpeakerIndex
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setCurrentSpeaker(index)}
                    >
                      {/* Position number */}
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        index === currentSpeakerIndex
                          ? 'bg-emerald-500 text-white'
                          : index < currentSpeakerIndex
                          ? 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {index + 1}
                      </span>

                      {/* Name */}
                      <span className={`flex-1 text-sm truncate ${
                        index === currentSpeakerIndex ? 'font-semibold text-emerald-700 dark:text-emerald-300' : ''
                      }`}>
                        {speaker.name}
                      </span>

                      {/* Current speaker badge */}
                      {index === currentSpeakerIndex && (
                        <Badge variant="default" className="bg-emerald-500 text-[10px] px-1.5 py-0 h-5">
                          Falando
                        </Badge>
                      )}

                      {/* Already spoke */}
                      {index < currentSpeakerIndex && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                          Concluído
                        </Badge>
                      )}

                      {/* Reorder buttons */}
                      <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); if (index > 0) moveSpeaker(index, index - 1) }}
                          className="hover:text-emerald-600 p-0.5 leading-none"
                          disabled={index === 0}
                        >
                          <ChevronUp className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); if (index < speakers.length - 1) moveSpeaker(index, index + 1) }}
                          className="hover:text-emerald-600 p-0.5 leading-none"
                          disabled={index === speakers.length - 1}
                        >
                          <ChevronDown className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Remove button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); removeSpeaker(speaker.id) }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0 p-0.5"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>

            {/* Next speaker button */}
            {currentSpeakerIndex < speakers.length - 1 && currentSpeakerIndex >= 0 && (
              <Button
                onClick={handleNext}
                variant="outline"
                size="sm"
                className="w-full mt-2 border-emerald-300 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
              >
                <SkipForward className="h-3.5 w-3.5 mr-1.5" />
                Próximo: {speakers[currentSpeakerIndex + 1]?.name}
              </Button>
            )}

            {/* Start for first speaker */}
            {currentSpeakerIndex === -1 && speakers.length > 0 && (
              <Button
                onClick={() => handleStartForSpeaker(0)}
                size="sm"
                className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <SkipForward className="h-3.5 w-3.5 mr-1.5" />
                Iniciar com: {speakers[0].name}
              </Button>
            )}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">Adicione participantes à fila</p>
            <p className="text-xs opacity-60">Mãos levantadas ou ordem de entrada</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
