'use client'

import { useTimerStore, SessionEntry } from '@/store/timer-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { History, Trash2, CheckCircle2, XCircle } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s > 0 ? `${m}m${s}s` : `${m}m`
}

function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'agora'
  if (mins < 60) return `${mins}min atrás`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h atrás`
  const days = Math.floor(hours / 24)
  return `${days}d atrás`
}

export function SessionHistory() {
  const sessionHistory = useTimerStore((s) => s.sessionHistory)
  const clearHistory = useTimerStore((s) => s.clearHistory)

  if (sessionHistory.length === 0) return null

  return (
    <Card className="w-full border-border/60 bg-card/40 backdrop-blur-md shadow-lg rounded-2xl overflow-hidden transition-all duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <History className="h-4 w-4" />
            Histórico
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
              {sessionHistory.length}
            </Badge>
          </CardTitle>
          <Button
            onClick={clearHistory}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive h-6 text-xs"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Limpar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-40">
          <div className="space-y-1 pr-1">
            <AnimatePresence>
              {sessionHistory.slice(0, 20).map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted/30 text-xs"
                >
                  {entry.completed ? (
                    <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                  ) : (
                    <XCircle className="h-3 w-3 text-muted-foreground shrink-0" />
                  )}
                  
                  {entry.speakerName && (
                    <span className="font-medium truncate max-w-[80px]">
                      {entry.speakerName}
                    </span>
                  )}
                  
                  <span className="text-muted-foreground">
                    {formatDuration(entry.phase1Seconds)}+{formatDuration(entry.phase2Seconds)}
                  </span>
                  
                  <span className="text-muted-foreground/60 ml-auto">
                    {formatTimeAgo(entry.startedAt)}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
