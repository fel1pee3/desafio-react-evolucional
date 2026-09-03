import { describe, expect, it } from 'vitest'

import { getProductReturnPath, getSuccessMessage } from './navigationState'

describe('navigationState', () => {
  it('preserves only safe product list return paths', () => {
    expect(
      getProductReturnPath({
        from: '/products?page=2&search=monitor&category=Monitores',
      }),
    ).toBe('/products?page=2&search=monitor&category=Monitores')
    expect(getProductReturnPath({ from: '/products/1' })).toBe('/products')
    expect(getProductReturnPath({ from: 'https://example.com' })).toBe(
      '/products',
    )
  })

  it('reads only string success messages', () => {
    expect(getSuccessMessage({ successMessage: 'Produto salvo.' })).toBe(
      'Produto salvo.',
    )
    expect(getSuccessMessage({ successMessage: 123 })).toBeNull()
    expect(getSuccessMessage(null)).toBeNull()
  })
})
