import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  CreateProductData,
  PaginatedResult,
  Product,
  ProductListParams,
  UpdateProductVariables,
} from '../types/product'
import { ApiError } from './ApiError'
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from './productsApi'
import { productQueryKeys } from './productQueryKeys'

export function useProductsQuery(params: ProductListParams) {
  return useQuery<PaginatedResult<Product>, ApiError>({
    queryKey: productQueryKeys.list(params),
    queryFn: ({ signal }) => getProducts(params, signal),
  })
}

export function useProductQuery(productId: number | null) {
  return useQuery<Product, ApiError>({
    queryKey: productQueryKeys.detail(productId),
    queryFn: ({ signal }) => {
      if (productId === null) {
        throw new ApiError({
          message: 'O identificador do produto é inválido.',
          code: 'INVALID_REQUEST',
        })
      }

      return getProductById(productId, signal)
    },
    enabled: productId !== null,
  })
}

export function useCreateProductMutation() {
  const queryClient = useQueryClient()

  return useMutation<Product, ApiError, CreateProductData>({
    mutationKey: productQueryKeys.create(),
    mutationFn: createProduct,
    onSuccess: async (product) => {
      queryClient.setQueryData(productQueryKeys.detail(product.id), product)
      await queryClient.invalidateQueries({
        queryKey: productQueryKeys.lists(),
      })
    },
  })
}

export function useUpdateProductMutation() {
  const queryClient = useQueryClient()

  return useMutation<Product, ApiError, UpdateProductVariables>({
    mutationKey: productQueryKeys.update(),
    mutationFn: ({ productId, data }) => updateProduct(productId, data),
    onSuccess: async (product) => {
      queryClient.setQueryData(productQueryKeys.detail(product.id), product)
      await queryClient.invalidateQueries({
        queryKey: productQueryKeys.lists(),
      })
    },
  })
}

export function useDeleteProductMutation() {
  const queryClient = useQueryClient()

  return useMutation<void, ApiError, number>({
    mutationKey: productQueryKeys.delete(),
    mutationFn: deleteProduct,
    onSuccess: async (_, productId) => {
      queryClient.removeQueries({
        queryKey: productQueryKeys.detail(productId),
      })
      await queryClient.invalidateQueries({
        queryKey: productQueryKeys.lists(),
      })
    },
  })
}
