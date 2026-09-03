import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useDebouncedValue } from './useDebouncedValue'

describe('useDebouncedValue', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('keeps the previous value before the delay finishes', () => {
    vi.useFakeTimers()
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 350),
      { initialProps: { value: 'teclado' } },
    )

    rerender({ value: 'monitor' })
    act(() => vi.advanceTimersByTime(349))

    expect(result.current).toBe('teclado')
  })

  it('publishes the latest value after the delay', () => {
    vi.useFakeTimers()
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 350),
      { initialProps: { value: 'teclado' } },
    )

    rerender({ value: 'monitor' })
    act(() => vi.advanceTimersByTime(350))

    expect(result.current).toBe('monitor')
  })
})
