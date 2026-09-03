type ProductStatusBadgeProps = {
  active: boolean
}

export function ProductStatusBadge({ active }: ProductStatusBadgeProps) {
  return (
    <span className={`status-badge status-badge--${active ? 'active' : 'inactive'}`}>
      <span className="status-badge__dot" aria-hidden="true" />
      {active ? 'Ativo' : 'Inativo'}
    </span>
  )
}
