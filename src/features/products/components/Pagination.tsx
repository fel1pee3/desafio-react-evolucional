type PaginationProps = {
  page: number
  pageSize: number
  totalCount: number
  disabled?: boolean
  onPageChange: (page: number) => void
}

export function Pagination({
  page,
  pageSize,
  totalCount,
  disabled = false,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  return (
    <nav className="pagination" aria-label="Paginação de produtos">
      <button
        className="pagination__button"
        type="button"
        disabled={disabled || page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Anterior
      </button>
      <span className="pagination__summary" aria-live="polite">
        Página <strong>{page}</strong> de <strong>{totalPages}</strong>
      </span>
      <button
        className="pagination__button"
        type="button"
        disabled={disabled || page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Próxima
      </button>
    </nav>
  )
}
