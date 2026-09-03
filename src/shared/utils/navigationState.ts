type NavigationState = {
  from?: string
  successMessage?: string
}

function isNavigationState(value: unknown): value is NavigationState {
  return typeof value === 'object' && value !== null
}

export function getProductReturnPath(state: unknown) {
  if (
    isNavigationState(state) &&
    typeof state.from === 'string' &&
    (state.from === '/products' || state.from.startsWith('/products?'))
  ) {
    return state.from
  }

  return '/products'
}

export function getSuccessMessage(state: unknown) {
  if (
    isNavigationState(state) &&
    typeof state.successMessage === 'string'
  ) {
    return state.successMessage
  }

  return null
}
