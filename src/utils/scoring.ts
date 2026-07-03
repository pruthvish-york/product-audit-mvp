import type {
  AuditSession,
  AuditQuestion,
  CategoryScore,
  ActionItem,
  AuditReport,
} from '../types/audit'
import { QUESTIONS, CATEGORIES } from '../data/questions'

export function getMaxScore(q: AuditQuestion): number {
  switch (q.answerType) {
    case 'scale5': return 5
    case 'scale4': return 4
    case 'scale3': return 3
    case 'yesno': return 2
    case 'multi4': return 4
    default: return 5
  }
}

export function normalizeScore(rawValue: number, q: AuditQuestion): number {
  const max = getMaxScore(q)
  const adjusted = q.isReverse ? max - rawValue + 1 : rawValue
  return Math.round(((adjusted - 1) / (max - 1)) * 100)
}

export function getScoreColor(normalizedScore: number): string {
  if (normalizedScore >= 70) return 'text-emerald-600'
  if (normalizedScore >= 40) return 'text-amber-600'
  return 'text-red-600'
}

export function getScoreBg(normalizedScore: number): string {
  if (normalizedScore >= 70) return 'bg-emerald-50 border-emerald-200'
  if (normalizedScore >= 40) return 'bg-amber-50 border-amber-200'
  return 'bg-red-50 border-red-200'
}

export function getScoreDot(normalizedScore: number): string {
  if (normalizedScore >= 70) return 'bg-emerald-500'
  if (normalizedScore >= 40) return 'bg-amber-400'
  return 'bg-red-500'
}

export function getScoreLabel(normalizedScore: number): string {
  if (normalizedScore >= 80) return 'Excellent'
  if (normalizedScore >= 60) return 'Good'
  if (normalizedScore >= 40) return 'Acceptable'
  if (normalizedScore >= 20) return 'Needs Improvement'
  return 'Critical'
}

export function computeCategoryScores(session: AuditSession): CategoryScore[] {
  return CATEGORIES.map((cat) => {
    const catQuestions = QUESTIONS.filter((q) => q.category === cat.key)
    const answered = catQuestions.filter((q) => session.answers[q.id] !== undefined)
    const flagged = answered.filter((q) => {
      const a = session.answers[q.id]
      return a && normalizeScore(a.value, q) < 40
    })

    let score = 0
    if (answered.length > 0) {
      const total = answered.reduce((acc, q) => {
        const a = session.answers[q.id]
        return acc + (a ? normalizeScore(a.value, q) : 0)
      }, 0)
      score = Math.round(total / answered.length)
    }

    return {
      category: cat.key,
      label: cat.label,
      score,
      answeredCount: answered.length,
      totalCount: catQuestions.length,
      flaggedQuestions: flagged.length,
    }
  })
}

export function computeOverallScore(categoryScores: CategoryScore[]): number {
  const answered = categoryScores.filter((c) => c.answeredCount > 0)
  if (answered.length === 0) return 0
  const total = answered.reduce((acc, c) => acc + c.score, 0)
  return Math.round(total / answered.length)
}

export function buildActionItems(session: AuditSession): {
  critical: ActionItem[]
  warning: ActionItem[]
} {
  const critical: ActionItem[] = []
  const warning: ActionItem[] = []

  for (const q of QUESTIONS) {
    const answer = session.answers[q.id]
    if (!answer) continue

    const normalizedScore = normalizeScore(answer.value, q)
    const selectedOption = q.options.find((o) => o.value === answer.value)
    if (!selectedOption) continue

    const catMeta = CATEGORIES.find((c) => c.key === q.category)
    const item: ActionItem = {
      questionId: q.id,
      questionText: q.question,
      category: q.category,
      categoryLabel: catMeta?.label ?? q.category,
      score: answer.value,
      normalizedScore,
      actionItems: selectedOption.actionItems,
      priority: normalizedScore < 40 ? 'critical' : 'warning',
    }

    if (normalizedScore < 40) critical.push(item)
    else if (normalizedScore < 70) warning.push(item)
  }

  return { critical, warning }
}

export function buildReport(session: AuditSession): AuditReport {
  const categoryScores = computeCategoryScores(session)
  const overallScore = computeOverallScore(categoryScores)
  const { critical, warning } = buildActionItems(session)

  return {
    session,
    categoryScores,
    overallScore,
    criticalItems: critical,
    warningItems: warning,
  }
}

export function totalQuestions(): number {
  return QUESTIONS.length
}

export function answeredCount(session: AuditSession): number {
  return Object.keys(session.answers).length
}

export function completionPercent(session: AuditSession): number {
  return Math.round((answeredCount(session) / totalQuestions()) * 100)
}
