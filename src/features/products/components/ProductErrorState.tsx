import { Link } from 'react-router-dom'

import { Alert } from '../../../shared/components/Alert'

type ProductErrorStateProps = {
  title: string
  message: string
  returnPath: string
  onRetry?: () => void
}

export function ProductErrorState({
  title,
  message,
  returnPath,
  onRetry,
}: ProductErrorStateProps) {
  return (
    <section className="product-page">
      <Alert
        title={title}
        tone="error"
        action={
          <div className="inline-actions">
            {onRetry ? (
              <button
                className="button button--secondary"
                type="button"
                onClick={onRetry}
              >
                Tentar novamente
              </button>
            ) : null}
            <Link className="button button--secondary" to={returnPath}>
              Voltar aos produtos
            </Link>
          </div>
        }
      >
        <p>{message}</p>
      </Alert>
    </section>
  )
}
