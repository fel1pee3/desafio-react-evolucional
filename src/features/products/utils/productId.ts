export function parseProductId(value: string | undefined) {
  if (!value || !/^\d+$/.test(value)) {
    return null
  }

  const productId = Number(value)

  return Number.isSafeInteger(productId) && productId > 0 ? productId : null
}
