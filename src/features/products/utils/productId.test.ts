import { describe, expect, it } from 'vitest'

import { parseProductId } from './productId'

describe('parseProductId', () => {
  it('accepts positive safe integer identifiers', () => {
    expect(parseProductId('1')).toBe(1)
    expect(parseProductId('42')).toBe(42)
  })

  it.each([undefined, '', '0', '-1', '1.5', 'abc', '9007199254740992'])(
    'rejects invalid identifier %s',
    (value) => {
      expect(parseProductId(value)).toBeNull()
    },
  )
})
