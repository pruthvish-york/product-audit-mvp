import clsx from 'clsx'
import type { AuditSession } from '../types/audit'
import { CATEGORIES, QUESTIONS } from '../data/questions'
import { normalizeScore } from '../utils/scoring'

interface Props {
  session: AuditSession
  onSelectCategory: (category: string) => void
}

export function CategoryNav({ session, onSelectCategory }: Props) {
  return (
    <nav className="w-56 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col overflow-y-auto">
      <div className="px-4 py-3 border-b border-slate-100">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Categories</p>
      </div>
      <div className="flex-1 py-1">
        {CATEGORIES.map((cat) => {
          const catQs = QUESTIONS.filter((q) => q.category === cat.key)
          const answered = catQs.filter((q) => session.answers[q.id] !== undefined)
          const critical = answered.filter((q) => {
            const a = session.answers[q.id]
            return a && normalizeScore(a.value, q) < 40
          })
          const isActive = session.currentCategory === cat.key
          const complete = answered.length === catQs.length && catQs.length > 0

          return (
            <button
              key={cat.key}
              onClick={() => onSelectCategory(cat.key)}
              className={clsx(
                'w-full text-left px-4 py-3 transition-colors',
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'hover:bg-slate-50 text-slate-700'
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-base leading-none">{cat.icon}</span>
                <span className="text-xs font-medium flex-1 leading-tight">{cat.label}</span>
                {complete ? (
                  <span className={clsx('text-xs flex-shrink-0', isActive ? 'text-slate-300' : 'text-emerald-500')}>✓</span>
                ) : answered.length > 0 ? (
                  <span className={clsx('text-xs flex-shrink-0', isActive ? 'text-slate-400' : 'text-slate-400')}>
                    {answered.length}/{catQs.length}
                  </span>
                ) : null}
              </div>
              {critical.length > 0 && !isActive && (
                <p className="text-xs text-red-500 mt-0.5 ml-6">{critical.length} critical</p>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
