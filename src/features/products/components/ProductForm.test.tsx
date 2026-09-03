import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { renderWithProviders } from '../../../test/renderWithProviders'
import { ProductForm } from './ProductForm'

function renderProductForm(onSubmit = vi.fn()) {
  renderWithProviders(
    <ProductForm
      submitLabel="Cadastrar produto"
      submittingLabel="Cadastrando…"
      isSaving={false}
      apiError={null}
      cancelTo="/products"
      onSubmit={onSubmit}
    />,
  )

  return onSubmit
}

describe('ProductForm', () => {
  it('shows validation messages next to all required fields', async () => {
    const user = userEvent.setup()
    const onSubmit = renderProductForm()

    await user.click(screen.getByRole('button', { name: 'Cadastrar produto' }))

    expect(await screen.findByText('Nome é obrigatório.')).toBeInTheDocument()
    expect(screen.getByText('Categoria é obrigatória.')).toBeInTheDocument()
    expect(screen.getByText('Preço é obrigatório.')).toBeInTheDocument()
    expect(screen.getByText('Estoque é obrigatório.')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('validates minimum name, positive price and nonnegative stock', async () => {
    const user = userEvent.setup()
    renderProductForm()

    await user.type(screen.getByLabelText('Nome'), 'AB')
    await user.selectOptions(screen.getByLabelText('Categoria'), 'Audio')
    await user.type(screen.getByLabelText('Preço'), '0')
    await user.type(screen.getByLabelText('Estoque'), '-1')
    await user.click(screen.getByRole('button', { name: 'Cadastrar produto' }))

    expect(
      await screen.findByText('Nome deve ter pelo menos 3 caracteres.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Preço deve ser maior que zero.')).toBeInTheDocument()
    expect(screen.getByText('Estoque não pode ser negativo.')).toBeInTheDocument()
  })

  it('submits normalized valid product data', async () => {
    const user = userEvent.setup()
    const onSubmit = renderProductForm(vi.fn().mockResolvedValue(undefined))

    await user.type(screen.getByLabelText('Nome'), '  Headset Pro  ')
    await user.selectOptions(screen.getByLabelText('Categoria'), 'Audio')
    await user.type(screen.getByLabelText('Preço'), '299.90')
    await user.type(screen.getByLabelText('Estoque'), '8')
    await user.click(screen.getByRole('button', { name: 'Cadastrar produto' }))

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Headset Pro',
      category: 'Audio',
      price: 299.9,
      stock: 8,
      active: true,
    })
  })

  it('disables fields and actions while saving and displays an API error', () => {
    renderWithProviders(
      <ProductForm
        submitLabel="Salvar alterações"
        submittingLabel="Salvando…"
        isSaving
        apiError="Não foi possível salvar o produto."
        cancelTo="/products/1"
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Não foi possível salvar o produto.',
    )
    expect(screen.getByLabelText('Nome')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Salvando…' })).toBeDisabled()
  })
})
