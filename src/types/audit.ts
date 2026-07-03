export type AnswerType = 'scale5' | 'scale4' | 'scale3' | 'yesno' | 'multi4'
export type DataSource = 'jira' | 'confluence' | 'qa' | 'calendar' | 'ops'
export type Priority = 'critical' | 'warning'

export interface QuestionOption {
  value: number
  label: string
  actionItems: string[]
}

export interface AuditQuestion {
  id: string
  number: number
  category: string
  question: string
  howToCheck: string
  answerType: AnswerType
  meetingType: string
  dataSource: DataSource
  automatable: boolean
  isReverse?: boolean
  options: QuestionOption[]
}

export interface CategoryMeta {
  key: string
  label: string
  icon: string
  color: string
  bgColor: string
}

export interface Answer {
  value: number
  note?: string
}

export interface AuditSession {
  id: string
  projectName: string
  clientName: string
  auditorName: string
  startedAt: string
  completedAt?: string
  currentCategory: string
  answers: Record<string, Answer>
  status: 'active' | 'completed'
}

export interface CategoryScore {
  category: string
  label: string
  score: number
  answeredCount: number
  totalCount: number
  flaggedQuestions: number
}

export interface ActionItem {
  questionId: string
  questionText: string
  category: string
  categoryLabel: string
  score: number
  normalizedScore: number
  actionItems: string[]
  priority: Priority
}

export interface AuditReport {
  session: AuditSession
  categoryScores: CategoryScore[]
  overallScore: number
  criticalItems: ActionItem[]
  warningItems: ActionItem[]
}
