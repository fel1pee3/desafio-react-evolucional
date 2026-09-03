import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Pagination } from './Pagination'

describe('Pagination', () => {
  it('announces the current page and changes pages through its controls', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()

    render(
      <Pagination
        page={2}
        pageSize={10}
        totalCount={25}
        onPageChange={onPageChange}
      />,
    )

    expect(screen.getByRole('navigation')).toHaveAccessibleName(
      'Paginação de produtos',
    )
    expect(
      screen.getByText(/Página/, { selector: '.pagination__summary' }),
    ).toHaveTextContent('Página 2 de 3')

    await user.click(screen.getByRole('button', { name: 'Anterior' }))
    await user.click(screen.getByRole('button', { name: 'Próxima' }))

    expect(onPageChange).toHaveBeenNthCalledWith(1, 1)
    expect(onPageChange).toHaveBeenNthCalledWith(2, 3)
  })

  it('disables unavailable or temporarily blocked navigation', () => {
    const { rerender } = render(
      <Pagination
        page={1}
        pageSize={10}
        totalCount={5}
        onPageChange={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Próxima' })).toBeDisabled()

    rerender(
      <Pagination
        page={2}
        pageSize={10}
        totalCount={30}
        disabled
        onPageChange={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Próxima' })).toBeDisabled()
  })
})
