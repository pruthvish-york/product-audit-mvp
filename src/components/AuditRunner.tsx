import { useState } from 'react'
import clsx from 'clsx'
import type { AuditSession } from '../types/audit'
import { useAuditStore } from '../store/useAuditStore'
import { CATEGORIES, QUESTIONS } from '../data/questions'
import { CategoryNav } from './CategoryNav'
import { QuestionCard } from './QuestionCard'
import { completionPercent, answeredCount } from '../utils/scoring'

interface Props {
  session: AuditSession
}

export function AuditRunner({ session }: Props) {
  const { setAnswer, setCurrentCategory, completeAudit, resetSession } = useAuditStore()
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null)

  const catQuestions = QUESTIONS.filter((q) => q.category === session.currentCategory)
  const catMeta = CATEGORIES.find((c) => c.key === session.currentCategory)
  const currentCatIndex = CATEGORIES.findIndex((c) => c.key === session.currentCategory)
  const isLastCategory = currentCatIndex === CATEGORIES.length - 1
  const answered = answeredCount(session)
  const completion = completionPercent(session)

  function handleSelectCategory(category: string) {
    setCurrentCategory(category)
    setActiveQuestionId(null)
  }

  function handleNext() {
    if (!isLastCategory) {
      setCurrentCategory(CATEGORIES[currentCatIndex + 1].key)
      setActiveQuestionId(null)
    }
  }

  function handlePrev() {
    if (currentCatIndex > 0) {
      setCurrentCategory(CATEGORIES[currentCatIndex - 1].key)
      setActiveQuestionId(null)
    }
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Top bar */}
      <div className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="font-semibold text-sm">{session.projectName}</h1>
          <p className="text-slate-400 text-xs">{session.auditorName} · {answered}/40 answered</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-28 h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${completion}%` }}
              />
            </div>
            <span className="text-xs text-slate-400">{completion}%</span>
          </div>
          <button
            onClick={completeAudit}
            disabled={answered === 0}
            className="px-3 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            Complete Audit
          </button>
          <button
            onClick={resetSession}
            className="px-3 py-1.5 text-xs font-medium border border-slate-600 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Exit
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <CategoryNav session={session} onSelectCategory={handleSelectCategory} />

        {/* Main area */}
        <div className="flex-1 overflow-y-auto bg-slate-50">
          <div className="max-w-3xl mx-auto px-6 py-6">
            {/* Category header */}
            <div className={clsx('rounded-xl border px-5 py-4 mb-5', catMeta?.bgColor)}>
              <div className="flex items-center gap-2">
                <span className="text-xl">{catMeta?.icon}</span>
                <div>
                  <h2 className={clsx('font-semibold text-sm', catMeta?.color)}>{catMeta?.label}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {catQuestions.filter((q) => session.answers[q.id]).length}/{catQuestions.length} answered in this category
                  </p>
                </div>
              </div>
            </div>

            {/* Question cards */}
            <div className="space-y-3 mb-6">
              {catQuestions.map((q) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  answer={session.answers[q.id]}
                  isActive={activeQuestionId === q.id}
                  onAnswer={(answer) => {
                    setAnswer(q.id, answer)
                    setActiveQuestionId(q.id)
                  }}
                  onClick={() => setActiveQuestionId(activeQuestionId === q.id ? null : q.id)}
                />
              ))}
            </div>

            {/* Category navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <button
                onClick={handlePrev}
                disabled={currentCatIndex === 0}
                className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Previous
              </button>
              {isLastCategory ? (
                <button
                  onClick={completeAudit}
                  disabled={answered === 0}
                  className="px-5 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Complete Audit →
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-4 py-2 text-sm font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Next →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
