import { useAuditStore, useActiveSession } from './store/useAuditStore'
import { LandingScreen } from './components/LandingScreen'
import { AuditRunner } from './components/AuditRunner'
import { SummaryScreen } from './components/SummaryScreen'

export default function App() {
  const { activeSessionId } = useAuditStore()
  const session = useActiveSession()

  if (!activeSessionId || !session) {
    return <LandingScreen />
  }

  if (session.status === 'completed') {
    return <SummaryScreen session={session} />
  }

  return <AuditRunner session={session} />
}
