type LoadingStateProps = {
  message?: string
}

export function LoadingState({
  message = 'Carregando informações...',
}: LoadingStateProps) {
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <span className="loading-state__spinner" aria-hidden="true" />
      <span>{message}</span>
    </div>
  )
}
