import { useState } from 'react'
import { useAuditStore } from '../store/useAuditStore'
import type { AuditSession } from '../types/audit'

export function LandingScreen() {
  const { sessions, createSession, loadSession, deleteSession } = useAuditStore()
  const [projectName, setProjectName] = useState('')
  const [clientName, setClientName] = useState('')
  const [auditorName, setAuditorName] = useState('')
  const [error, setError] = useState('')

  const activeSessions = sessions.filter((s) => s.status === 'active')
  const pastSessions = [...sessions.filter((s) => s.status === 'completed')].reverse()

  function handleStart(e: React.FormEvent) {
    e.preventDefault()
    if (!projectName.trim() || !auditorName.trim()) {
      setError('Project name and auditor name are required.')
      return
    }
    createSession(projectName.trim(), clientName.trim(), auditorName.trim())
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-slate-900 text-white px-8 py-5">
        <div className="max-w-5xl mx-auto">
          <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mb-1">York.ie R&D</p>
          <h1 className="text-xl font-semibold">Product Audit Tool</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-10 flex gap-8 items-start">
        {/* New Audit Form */}
        <div className="flex-1 max-w-md">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Start New Audit</h2>
          <form onSubmit={handleStart} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                value={projectName}
                onChange={(e) => { setProjectName(e.target.value); setError('') }}
                placeholder="e.g. Acme Portal v2"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Client Name</label>
              <input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Acme Corp"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Auditor Name <span className="text-red-500">*</span>
              </label>
              <input
                value={auditorName}
                onChange={(e) => { setAuditorName(e.target.value); setError('') }}
                placeholder="e.g. Pruthvish Patel"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
            {error && <p className="text-red-600 text-xs">{error}</p>}
            <button
              type="submit"
              className="w-full bg-slate-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
            >
              Start Audit →
            </button>
          </form>
        </div>

        {/* Session History */}
        <div className="w-72 flex-shrink-0">
          {activeSessions.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">In Progress</h2>
              <div className="space-y-2">
                {activeSessions.map((s) => (
                  <SessionCard key={s.id} session={s} onLoad={loadSession} onDelete={deleteSession} />
                ))}
              </div>
            </div>
          )}

          {pastSessions.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Past Audits</h2>
              <div className="space-y-2">
                {pastSessions.map((s) => (
                  <SessionCard key={s.id} session={s} onLoad={loadSession} onDelete={deleteSession} />
                ))}
              </div>
            </div>
          )}

          {sessions.length === 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
              <p className="text-slate-400 text-sm">No audits yet.</p>
              <p className="text-slate-400 text-xs mt-1">Completed audits will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SessionCard({
  session,
  onLoad,
  onDelete,
}: {
  session: AuditSession
  onLoad: (id: string) => void
  onDelete: (id: string) => void
}) {
  const answeredCount = Object.keys(session.answers).length

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-800 truncate">{session.projectName}</p>
          {session.clientName && (
            <p className="text-xs text-slate-500 truncate">{session.clientName}</p>
          )}
          <p className="text-xs text-slate-400 mt-0.5">
            {session.status === 'active'
              ? `${answeredCount}/40 answered`
              : `Completed · ${new Date(session.completedAt!).toLocaleDateString('en-GB')}`}
          </p>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={() => onLoad(session.id)}
            className="text-xs text-slate-600 hover:text-slate-900 px-2 py-1 rounded hover:bg-slate-100 transition-colors"
          >
            {session.status === 'active' ? 'Resume' : 'View'}
          </button>
          <button
            onClick={() => onDelete(session.id)}
            className="text-xs text-slate-400 hover:text-red-600 px-1.5 py-1 rounded hover:bg-red-50 transition-colors"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  )
}
