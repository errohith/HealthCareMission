import type { ReactNode } from 'react'
import { Alert, EmptyState } from '../components/Alert'
import { RiskBadge } from '../components/Badges'
import { InboxIcon, ListIcon, RefreshIcon, TrashIcon } from '../components/Icons'
import type { EncountersState } from '../hooks/useEncounters'
import { screenHref } from '../routes'

interface EncounterListProps {
  encounters: EncountersState
  /** Rendered under the table, e.g. the pager. */
  children?: ReactNode
}

export function EncounterList({ encounters, children }: EncounterListProps) {
  const { rows, page, loading, error, deletingId, reload, remove } = encounters

  const handleDelete = (encounterId: number) => {
    if (window.confirm(`Delete encounter ${encounterId} and its care intervention?`)) {
      void remove(encounterId)
    }
  }

  return (
    <section className="card">
      <header className="card-header">
        <span className="card-icon">
          <ListIcon />
        </span>
        <div>
          <h2>All Encounters</h2>
          <p>
            Every stored encounter, by encounter ID. <a href={screenHref('add')}>Add an encounter</a>{' '}
            or delete one that was entered by mistake.
          </p>
        </div>
        <button
          type="button"
          className="button ghost icon-only"
          onClick={reload}
          title="Refresh"
          aria-label="Refresh"
        >
          <RefreshIcon />
        </button>
      </header>

      {error && <Alert kind="error">{error}</Alert>}

      {!loading && rows.length === 0 ? (
        !error && (
          <EmptyState>
            <InboxIcon size={28} />
            {page === 0 ? 'No encounters stored yet.' : 'No more encounters.'}
          </EmptyState>
        )
      ) : (
        <div className={`table-wrap${loading ? ' is-loading' : ''}`}>
          <table>
            <thead>
              <tr>
                <th>Encounter</th>
                <th>Patient</th>
                <th>Age</th>
                <th className="num">Days</th>
                <th className="num">Inpatient</th>
                <th className="num">Emergency</th>
                <th className="num">Meds</th>
                <th>Risk</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.encounter_id}>
                  <td>{row.encounter_id}</td>
                  <td>{row.patient_nbr}</td>
                  <td>{row.age}</td>
                  <td className="num">{row.time_in_hospital}</td>
                  <td className="num">{row.number_inpatient}</td>
                  <td className="num">{row.number_emergency}</td>
                  <td className="num">{row.num_medications}</td>
                  <td>
                    <RiskBadge level={row.risk_level} score={row.risk_score} />
                  </td>
                  <td className="num">
                    <button
                      type="button"
                      className="button danger icon-only"
                      onClick={() => handleDelete(row.encounter_id)}
                      disabled={deletingId !== null || loading}
                      title="Delete encounter"
                      aria-label={`Delete encounter ${row.encounter_id}`}
                    >
                      <TrashIcon size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {children}
    </section>
  )
}
