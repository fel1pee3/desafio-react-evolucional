import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '../../../test/renderWithProviders'
import { useProductFilters } from './useProductFilters'

function ProductFiltersHarness() {
  const filters = useProductFilters()
  const location = useLocation()

  return (
    <div>
      <span>page:{filters.page}</span>
      <span>search:{filters.search}</span>
      <span>category:{filters.category ?? 'none'}</span>
      <span>url:{location.search}</span>
      <button type="button" onClick={() => filters.setSearch('teclado')}>
        Buscar teclado
      </button>
    </div>
  )
}

describe('useProductFilters', () => {
  it('restores filters from the URL and resets the page after a search change', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProductFiltersHarness />, {
      initialEntries: [
        '/products?page=2&search=monitor&category=Monitores',
      ],
    })

    expect(screen.getByText('page:2')).toBeInTheDocument()
    expect(screen.getByText('search:monitor')).toBeInTheDocument()
    expect(screen.getByText('category:Monitores')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Buscar teclado' }))

    expect(screen.getByText('page:1')).toBeInTheDocument()
    expect(
      screen.getByText('url:?search=teclado&category=Monitores'),
    ).toBeInTheDocument()
  })

  it('normalizes invalid page and category values', async () => {
    renderWithProviders(<ProductFiltersHarness />, {
      initialEntries: ['/products?page=-2&category=Desconhecida'],
    })

    await waitFor(() => {
      expect(screen.getByText('url:')).toBeInTheDocument()
    })
    expect(screen.getByText('page:1')).toBeInTheDocument()
    expect(screen.getByText('category:none')).toBeInTheDocument()
  })
})
