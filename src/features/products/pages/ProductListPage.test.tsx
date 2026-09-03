import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderWithProviders } from '../../../test/renderWithProviders'
import type { Product } from '../types/product'
import { ProductListPage } from './ProductListPage'

const listMocks = vi.hoisted(() => ({
  useProductsQuery: vi.fn(),
  useDeleteProductMutation: vi.fn(),
  useProductFilters: vi.fn(),
  mutateAsync: vi.fn(),
  reset: vi.fn(),
  refetch: vi.fn(),
  setPage: vi.fn(),
}))

vi.mock('../api/productQueries', () => ({
  useProductsQuery: listMocks.useProductsQuery,
  useDeleteProductMutation: listMocks.useDeleteProductMutation,
}))

vi.mock('../hooks/useProductFilters', () => ({
  useProductFilters: listMocks.useProductFilters,
}))

vi.mock('../hooks/useDebouncedValue', () => ({
  useDebouncedValue: (value: unknown) => value,
}))

vi.mock('../../../shared/hooks/useNavigationSuccessMessage', () => ({
  useNavigationSuccessMessage: () => null,
}))

const product: Product = {
  id: 21,
  name: 'Último produto da página',
  category: 'Componentes',
  price: 299.9,
  stock: 3,
  active: true,
}

describe('ProductListPage', () => {
  beforeEach(() => {
    listMocks.mutateAsync.mockReset()
    listMocks.reset.mockReset()
    listMocks.refetch.mockReset()
    listMocks.setPage.mockReset()
    listMocks.useProductFilters.mockReturnValue({
      page: 2,
      pageSize: 10,
      search: '',
      category: undefined,
      hasActiveFilters: false,
      setSearch: vi.fn(),
      clearSearch: vi.fn(),
      setCategory: vi.fn(),
      setPage: listMocks.setPage,
    })
    listMocks.useProductsQuery.mockReturnValue({
      data: { items: [product], totalCount: 11 },
      isPending: false,
      isFetching: false,
      isPlaceholderData: false,
      isSuccess: true,
      isError: false,
      error: null,
      refetch: listMocks.refetch,
    })
    listMocks.useDeleteProductMutation.mockReturnValue({
      mutateAsync: listMocks.mutateAsync,
      reset: listMocks.reset,
      isPending: false,
      error: null,
    })
  })

  it('deletes the last item and moves to the previous page', async () => {
    const user = userEvent.setup()
    listMocks.mutateAsync.mockResolvedValue(undefined)
    renderWithProviders(<ProductListPage />, {
      initialEntries: ['/products?page=2'],
    })

    await user.click(
      screen.getByRole('button', { name: `Excluir ${product.name}` }),
    )
    expect(listMocks.reset).toHaveBeenCalledOnce()
    expect(screen.getByRole('dialog')).toHaveTextContent(product.name)

    await user.click(screen.getByRole('button', { name: 'Excluir' }))

    expect(listMocks.mutateAsync).toHaveBeenCalledWith(product.id)
    await waitFor(() => expect(listMocks.setPage).toHaveBeenCalledWith(1))
    expect(screen.getByRole('status')).toHaveTextContent(
      `O produto “${product.name}” foi excluído com sucesso.`,
    )
  })
})
