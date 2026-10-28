import { useEffect, useState } from 'react'
import {
  createEncounter,
  deleteEncounter,
  listEncounters,
  type Encounter,
  type EncounterCreate,
  type EncounterCreated,
} from '../api'

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err)
}

/** One page of encounters, plus create and delete that keep the page in sync with the server. */
export function useEncounters(pageSize = 25) {
  const [page, setPageIndex] = useState(0)
  const [reloadKey, setReloadKey] = useState(0)
  const [rows, setRows] = useState<Encounter[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    listEncounters(pageSize, page * pageSize)
      .then(({ items, total }) => {
        if (cancelled) return
        setRows(items)
        setTotal(total)
      })
      .catch((err) => !cancelled && setError(errorMessage(err)))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [page, pageSize, reloadKey])

  const startLoading = () => {
    setLoading(true)
    setError(null)
  }

  const setPage = (next: number) => {
    if (next === page || next < 0) return
    startLoading()
    setPageIndex(next)
  }

  const reload = () => {
    startLoading()
    setReloadKey((key) => key + 1)
  }

  /** Errors are rethrown so the calling form can show them next to its fields. */
  const create = async (payload: EncounterCreate): Promise<EncounterCreated> => {
    const created = await createEncounter(payload)
    reload()
    return created
  }

  const remove = async (encounterId: number) => {
    setDeletingId(encounterId)
    setError(null)
    try {
      await deleteEncounter(encounterId)
      // Step back a page when the only row on a later page was removed.
      if (rows.length === 1 && page > 0) setPage(page - 1)
      else reload()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setDeletingId(null)
    }
  }

  return { rows, page, pageSize, total, loading, error, deletingId, setPage, reload, create, remove }
}

export type EncountersState = ReturnType<typeof useEncounters>
