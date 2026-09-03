import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '../../../test/renderWithProviders'
import type { PaginatedResult, Product } from '../types/product'
import { ProductListContent } from './ProductListContent'

const product: Product = {
  id: 1,
  name: 'Teclado Mecanico TKL',
  category: 'Perifericos',
  price: 349.9,
  stock: 15,
  active: true,
}

const result: PaginatedResult<Product> = {
  items: [product],
  totalCount: 1,
}

const defaultProps = {
  page: 1,
  pageSize: 10,
  hasActiveFilters: false,
  isPending: false,
  isUpdating: false,
  isError: false,
  onRetry: vi.fn(),
  onPageChange: vi.fn(),
}

describe('ProductListContent', () => {
  it('shows an accessible initial loading state', () => {
    renderWithProviders(
      <ProductListContent {...defaultProps} isPending result={undefined} />,
    )

    expect(screen.getByRole('status')).toHaveTextContent(
      'Carregando produtos...',
    )
  })

  it('hides stale results and allows retrying after an error', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    renderWithProviders(
      <ProductListContent
        {...defaultProps}
        result={result}
        isError
        errorMessage="API indisponível."
        onRetry={onRetry}
      />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('API indisponível.')
    expect(screen.queryByText(product.name)).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('distinguishes an empty filtered result', () => {
    renderWithProviders(
      <ProductListContent
        {...defaultProps}
        result={{ items: [], totalCount: 0 }}
        hasActiveFilters
      />,
    )

    expect(
      screen.getByRole('heading', { name: 'Nenhum resultado encontrado' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Novo produto' }),
    ).not.toBeInTheDocument()
  })

  it('does not present a stale empty state while results are updating', () => {
    renderWithProviders(
      <ProductListContent
        {...defaultProps}
        result={{ items: [], totalCount: 0 }}
        isUpdating
      />,
    )

    expect(screen.getByRole('status')).toHaveTextContent(
      'Atualizando resultados...',
    )
    expect(
      screen.queryByRole('heading', { name: 'Nenhum produto cadastrado' }),
    ).not.toBeInTheDocument()
  })
})
