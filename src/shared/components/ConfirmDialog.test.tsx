import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ConfirmDialog } from './ConfirmDialog'

describe('ConfirmDialog', () => {
  it('identifies the product and confirms deletion once', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()

    render(
      <ConfirmDialog
        isOpen
        title="Excluir produto?"
        description="O produto “Mouse sem fio” será excluído permanentemente."
        isConfirming={false}
        onCancel={vi.fn()}
        onConfirm={onConfirm}
      />,
    )

    const dialog = screen.getByRole('dialog', { name: 'Excluir produto?' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveTextContent('Mouse sem fio')

    await user.click(screen.getByRole('button', { name: 'Excluir' }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('closes through Cancel and Escape', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()

    render(
      <ConfirmDialog
        isOpen
        title="Excluir produto?"
        description="Confirme a exclusão."
        isConfirming={false}
        onCancel={onCancel}
        onConfirm={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    await user.keyboard('{Escape}')
    expect(onCancel).toHaveBeenCalledTimes(2)
  })

  it('blocks repeated actions and exposes an API error while confirming', () => {
    const onCancel = vi.fn()
    const onConfirm = vi.fn()

    render(
      <ConfirmDialog
        isOpen
        title="Excluir produto?"
        description="Confirme a exclusão."
        isConfirming
        errorMessage="Falha ao excluir."
        onCancel={onCancel}
        onConfirm={onConfirm}
      />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('Falha ao excluir.')
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Excluindo…' })).toBeDisabled()
  })

  it('keeps keyboard focus inside the dialog and restores it after closing', async () => {
    const user = userEvent.setup()
    const trigger = document.createElement('button')
    trigger.textContent = 'Abrir exclusão'
    document.body.append(trigger)
    trigger.focus()

    const { rerender } = render(
      <ConfirmDialog
        isOpen
        title="Excluir produto?"
        description="Confirme a exclusão."
        isConfirming={false}
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />,
    )

    const cancelButton = screen.getByRole('button', { name: 'Cancelar' })
    const confirmButton = screen.getByRole('button', { name: 'Excluir' })

    await waitFor(() => expect(cancelButton).toHaveFocus())
    await user.tab()
    expect(confirmButton).toHaveFocus()
    await user.tab()
    expect(cancelButton).toHaveFocus()

    rerender(
      <ConfirmDialog
        isOpen={false}
        title="Excluir produto?"
        description="Confirme a exclusão."
        isConfirming={false}
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />,
    )

    expect(trigger).toHaveFocus()
    trigger.remove()
  })

  it('does not close with Escape while deletion is pending', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()

    render(
      <ConfirmDialog
        isOpen
        title="Excluir produto?"
        description="Confirme a exclusão."
        isConfirming
        onCancel={onCancel}
        onConfirm={vi.fn()}
      />,
    )

    await user.keyboard('{Escape}')
    expect(onCancel).not.toHaveBeenCalled()
  })
})
