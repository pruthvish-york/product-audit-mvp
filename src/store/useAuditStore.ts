import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuditSession, Answer } from '../types/audit'
import { CATEGORIES } from '../data/questions'

interface AuditStore {
  sessions: AuditSession[]
  activeSessionId: string | null
  createSession: (projectName: string, clientName: string, auditorName: string) => void
  setAnswer: (questionId: string, answer: Answer) => void
  setCurrentCategory: (category: string) => void
  completeAudit: () => void
  resetSession: () => void
  loadSession: (sessionId: string) => void
  deleteSession: (sessionId: string) => void
}

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export const useAuditStore = create<AuditStore>()(
  persist(
    (set, get) => ({
      sessions: [],
      activeSessionId: null,

      createSession: (projectName, clientName, auditorName) => {
        const session: AuditSession = {
          id: generateId(),
          projectName,
          clientName,
          auditorName,
          startedAt: new Date().toISOString(),
          currentCategory: CATEGORIES[0].key,
          answers: {},
          status: 'active',
        }
        set((state) => ({
          sessions: [...state.sessions, session],
          activeSessionId: session.id,
        }))
      },

      setAnswer: (questionId, answer) => {
        const { activeSessionId } = get()
        if (!activeSessionId) return
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === activeSessionId
              ? { ...s, answers: { ...s.answers, [questionId]: answer } }
              : s
          ),
        }))
      },

      setCurrentCategory: (category) => {
        const { activeSessionId } = get()
        if (!activeSessionId) return
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === activeSessionId ? { ...s, currentCategory: category } : s
          ),
        }))
      },

      completeAudit: () => {
        const { activeSessionId } = get()
        if (!activeSessionId) return
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === activeSessionId
              ? { ...s, status: 'completed', completedAt: new Date().toISOString() }
              : s
          ),
        }))
      },

      resetSession: () => {
        set({ activeSessionId: null })
      },

      loadSession: (sessionId) => {
        set({ activeSessionId: sessionId })
      },

      deleteSession: (sessionId) => {
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== sessionId),
          activeSessionId: state.activeSessionId === sessionId ? null : state.activeSessionId,
        }))
      },
    }),
    { name: 'york-product-audit' }
  )
)

export function useActiveSession(): AuditSession | null {
  const { sessions, activeSessionId } = useAuditStore()
  return sessions.find((s) => s.id === activeSessionId) ?? null
}
