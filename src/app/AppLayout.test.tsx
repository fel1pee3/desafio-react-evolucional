import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '../test/renderWithProviders'
import { AppLayout } from './AppLayout'

describe('AppLayout', () => {
  it('renders the application navigation and current route content', () => {
    renderWithProviders(
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<h1>Conteúdo da rota</h1>} />
        </Route>
      </Routes>,
    )

    expect(
      screen.getByRole('navigation', { name: 'Navegação principal' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Conteúdo da rota' }),
    ).toBeInTheDocument()
  })
})
