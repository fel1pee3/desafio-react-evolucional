import { QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createQueryClient } from '../../../app/queryClient'
import type { CreateProductData, Product } from '../types/product'
import { ApiError } from './ApiError'
import {
  useCreateProductMutation,
  useDeleteProductMutation,
  useProductQuery,
  useUpdateProductMutation,
} from './productQueries'
import { productQueryKeys } from './productQueryKeys'

const apiMocks = vi.hoisted(() => ({
  createProduct: vi.fn(),
  deleteProduct: vi.fn(),
  getProductById: vi.fn(),
  getProducts: vi.fn(),
  updateProduct: vi.fn(),
}))

vi.mock('./productsApi', () => apiMocks)

const product: Product = {
  id: 31,
  name: 'SSD NVMe 1TB',
  category: 'Armazenamento',
  price: 599.9,
  stock: 9,
  active: true,
}

const productData: CreateProductData = {
  name: product.name,
  category: product.category,
  price: product.price,
  stock: product.stock,
  active: product.active,
}

describe('productQueries', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('stores a created product and invalidates only product lists', async () => {
    const queryClient = createQueryClient()
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
    apiMocks.createProduct.mockResolvedValue(product)
    const { result } = renderHook(() => useCreateProductMutation(), {
      wrapper: createWrapper(queryClient),
    })

    await act(async () => {
      await result.current.mutateAsync(productData)
    })

    expect(queryClient.getQueryData(productQueryKeys.detail(31))).toEqual(
      product,
    )
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: productQueryKeys.lists(),
    })
  })

  it('replaces detail cache after updating a product', async () => {
    const queryClient = createQueryClient()
    const updatedProduct = { ...product, name: 'SSD NVMe 2TB' }
    apiMocks.updateProduct.mockResolvedValue(updatedProduct)
    queryClient.setQueryData(productQueryKeys.detail(31), product)
    const { result } = renderHook(() => useUpdateProductMutation(), {
      wrapper: createWrapper(queryClient),
    })

    await act(async () => {
      await result.current.mutateAsync({
        productId: 31,
        data: { ...productData, name: updatedProduct.name },
      })
    })

    expect(queryClient.getQueryData(productQueryKeys.detail(31))).toEqual(
      updatedProduct,
    )
  })

  it('removes deleted detail cache and invalidates product lists', async () => {
    const queryClient = createQueryClient()
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
    apiMocks.deleteProduct.mockResolvedValue(undefined)
    queryClient.setQueryData(productQueryKeys.detail(31), product)
    const { result } = renderHook(() => useDeleteProductMutation(), {
      wrapper: createWrapper(queryClient),
    })

    await act(async () => {
      await result.current.mutateAsync(31)
    })

    expect(queryClient.getQueryData(productQueryKeys.detail(31))).toBeUndefined()
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: productQueryKeys.lists(),
    })
  })

  it('does not retry a detail request that returned 404', async () => {
    const queryClient = createQueryClient()
    apiMocks.getProductById.mockRejectedValue(
      new ApiError({
        message: 'Produto não encontrado.',
        code: 'HTTP_ERROR',
        status: 404,
      }),
    )
    const { result } = renderHook(() => useProductQuery(999), {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(apiMocks.getProductById).toHaveBeenCalledOnce()
  })
})

function createWrapper(queryClient: ReturnType<typeof createQueryClient>) {
  return function QueryWrapper({ children }: PropsWithChildren) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }
}
