import type { ProductListParams } from '../types/product'

export const productQueryKeys = {
  all: ['products'] as const,
  lists: () => [...productQueryKeys.all, 'list'] as const,
  list: ({ page, pageSize, search, category }: ProductListParams) =>
    [
      ...productQueryKeys.lists(),
      page,
      pageSize,
      search?.trim() ?? '',
      category ?? '',
    ] as const,
  details: () => [...productQueryKeys.all, 'detail'] as const,
  detail: (productId: number | null) =>
    [...productQueryKeys.details(), productId] as const,
  mutations: () => [...productQueryKeys.all, 'mutation'] as const,
  create: () => [...productQueryKeys.mutations(), 'create'] as const,
  update: () => [...productQueryKeys.mutations(), 'update'] as const,
  delete: () => [...productQueryKeys.mutations(), 'delete'] as const,
}
