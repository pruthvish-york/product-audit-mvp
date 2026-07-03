import { useState } from 'react'
import clsx from 'clsx'
import type { AuditQuestion, Answer } from '../types/audit'
import { ScoreSelector } from './ScoreSelector'
import { normalizeScore, getScoreColor, getScoreLabel } from '../utils/scoring'

interface Props {
  question: AuditQuestion
  answer?: Answer
  isActive: boolean
  onAnswer: (answer: Answer) => void
  onClick: () => void
}

export function QuestionCard({ question, answer, isActive, onAnswer, onClick }: Props) {
  const [showHowTo, setShowHowTo] = useState(false)
  const normalized = answer ? normalizeScore(answer.value, question) : null

  return (
    <div
      className={clsx(
        'bg-white rounded-xl border transition-all',
        isActive ? 'border-slate-400 shadow-sm' : 'border-slate-200 hover:border-slate-300 cursor-pointer'
      )}
      onClick={!isActive ? onClick : undefined}
    >
      <div className="p-5">
        {/* Question header */}
        <div className="flex items-start gap-3">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold flex items-center justify-center mt-0.5">
            {question.number}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 leading-snug">{question.question}</p>
            {question.automatable && (
              <span className="inline-flex items-center gap-1 mt-1.5 text-xs text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                ⚡ Phase 2: Auto from {question.dataSource}
              </span>
            )}
          </div>
          {normalized !== null && (
            <div className="flex-shrink-0 text-right ml-2">
              <span className={clsx('text-sm font-semibold', getScoreColor(normalized))}>{normalized}%</span>
              <p className={clsx('text-xs', getScoreColor(normalized))}>{getScoreLabel(normalized)}</p>
            </div>
          )}
        </div>

        {/* Collapsed label */}
        {!isActive && answer && (
          <div className="mt-2 ml-9">
            <span className="text-xs text-slate-500">
              {question.options.find((o) => o.value === answer.value)?.label}
            </span>
          </div>
        )}

        {/* Expanded content */}
        {isActive && (
          <div className="mt-4 space-y-4">
            {/* How to check */}
            <div>
              <button
                onClick={() => setShowHowTo(!showHowTo)}
                className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
              >
                <span>{showHowTo ? '▾' : '▸'}</span>
                How to check
              </button>
              {showHowTo && (
                <div className="mt-2 px-3 py-2.5 bg-slate-50 rounded-lg text-xs text-slate-600 leading-relaxed border border-slate-100">
                  {question.howToCheck}
                </div>
              )}
            </div>

            {/* Score selector */}
            <div>
              <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">Score</p>
              <ScoreSelector
                question={question}
                selectedValue={answer?.value}
                onSelect={(value) => onAnswer({ value, note: answer?.note })}
              />
            </div>

            {/* Action items for selected score */}
            {answer?.value && (() => {
              const opt = question.options.find((o) => o.value === answer.value)
              return opt && opt.actionItems.length > 0 ? (
                <div className="px-3 py-2.5 bg-amber-50 border border-amber-100 rounded-lg">
                  <p className="text-xs font-medium text-amber-700 mb-1.5">Action items for this score:</p>
                  <ul className="space-y-1">
                    {opt.actionItems.map((a, i) => (
                      <li key={i} className="text-xs text-amber-700 flex gap-1.5">
                        <span className="flex-shrink-0">→</span>
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null
            })()}

            {/* Notes — only available after scoring */}
            {answer?.value && (
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Notes</p>
                <textarea
                  value={answer.note ?? ''}
                  onChange={(e) => onAnswer({ value: answer.value, note: e.target.value })}
                  placeholder="Add context or observations (optional)..."
                  rows={2}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
