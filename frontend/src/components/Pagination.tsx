import type { FormEvent } from 'react'
import { ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon } from './Icons'

interface PaginationProps {
  /** Zero-based page index. */
  page: number
  pageSize: number
  /** Total rows across all pages (from the API's X-Total-Count header). */
  total: number
  onPageChange: (page: number) => void
  disabled?: boolean
}

export function Pagination({ page, pageSize, total, onPageChange, disabled = false }: PaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const isFirst = page <= 0
  const isLast = page >= pageCount - 1
  const firstRow = total === 0 ? 0 : page * pageSize + 1
  const lastRow = Math.min(total, (page + 1) * pageSize)

  const goTo = (target: number) => {
    const next = Math.min(Math.max(target, 0), pageCount - 1)
    if (next !== page) onPageChange(next)
  }

  const handleJump = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const value = Number(new FormData(event.currentTarget).get('page'))
    if (Number.isInteger(value)) goTo(value - 1)
  }

  return (
    <nav className="pager" aria-label="Pagination">
      <span className="muted">
        {total === 0
          ? 'No records'
          : `Showing ${firstRow.toLocaleString()}–${lastRow.toLocaleString()} of ${total.toLocaleString()}`}
      </span>

      <div className="pager-controls">
        <button
          type="button"
          className="button ghost icon-only"
          disabled={isFirst || disabled}
          onClick={() => goTo(0)}
          title="First page"
          aria-label="First page"
        >
          <ChevronsLeftIcon />
        </button>
        <button
          type="button"
          className="button ghost"
          disabled={isFirst || disabled}
          onClick={() => goTo(page - 1)}
        >
          <ChevronLeftIcon /> Previous
        </button>

        {/* key resets the uncontrolled input whenever the page changes elsewhere. */}
        <form className="pager-jump" onSubmit={handleJump} key={page}>
          <label>
            Page{' '}
            <input
              name="page"
              type="number"
              min={1}
              max={pageCount}
              defaultValue={page + 1}
              disabled={disabled || pageCount === 1}
              onBlur={(event) => event.currentTarget.form?.requestSubmit()}
              aria-label={`Page number, 1 to ${pageCount}`}
            />
          </label>{' '}
          of {pageCount.toLocaleString()}
        </form>

        <button
          type="button"
          className="button ghost"
          disabled={isLast || disabled}
          onClick={() => goTo(page + 1)}
        >
          Next <ChevronRightIcon />
        </button>
        <button
          type="button"
          className="button ghost icon-only"
          disabled={isLast || disabled}
          onClick={() => goTo(pageCount - 1)}
          title="Last page"
          aria-label="Last page"
        >
          <ChevronsRightIcon />
        </button>
      </div>
    </nav>
  )
}
