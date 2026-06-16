import { create } from 'zustand'

export type TimerPhase = 'idle' | 'phase1' | 'phaseTransition' | 'phase2' | 'timeUp'

export interface Speaker {
  id: string
  name: string
  order: number
}

interface TimerState {
  // Timer configuration
  phase1Minutes: number
  phase2Minutes: number
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
  
  // Speaker queue
  speakers: Speaker[]
  currentSpeakerIndex: number
  
  // Phase transition alert visibility
  showPhaseTransition: boolean
  
  // Actions
  setPhase1Minutes: (minutes: number) => void
  setPhase2Minutes: (minutes: number) => void
  setCustomEndMessage: (message: string) => void
  startTimer: () => void
  pauseTimer: () => void
  resumeTimer: () => void
  resetTimer: () => void
  tick: () => void
  toggleOverlay: () => void
  toggleFullscreen: () => void
  toggleSound: () => void
  dismissPhaseTransition: () => void
  
  // Speaker actions
  addSpeaker: (name: string) => void
  removeSpeaker: (id: string) => void
  moveSpeaker: (fromIndex: number, toIndex: number) => void
  nextSpeaker: () => void
  setCurrentSpeaker: (index: number) => void
  clearSpeakers: () => void
}

const generateId = () => Math.random().toString(36).substring(2, 9)

export const useTimerStore = create<TimerState>((set, get) => ({
  // Default configuration
  phase1Minutes: 3,
  phase2Minutes: 2,
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
  
  // Speakers
  speakers: [],
  currentSpeakerIndex: -1,
  
  // Phase transition
  showPhaseTransition: false,
  
  setPhase1Minutes: (minutes) => set({ phase1Minutes: Math.max(0, minutes) }),
  setPhase2Minutes: (minutes) => set({ phase2Minutes: Math.max(0, minutes) }),
  setCustomEndMessage: (message) => set({ customEndMessage: message }),
  
  startTimer: () => {
    const { phase1Minutes } = get()
    set({
      phase: 'phase1',
      remainingSeconds: phase1Minutes * 60,
      isRunning: true,
      isPaused: false,
      showPhaseTransition: false,
    })
  },
  
  pauseTimer: () => set({ isPaused: true }),
  
  resumeTimer: () => set({ isPaused: false }),
  
  resetTimer: () => set({
    phase: 'idle',
    remainingSeconds: 0,
    isRunning: false,
    isPaused: false,
    showPhaseTransition: false,
  }),
  
  tick: () => {
    const { remainingSeconds, phase, isRunning, isPaused } = get()
    if (!isRunning || isPaused) return
    
    if (remainingSeconds <= 1) {
      // Time's up for current phase
      if (phase === 'phase1') {
        const { phase2Minutes } = get()
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
              remainingSeconds: state.phase2Minutes * 60,
            })
          }
        }, 3000)
      } else if (phase === 'phase2') {
        set({
          phase: 'timeUp',
          remainingSeconds: 0,
          isRunning: false,
        })
      }
    } else {
      set({ remainingSeconds: remainingSeconds - 1 })
    }
  },
  
  toggleOverlay: () => set((s) => ({ overlayMode: !s.overlayMode })),
  toggleFullscreen: () => set((s) => ({ fullscreenMode: !s.fullscreenMode })),
  toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
  dismissPhaseTransition: () => {
    const { phase2Minutes } = get()
    set({
      showPhaseTransition: false,
      phase: 'phase2',
      remainingSeconds: phase2Minutes * 60,
    })
  },
  
  // Speaker actions
  addSpeaker: (name) => set((s) => ({
    speakers: [...s.speakers, { id: generateId(), name, order: s.speakers.length }]
  })),
  
  removeSpeaker: (id) => set((s) => ({
    speakers: s.speakers.filter((sp) => sp.id !== id).map((sp, i) => ({ ...sp, order: i })),
    currentSpeakerIndex: s.currentSpeakerIndex >= s.speakers.length - 1 
      ? Math.max(0, s.currentSpeakerIndex - 1) 
      : s.currentSpeakerIndex
  })),
  
  moveSpeaker: (fromIndex, toIndex) => set((s) => {
    const newSpeakers = [...s.speakers]
    const [moved] = newSpeakers.splice(fromIndex, 1)
    newSpeakers.splice(toIndex, 0, moved)
    return {
      speakers: newSpeakers.map((sp, i) => ({ ...sp, order: i }))
    }
  }),
  
  nextSpeaker: () => set((s) => ({
    currentSpeakerIndex: s.currentSpeakerIndex < s.speakers.length - 1 
      ? s.currentSpeakerIndex + 1 
      : s.currentSpeakerIndex
  })),
  
  setCurrentSpeaker: (index) => set({ currentSpeakerIndex: index }),
  
  clearSpeakers: () => set({ speakers: [], currentSpeakerIndex: -1 }),
}))
