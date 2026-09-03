import { lazy, Suspense, type ReactNode } from 'react'

import { LoadingState } from '../../../shared/components/LoadingState'

const ProductCreatePage = lazy(async () => {
  const page = await import('./ProductCreatePage')
  return { default: page.ProductCreatePage }
})

const ProductDetailsPage = lazy(async () => {
  const page = await import('./ProductDetailsPage')
  return { default: page.ProductDetailsPage }
})

const ProductEditPage = lazy(async () => {
  const page = await import('./ProductEditPage')
  return { default: page.ProductEditPage }
})

function RouteLoadingBoundary({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<LoadingState message="Carregando página..." />}>
      {children}
    </Suspense>
  )
}

export function ProductCreateRoute() {
  return (
    <RouteLoadingBoundary>
      <ProductCreatePage />
    </RouteLoadingBoundary>
  )
}

export function ProductDetailsRoute() {
  return (
    <RouteLoadingBoundary>
      <ProductDetailsPage />
    </RouteLoadingBoundary>
  )
}

export function ProductEditRoute() {
  return (
    <RouteLoadingBoundary>
      <ProductEditPage />
    </RouteLoadingBoundary>
  )
}
