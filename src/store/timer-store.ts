import { create } from 'zustand'

export type TimerPhase = 'idle' | 'phase1' | 'phaseTransition' | 'phase2' | 'timeUp'

export interface Speaker {
  id: string
  name: string
  order: number
}

export interface SessionEntry {
  id: string
  speakerName: string
  phase1Seconds: number
  phase2Seconds: number
  startedAt: number
  endedAt: number | null
  completed: boolean
}

interface TimerState {
  // Timer configuration (seconds precision)
  phase1Seconds: number
  phase2Seconds: number
  customEndMessage: string
  
  // Timer state
  phase: TimerPhase
  remainingSeconds: number
  isRunning: boolean
  isPaused: boolean
  
  // Overlay mode
  overlayMode: boolean
  
  // Fullscreen presentation mode (for Zoom screen sharing)
  fullscreenMode: boolean
  
  // Sound enabled
  soundEnabled: boolean
  
  // Dark mode
  darkMode: boolean
  
  // Speaker queue
  speakers: Speaker[]
  currentSpeakerIndex: number
  
  // Phase transition alert visibility
  showPhaseTransition: boolean
  
  // Session history
  sessionHistory: SessionEntry[]
  currentSessionId: string | null
  
  // Actions
  setPhase1Seconds: (seconds: number) => void
  setPhase2Seconds: (seconds: number) => void
  setCustomEndMessage: (message: string) => void
  startTimer: () => void
  pauseTimer: () => void
  resumeTimer: () => void
  resetTimer: () => void
  tick: () => void
  toggleOverlay: () => void
  toggleFullscreen: () => void
  toggleSound: () => void
  toggleDarkMode: () => void
  dismissPhaseTransition: () => void
  
  // Speaker actions
  addSpeaker: (name: string) => void
  removeSpeaker: (id: string) => void
  moveSpeaker: (fromIndex: number, toIndex: number) => void
  nextSpeaker: () => void
  setCurrentSpeaker: (index: number) => void
  clearSpeakers: () => void
  
  // Session history
  clearHistory: () => void
}

const generateId = () => Math.random().toString(36).substring(2, 9)

// localStorage helpers
const STORAGE_KEY = 'zoom-timer-state'

function loadFromStorage(): Partial<TimerState> {
  if (typeof window === 'undefined') return {}
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const data = JSON.parse(stored)
      return {
        phase1Seconds: data.phase1Seconds ?? 180,
        phase2Seconds: data.phase2Seconds ?? 120,
        customEndMessage: data.customEndMessage ?? 'Tempo esgotado!',
        soundEnabled: data.soundEnabled ?? true,
        darkMode: data.darkMode ?? false,
        speakers: data.speakers ?? [],
        sessionHistory: data.sessionHistory ?? [],
      }
    }
  } catch {
    // ignore
  }
  return {}
}

function saveToStorage(state: Partial<TimerState>) {
  if (typeof window === 'undefined') return
  try {
    const data = {
      phase1Seconds: state.phase1Seconds,
      phase2Seconds: state.phase2Seconds,
      customEndMessage: state.customEndMessage,
      soundEnabled: state.soundEnabled,
      darkMode: state.darkMode,
      speakers: state.speakers,
      sessionHistory: state.sessionHistory,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // ignore
  }
}

export const useTimerStore = create<TimerState>((set, get) => ({
  // Default configuration
  phase1Seconds: 180, // 3 minutes
  phase2Seconds: 120, // 2 minutes
  customEndMessage: 'Tempo esgotado!',
  
  // Default state
  phase: 'idle',
  remainingSeconds: 0,
  isRunning: false,
  isPaused: false,
  
  // Overlay
  overlayMode: false,
  
  // Fullscreen
  fullscreenMode: false,
  
  // Sound
  soundEnabled: true,
  
  // Dark mode
  darkMode: false,
  
  // Speakers
  speakers: [],
  currentSpeakerIndex: -1,
  
  // Phase transition
  showPhaseTransition: false,
  
  // Session history
  sessionHistory: [],
  currentSessionId: null,
  
  // Initialize from localStorage on client
  _init: () => {
    const stored = loadFromStorage()
    if (Object.keys(stored).length > 0) {
      set(stored)
    }
  },
  
  setPhase1Seconds: (seconds) => {
    set({ phase1Seconds: Math.max(0, seconds) })
    saveToStorage(get())
  },
  setPhase2Seconds: (seconds) => {
    set({ phase2Seconds: Math.max(0, seconds) })
    saveToStorage(get())
  },
  setCustomEndMessage: (message) => {
    set({ customEndMessage: message })
    saveToStorage(get())
  },
  
  startTimer: () => {
    const { phase1Seconds, speakers, currentSpeakerIndex } = get()
    const sessionId = generateId()
    const speakerName = currentSpeakerIndex >= 0 && currentSpeakerIndex < speakers.length
      ? speakers[currentSpeakerIndex].name
      : ''
    
    // Create session entry
    const entry: SessionEntry = {
      id: sessionId,
      speakerName,
      phase1Seconds,
      phase2Seconds: get().phase2Seconds,
      startedAt: Date.now(),
      endedAt: null,
      completed: false,
    }
    
    set((s) => ({
      phase: 'phase1',
      remainingSeconds: phase1Seconds,
      isRunning: true,
      isPaused: false,
      showPhaseTransition: false,
      currentSessionId: sessionId,
      sessionHistory: [entry, ...s.sessionHistory].slice(0, 50), // Keep last 50
    }))
    saveToStorage(get())
  },
  
  pauseTimer: () => set({ isPaused: true }),
  
  resumeTimer: () => set({ isPaused: false }),
  
  resetTimer: () => {
    const { currentSessionId, sessionHistory } = get()
    // Mark current session as not completed if it exists
    if (currentSessionId) {
      const updated = sessionHistory.map((e) =>
        e.id === currentSessionId ? { ...e, endedAt: Date.now(), completed: false } : e
      )
      set({
        phase: 'idle',
        remainingSeconds: 0,
        isRunning: false,
        isPaused: false,
        showPhaseTransition: false,
        currentSessionId: null,
        sessionHistory: updated,
      })
      saveToStorage(get())
    } else {
      set({
        phase: 'idle',
        remainingSeconds: 0,
        isRunning: false,
        isPaused: false,
        showPhaseTransition: false,
      })
    }
  },
  
  tick: () => {
    const { remainingSeconds, phase, isRunning, isPaused } = get()
    if (!isRunning || isPaused) return
    
    if (remainingSeconds <= 1) {
      // Time's up for current phase
      if (phase === 'phase1') {
        const { phase2Seconds } = get()
        set({
          phase: 'phaseTransition',
          showPhaseTransition: true,
          remainingSeconds: 0,
        })
        // Auto-transition to phase 2 after showing alert
        setTimeout(() => {
          const state = get()
          if (state.phase === 'phaseTransition') {
            set({
              phase: 'phase2',
              remainingSeconds: state.phase2Seconds,
            })
          }
        }, 3000)
      } else if (phase === 'phase2') {
        // Mark session as completed
        const { currentSessionId, sessionHistory } = get()
        let updated = sessionHistory
        if (currentSessionId) {
          updated = sessionHistory.map((e) =>
            e.id === currentSessionId ? { ...e, endedAt: Date.now(), completed: true } : e
          )
        }
        set({
          phase: 'timeUp',
          remainingSeconds: 0,
          isRunning: false,
          currentSessionId: null,
          sessionHistory: updated,
        })
        saveToStorage(get())
      }
    } else {
      set({ remainingSeconds: remainingSeconds - 1 })
    }
  },
  
  toggleOverlay: () => set((s) => ({ overlayMode: !s.overlayMode })),
  toggleFullscreen: () => set((s) => ({ fullscreenMode: !s.fullscreenMode })),
  toggleSound: () => {
    const newVal = !get().soundEnabled
    set({ soundEnabled: newVal })
    saveToStorage(get())
  },
  toggleDarkMode: () => {
    const newVal = !get().darkMode
    set({ darkMode: newVal })
    saveToStorage(get())
  },
  dismissPhaseTransition: () => {
    const { phase2Seconds } = get()
    set({
      showPhaseTransition: false,
      phase: 'phase2',
      remainingSeconds: phase2Seconds,
    })
  },
  
  // Speaker actions
  addSpeaker: (name) => {
    set((s) => ({
      speakers: [...s.speakers, { id: generateId(), name, order: s.speakers.length }]
    }))
    saveToStorage(get())
  },
  
  removeSpeaker: (id) => {
    set((s) => ({
      speakers: s.speakers.filter((sp) => sp.id !== id).map((sp, i) => ({ ...sp, order: i })),
      currentSpeakerIndex: s.currentSpeakerIndex >= s.speakers.length - 1 
        ? Math.max(-1, s.currentSpeakerIndex - 1) 
        : s.currentSpeakerIndex
    }))
    saveToStorage(get())
  },
  
  moveSpeaker: (fromIndex, toIndex) => set((s) => {
    const newSpeakers = [...s.speakers]
    const [moved] = newSpeakers.splice(fromIndex, 1)
    newSpeakers.splice(toIndex, 0, moved)
    const result = {
      speakers: newSpeakers.map((sp, i) => ({ ...sp, order: i }))
    }
    saveToStorage({ ...s, ...result })
    return result
  }),
  
  nextSpeaker: () => set((s) => ({
    currentSpeakerIndex: s.currentSpeakerIndex < s.speakers.length - 1 
      ? s.currentSpeakerIndex + 1 
      : s.currentSpeakerIndex
  })),
  
  setCurrentSpeaker: (index) => set({ currentSpeakerIndex: index }),
  
  clearSpeakers: () => {
    set({ speakers: [], currentSpeakerIndex: -1 })
    saveToStorage(get())
  },
  
  clearHistory: () => {
    set({ sessionHistory: [] })
    saveToStorage(get())
  },
}))

// Initialize from localStorage on first client render
if (typeof window !== 'undefined') {
  const stored = loadFromStorage()
  if (Object.keys(stored).length > 0) {
    useTimerStore.setState(stored)
  }
}
