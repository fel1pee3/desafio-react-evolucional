import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderWithProviders } from '../../../test/renderWithProviders'
import type { Product } from '../types/product'
import { ProductDetailsPage } from './ProductDetailsPage'

const detailsMocks = vi.hoisted(() => ({
  useProductQuery: vi.fn(),
  useDeleteProductMutation: vi.fn(),
  mutateAsync: vi.fn(),
  reset: vi.fn(),
  refetch: vi.fn(),
}))

vi.mock('../api/productQueries', () => ({
  useProductQuery: detailsMocks.useProductQuery,
  useDeleteProductMutation: detailsMocks.useDeleteProductMutation,
}))

const product: Product = {
  id: 7,
  name: 'Caixa de som Bluetooth',
  category: 'Audio',
  price: 219.9,
  stock: 0,
  active: false,
}

function LocationProbe() {
  const location = useLocation()
  return <output data-testid="location">{JSON.stringify(location)}</output>
}

function renderPage(pathname = '/products/7') {
  return renderWithProviders(
    <Routes>
      <Route path="/products/:productId" element={<ProductDetailsPage />} />
      <Route path="/products" element={<LocationProbe />} />
    </Routes>,
    {
      initialEntries: [
        {
          pathname,
          state: { from: '/products?page=2&category=Audio' },
        },
      ],
    },
  )
}

describe('ProductDetailsPage', () => {
  beforeEach(() => {
    detailsMocks.mutateAsync.mockReset()
    detailsMocks.reset.mockReset()
    detailsMocks.refetch.mockReset()
    detailsMocks.useProductQuery.mockReturnValue({
      isPending: false,
      isError: false,
      data: product,
    })
    detailsMocks.useDeleteProductMutation.mockReturnValue({
      mutateAsync: detailsMocks.mutateAsync,
      reset: detailsMocks.reset,
      isPending: false,
      error: null,
    })
  })

  it('shows mapped product information and returns to the filtered list', () => {
    renderPage()

    expect(screen.getByRole('heading', { name: product.name })).toBeVisible()
    expect(screen.getByText('Áudio')).toBeVisible()
    expect(screen.getByText('R$ 219,90')).toBeVisible()
    expect(screen.getByText('0 unidade(s)')).toBeVisible()
    expect(screen.getByText('Inativo')).toBeVisible()
    expect(screen.getByRole('link', { name: 'Voltar' })).toHaveAttribute(
      'href',
      '/products?page=2&category=Audio',
    )
  })

  it('confirms deletion and returns to the list with success feedback', async () => {
    const user = userEvent.setup()
    detailsMocks.mutateAsync.mockResolvedValue(undefined)
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Excluir produto' }))
    expect(screen.getByRole('dialog')).toHaveTextContent(product.name)
    await user.click(screen.getByRole('button', { name: 'Excluir' }))

    expect(detailsMocks.mutateAsync).toHaveBeenCalledWith(7)
    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent(
        '"pathname":"/products"',
      )
    })
    expect(screen.getByTestId('location')).toHaveTextContent(
      '"search":"?page=2&category=Audio"',
    )
    expect(screen.getByTestId('location')).toHaveTextContent(
      '"successMessage":"Produto excluído com sucesso."',
    )
  })

  it('handles an invalid product identifier without querying the API', () => {
    renderPage('/products/id-invalido')

    expect(screen.getByRole('alert')).toHaveTextContent('Produto inválido')
    expect(detailsMocks.useProductQuery).toHaveBeenCalledWith(null)
  })

  it('distinguishes a missing product from a recoverable API error', () => {
    detailsMocks.useProductQuery.mockReturnValue({
      isPending: false,
      isError: true,
      error: { status: 404, message: 'Produto não encontrado.' },
    })
    renderPage('/products/999')

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Produto não encontrado',
    )
    expect(
      screen.queryByRole('button', { name: 'Tentar novamente' }),
    ).not.toBeInTheDocument()
  })

  it('offers retry for a recoverable API error', async () => {
    const user = userEvent.setup()
    detailsMocks.useProductQuery.mockReturnValue({
      isPending: false,
      isError: true,
      error: { status: 500, message: 'API indisponível.' },
      refetch: detailsMocks.refetch,
    })
    renderPage()

    expect(screen.getByRole('alert')).toHaveTextContent('API indisponível.')
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    expect(detailsMocks.refetch).toHaveBeenCalledOnce()
  })
})
