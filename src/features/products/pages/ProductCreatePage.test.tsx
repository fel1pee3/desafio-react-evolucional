import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderWithProviders } from '../../../test/renderWithProviders'
import { ProductCreatePage } from './ProductCreatePage'

const createMocks = vi.hoisted(() => ({
  useCreateProductMutation: vi.fn(),
  mutateAsync: vi.fn(),
}))

vi.mock('../api/productQueries', () => ({
  useCreateProductMutation: createMocks.useCreateProductMutation,
}))

function LocationProbe() {
  const location = useLocation()

  return (
    <output data-testid="location">
      {JSON.stringify({ pathname: location.pathname, state: location.state })}
    </output>
  )
}

function renderPage() {
  return renderWithProviders(
    <Routes>
      <Route path="/products/new" element={<ProductCreatePage />} />
      <Route path="/products/:productId" element={<LocationProbe />} />
    </Routes>,
    {
      initialEntries: [
        {
          pathname: '/products/new',
          state: { from: '/products?page=2&category=Audio' },
        },
      ],
    },
  )
}

describe('ProductCreatePage', () => {
  beforeEach(() => {
    createMocks.mutateAsync.mockReset()
    createMocks.useCreateProductMutation.mockReturnValue({
      mutateAsync: createMocks.mutateAsync,
      isPending: false,
      error: null,
    })
  })

  it('creates a product and navigates to its details with success feedback', async () => {
    const user = userEvent.setup()
    createMocks.mutateAsync.mockResolvedValue({ id: 41 })
    renderPage()

    await user.type(screen.getByLabelText('Nome'), 'Headset Studio')
    await user.selectOptions(screen.getByLabelText('Categoria'), 'Audio')
    await user.type(screen.getByLabelText('Preço'), '499.90')
    await user.type(screen.getByLabelText('Estoque'), '6')
    await user.click(screen.getByRole('button', { name: 'Cadastrar produto' }))

    expect(createMocks.mutateAsync).toHaveBeenCalledWith({
      name: 'Headset Studio',
      category: 'Audio',
      price: 499.9,
      stock: 6,
      active: true,
    })
    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent(
        '"pathname":"/products/41"',
      )
    })
    expect(screen.getByTestId('location')).toHaveTextContent(
      '"from":"/products?page=2&category=Audio"',
    )
    expect(screen.getByTestId('location')).toHaveTextContent(
      '"successMessage":"Produto criado com sucesso."',
    )
  })

  it('shows a mutation error without navigating away', () => {
    createMocks.useCreateProductMutation.mockReturnValue({
      mutateAsync: createMocks.mutateAsync,
      isPending: false,
      error: { message: 'Falha ao cadastrar produto.' },
    })
    renderPage()

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Falha ao cadastrar produto.',
    )
    expect(screen.getByRole('heading', { name: 'Novo produto' })).toBeVisible()
  })
})
