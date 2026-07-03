import clsx from 'clsx'
import type { AuditQuestion } from '../types/audit'

interface Props {
  question: AuditQuestion
  selectedValue?: number
  onSelect: (value: number) => void
}

export function ScoreSelector({ question, selectedValue, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {question.options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onSelect(opt.value)}
          className={clsx(
            'px-3 py-2 rounded-lg text-sm font-medium border transition-all text-left',
            selectedValue === opt.value
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-700 border-slate-300 hover:border-slate-500 hover:bg-slate-50'
          )}
        >
          <span className={clsx('text-xs mr-1', selectedValue === opt.value ? 'text-slate-400' : 'text-slate-400')}>
            {opt.value}.
          </span>
          {opt.label}
        </button>
      ))}
    </div>
  )
}
