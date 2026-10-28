import { useEffect, useState, type ComponentType } from 'react'
import './App.css'
import {
  ClipboardCheckIcon,
  ListIcon,
  Logo,
  SearchIcon,
  ShieldAlertIcon,
  UserPlusIcon,
} from './components/Icons'
import { Pagination } from './components/Pagination'
import { useEncounters } from './hooks/useEncounters'
import { parseRoute, screenHref, type Screen } from './routes'
import { AddEncounter } from './screens/AddEncounter'
import { EncounterList } from './screens/EncounterList'
import { HighRiskQueue } from './screens/HighRiskQueue'
import { SearchPatient } from './screens/SearchPatient'
import { StatusTracking, type UpdateLogEntry } from './screens/StatusTracking'

const NAV: { screen: Screen; label: string; icon: ComponentType<{ size?: number }> }[] = [
  { screen: 'add', label: 'Add Encounter', icon: UserPlusIcon },
  { screen: 'encounters', label: 'All Encounters', icon: ListIcon },
  { screen: 'search', label: 'Search Patient', icon: SearchIcon },
  { screen: 'high-risk', label: 'High-Risk Queue', icon: ShieldAlertIcon },
  { screen: 'status', label: 'Status Tracking', icon: ClipboardCheckIcon },
]

const ENCOUNTERS_PAGE_SIZE = 25

function App() {
  const [route, setRoute] = useState(() => parseRoute(window.location.hash))
  // Lives here so the update list survives switching between screens.
  const [updateLog, setUpdateLog] = useState<UpdateLogEntry[]>([])
  // Shared by Add Encounter and All Encounters, so a new encounter refreshes the list.
  const encounters = useEncounters(ENCOUNTERS_PAGE_SIZE)

  useEffect(() => {
    const onHashChange = () => setRoute(parseRoute(window.location.hash))
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <a className="brand" href={screenHref('search')}>
            <Logo />
            <div>
              <div className="brand-title">Diabetes Patient Management</div>
              <div className="brand-subtitle">Readmission Intervention Queue</div>
            </div>
          </a>
        </div>
        <nav className="tabs" aria-label="Screens">
          {NAV.map(({ screen, label, icon: Icon }) => (
            <a
              key={screen}
              href={screenHref(screen)}
              className={`tab${route.screen === screen ? ' active' : ''}`}
              aria-current={route.screen === screen ? 'page' : undefined}
            >
              <Icon size={16} />
              <span>{label}</span>
            </a>
          ))}
        </nav>
      </header>

      <main className="content">
        {route.screen === 'add' && <AddEncounter onCreate={encounters.create} />}
        {route.screen === 'encounters' && (
          <EncounterList encounters={encounters}>
            <Pagination
              page={encounters.page}
              pageSize={encounters.pageSize}
              total={encounters.total}
              disabled={encounters.loading}
              onPageChange={encounters.setPage}
            />
          </EncounterList>
        )}
        {route.screen === 'search' && <SearchPatient />}
        {route.screen === 'high-risk' && <HighRiskQueue />}
        {route.screen === 'status' && (
          <StatusTracking
            encounterId={route.encounterId}
            updateLog={updateLog}
            onUpdated={(entry) => setUpdateLog((log) => [entry, ...log])}
          />
        )}
      </main>

      <footer className="footer">Learning prototype — not for clinical decision-making.</footer>
    </div>
  )
}

export default App
