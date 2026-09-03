import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderWithProviders } from '../../../test/renderWithProviders'
import type { Product } from '../types/product'
import { ProductEditPage } from './ProductEditPage'

const editMocks = vi.hoisted(() => ({
  useProductQuery: vi.fn(),
  useUpdateProductMutation: vi.fn(),
  mutateAsync: vi.fn(),
}))

vi.mock('../api/productQueries', () => ({
  useProductQuery: editMocks.useProductQuery,
  useUpdateProductMutation: editMocks.useUpdateProductMutation,
}))

const product: Product = {
  id: 12,
  name: 'Monitor UltraWide',
  category: 'Monitores',
  price: 1899.9,
  stock: 4,
  active: true,
}

function LocationProbe() {
  const location = useLocation()
  return <output data-testid="location">{JSON.stringify(location)}</output>
}

function renderPage() {
  return renderWithProviders(
    <Routes>
      <Route path="/products/:productId/edit" element={<ProductEditPage />} />
      <Route path="/products/:productId" element={<LocationProbe />} />
    </Routes>,
    {
      initialEntries: [
        {
          pathname: '/products/12/edit',
          state: { from: '/products?page=2&search=monitor' },
        },
      ],
    },
  )
}

describe('ProductEditPage', () => {
  beforeEach(() => {
    editMocks.mutateAsync.mockReset()
    editMocks.useProductQuery.mockReturnValue({
      isPending: false,
      isError: false,
      data: product,
    })
    editMocks.useUpdateProductMutation.mockReturnValue({
      mutateAsync: editMocks.mutateAsync,
      isPending: false,
      error: null,
    })
  })

  it('loads existing values, updates with PUT data and navigates to details', async () => {
    const user = userEvent.setup()
    editMocks.mutateAsync.mockResolvedValue({
      ...product,
      name: 'Monitor Curvo UltraWide',
    })
    renderPage()

    expect(screen.getByLabelText('Nome')).toHaveValue('Monitor UltraWide')
    expect(screen.getByLabelText('Categoria')).toHaveValue('Monitores')
    expect(screen.getByLabelText('Preço')).toHaveValue(1899.9)

    await user.clear(screen.getByLabelText('Nome'))
    await user.type(screen.getByLabelText('Nome'), 'Monitor Curvo UltraWide')
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }))

    expect(editMocks.mutateAsync).toHaveBeenCalledWith({
      productId: 12,
      data: {
        name: 'Monitor Curvo UltraWide',
        category: 'Monitores',
        price: 1899.9,
        stock: 4,
        active: true,
      },
    })
    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent(
        '"pathname":"/products/12"',
      )
    })
    expect(screen.getByTestId('location')).toHaveTextContent(
      '"successMessage":"Produto atualizado com sucesso."',
    )
  })

  it('shows loading without rendering stale form values', () => {
    editMocks.useProductQuery.mockReturnValue({ isPending: true })
    renderPage()

    expect(screen.getByRole('status')).toHaveTextContent('Carregando produto...')
    expect(screen.queryByLabelText('Nome')).not.toBeInTheDocument()
  })

  it('rejects an unknown category before rendering the edit form', () => {
    editMocks.useProductQuery.mockReturnValue({
      isPending: false,
      isError: false,
      data: { ...product, category: 'Categoria externa' },
    })
    renderPage()

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Este produto possui uma categoria que não pode ser editada',
    )
    expect(screen.queryByLabelText('Nome')).not.toBeInTheDocument()
  })
})
