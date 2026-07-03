import clsx from 'clsx'
import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts'
import type { AuditSession } from '../types/audit'
import { useAuditStore } from '../store/useAuditStore'
import {
  buildReport,
  getScoreColor,
  getScoreDot,
  getScoreLabel,
} from '../utils/scoring'
import { exportToPDF } from '../utils/export'

interface Props {
  session: AuditSession
}

function scoreBarColor(score: number) {
  if (score >= 70) return '#10b981'
  if (score >= 40) return '#f59e0b'
  return '#ef4444'
}

export function SummaryScreen({ session }: Props) {
  const { resetSession } = useAuditStore()
  const report = useMemo(() => buildReport(session), [session])
  const { categoryScores, overallScore, criticalItems, warningItems } = report

  const chartData = categoryScores.map((c) => ({
    name: c.label.replace('PMT ', '').replace('Sprint ', 'Sprint\n').replace('Client ', 'Client\n').replace('Product ', 'Product\n').replace('Team ', 'Team\n'),
    score: c.score,
    answered: c.answeredCount,
    total: c.totalCount,
  }))

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Bar */}
      <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-semibold">{session.projectName}</h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Audit completed · {session.completedAt ? new Date(session.completedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Today'}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => exportToPDF(report)}
            className="px-4 py-2 text-sm font-medium bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          >
            ↓ Export PDF
          </button>
          <button
            onClick={resetSession}
            className="px-4 py-2 text-sm font-medium border border-slate-600 hover:bg-slate-800 rounded-lg transition-colors"
          >
            New Audit
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Overall Score */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-5 col-span-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Overall Score</p>
            <p className={clsx('text-4xl font-semibold', getScoreColor(overallScore))}>{overallScore}%</p>
            <p className={clsx('text-sm mt-1', getScoreColor(overallScore))}>{getScoreLabel(overallScore)}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Answered</p>
            <p className="text-3xl font-semibold text-slate-900">{Object.keys(session.answers).length}<span className="text-slate-400 text-lg">/40</span></p>
            <p className="text-sm text-slate-500 mt-1">questions</p>
          </div>
          <div className="bg-white rounded-xl border border-red-100 p-5">
            <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-1">Critical</p>
            <p className="text-3xl font-semibold text-red-600">{criticalItems.length}</p>
            <p className="text-sm text-slate-500 mt-1">action items</p>
          </div>
          <div className="bg-white rounded-xl border border-amber-100 p-5">
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">Warnings</p>
            <p className="text-3xl font-semibold text-amber-600">{warningItems.length}</p>
            <p className="text-sm text-slate-500 mt-1">improvement areas</p>
          </div>
        </div>

        {/* Category Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-5">Category Scores</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: '#64748b' }}
                angle={-30}
                textAnchor="end"
                interval={0}
              />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip
                formatter={(value: number) => [`${value}%`, 'Score']}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
              />
              <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={scoreBarColor(entry.score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Score Cards */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {categoryScores.map((c) => (
            <div key={c.category} className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-slate-600 truncate">{c.label}</p>
                <span className={clsx('w-2 h-2 rounded-full flex-shrink-0', getScoreDot(c.score))} />
              </div>
              <p className={clsx('text-xl font-semibold', getScoreColor(c.score))}>{c.score}%</p>
              <p className="text-xs text-slate-400 mt-0.5">{c.answeredCount}/{c.totalCount} answered</p>
              {c.flaggedQuestions > 0 && (
                <p className="text-xs text-red-500 mt-1">{c.flaggedQuestions} flagged</p>
              )}
            </div>
          ))}
        </div>

        {/* Critical Action Items */}
        {criticalItems.length > 0 && (
          <div className="bg-white rounded-xl border border-red-200 mb-6">
            <div className="px-6 py-4 border-b border-red-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <h2 className="text-sm font-semibold text-red-700">Critical Action Items ({criticalItems.length})</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {criticalItems.map((item) => (
                <div key={item.questionId} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <span className="text-xs bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full">
                        {item.categoryLabel}
                      </span>
                      <p className="text-sm font-medium text-slate-800 mt-1.5">{item.questionText}</p>
                    </div>
                    <span className="text-sm font-semibold text-red-600 flex-shrink-0">{item.normalizedScore}%</span>
                  </div>
                  <ul className="mt-2 space-y-1 pl-3">
                    {item.actionItems.map((action, i) => (
                      <li key={i} className="text-xs text-red-700 flex gap-2">
                        <span className="flex-shrink-0">→</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Warning Items */}
        {warningItems.length > 0 && (
          <div className="bg-white rounded-xl border border-amber-200 mb-6">
            <div className="px-6 py-4 border-b border-amber-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <h2 className="text-sm font-semibold text-amber-700">Improvement Areas ({warningItems.length})</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {warningItems.map((item) => (
                <div key={item.questionId} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                        {item.categoryLabel}
                      </span>
                      <p className="text-sm font-medium text-slate-800 mt-1.5">{item.questionText}</p>
                    </div>
                    <span className="text-sm font-semibold text-amber-600 flex-shrink-0">{item.normalizedScore}%</span>
                  </div>
                  <ul className="mt-2 space-y-1 pl-3">
                    {item.actionItems.slice(0, 2).map((action, i) => (
                      <li key={i} className="text-xs text-amber-700 flex gap-2">
                        <span className="flex-shrink-0">→</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Good Message */}
        {criticalItems.length === 0 && warningItems.length === 0 && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 text-center">
            <p className="text-2xl mb-2">🎉</p>
            <p className="text-emerald-700 font-semibold">Excellent audit results!</p>
            <p className="text-emerald-600 text-sm mt-1">All answered questions scored well. Keep up the great work.</p>
          </div>
        )}
      </div>
    </div>
  )
}
