import { Link } from 'react-router-dom'
import { Alert } from '../../../shared/components/Alert'
import { EmptyState } from '../../../shared/components/EmptyState'
import { LoadingState } from '../../../shared/components/LoadingState'
import type { PaginatedResult, Product } from '../types/product'
import { Pagination } from './Pagination'
import { ProductTable } from './ProductTable'

type ProductListContentProps = {
  result?: PaginatedResult<Product>
  page: number
  pageSize: number
  hasActiveFilters: boolean
  isPending: boolean
  isUpdating: boolean
  isError: boolean
  errorMessage?: string
  onRetry: () => void
  onPageChange: (page: number) => void
}

export function ProductListContent({
  result,
  page,
  pageSize,
  hasActiveFilters,
  isPending,
  isUpdating,
  isError,
  errorMessage,
  onRetry,
  onPageChange,
}: ProductListContentProps) {
  if (isPending) {
    return <LoadingState message="Carregando produtos..." />
  }

  if (isError) {
    return (
      <Alert
        title="Não foi possível carregar os produtos"
        tone="error"
        action={
          <button className="button button--secondary" type="button" onClick={onRetry}>
            Tentar novamente
          </button>
        }
      >
        <p>
          {errorMessage ??
            'Verifique se a API está disponível e tente novamente.'}
        </p>
      </Alert>
    )
  }

  if (!result) {
    return <LoadingState message="Preparando resultados..." />
  }

  if (result.items.length === 0 && isUpdating) {
    return <LoadingState message="Atualizando resultados..." />
  }

  if (result.items.length === 0) {
    return hasActiveFilters ? (
      <EmptyState
        title="Nenhum resultado encontrado"
        description="Tente usar outro termo de busca ou selecionar uma categoria diferente."
      />
    ) : (
      <EmptyState
        title="Nenhum produto cadastrado"
        description="Cadastre o primeiro produto para começar a organizar o catálogo."
        action={
          <Link className="button button--primary" to="/products/new">
            Novo produto
          </Link>
        }
      />
    )
  }

  return (
    <div className="product-results" aria-busy={isUpdating}>
      <div className="product-results__summary">
        <p>
          <strong>{result.totalCount}</strong>{' '}
          {result.totalCount === 1
            ? 'produto encontrado'
            : 'produtos encontrados'}
        </p>
        {isUpdating ? (
          <span className="update-status" role="status" aria-live="polite">
            <span className="update-status__dot" aria-hidden="true" />
            Atualizando resultados...
          </span>
        ) : null}
      </div>

      <ProductTable products={result.items} />
      <Pagination
        page={page}
        pageSize={pageSize}
        totalCount={result.totalCount}
        disabled={isUpdating}
        onPageChange={onPageChange}
      />
    </div>
  )
}
