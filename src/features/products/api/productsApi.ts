import axios, {
  type AxiosRequestConfig,
  type AxiosResponse,
  type Method,
} from 'axios'
import {
  mapCreateProductDataToApiDto,
  mapProductApiDtoToProduct,
  mapUpdateProductDataToApiDto,
} from '../mappers/productMapper'
import type {
  CreateProductData,
  PaginatedResult,
  Product,
  ProductListParams,
  UpdateProductData,
} from '../types/product'
import { ApiError } from './ApiError'
import {
  productApiResponseSchema,
  productsApiResponseSchema,
} from './productApiSchema'

const DEFAULT_API_BASE_URL = 'http://localhost:3001'

const apiBaseUrl = normalizeBaseUrl(
  import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL,
)

const productsHttpClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    Accept: 'application/json',
  },
  validateStatus: () => true,
})

type ApiRequestOptions = {
  method: Method
  url: string
  params?: URLSearchParams
  data?: unknown
  signal?: AbortSignal
}

export async function getProducts(
  params: ProductListParams,
  signal?: AbortSignal,
): Promise<PaginatedResult<Product>> {
  const response = await request({
    method: 'GET',
    url: '/produtos',
    params: buildProductListSearchParams(params),
    signal,
  })
  const parsedProducts = productsApiResponseSchema.safeParse(response.data)

  if (!parsedProducts.success) {
    throw createInvalidResponseError(parsedProducts.error)
  }

  return {
    items: parsedProducts.data.map(mapProductApiDtoToProduct),
    totalCount: readTotalCount(response),
  }
}

export async function getProductById(
  productId: number,
  signal?: AbortSignal,
): Promise<Product> {
  assertValidProductId(productId)

  const response = await request({
    method: 'GET',
    url: `/produtos/${productId}`,
    signal,
  })

  return parseProduct(response.data)
}

export async function createProduct(
  product: CreateProductData,
): Promise<Product> {
  const response = await request({
    method: 'POST',
    url: '/produtos',
    data: mapCreateProductDataToApiDto(product),
  })

  return parseProduct(response.data)
}

export async function updateProduct(
  productId: number,
  product: UpdateProductData,
): Promise<Product> {
  assertValidProductId(productId)

  const response = await request({
    method: 'PUT',
    url: `/produtos/${productId}`,
    data: mapUpdateProductDataToApiDto(product),
  })

  return parseProduct(response.data)
}

export async function deleteProduct(productId: number): Promise<void> {
  assertValidProductId(productId)

  await request({
    method: 'DELETE',
    url: `/produtos/${productId}`,
  })
}

export function buildProductListSearchParams({
  page,
  pageSize,
  search,
  category,
}: ProductListParams): URLSearchParams {
  assertPositiveInteger(page, 'A página deve ser um número inteiro positivo.')
  assertPositiveInteger(
    pageSize,
    'O tamanho da página deve ser um número inteiro positivo.',
  )

  const searchParams = new URLSearchParams({
    _page: String(page),
    _limit: String(pageSize),
  })
  const normalizedSearch = search?.trim()

  if (normalizedSearch) {
    searchParams.set('nome_like', normalizedSearch)
  }

  if (category) {
    searchParams.set('categoria', category)
  }

  return searchParams
}

async function request(
  options: ApiRequestOptions,
): Promise<AxiosResponse<unknown>> {
  const config: AxiosRequestConfig = {
    method: options.method,
    url: options.url,
    params: options.params,
    data: options.data,
    signal: options.signal,
  }

  try {
    const response = await productsHttpClient.request<unknown>(config)

    if (response.status < 200 || response.status >= 300) {
      throw new ApiError({
        message:
          readErrorMessage(response.data) ??
          `Não foi possível concluir a requisição (HTTP ${response.status}).`,
        code: 'HTTP_ERROR',
        status: response.status,
      })
    }

    return response
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw error
    }

    if (axios.isCancel(error)) {
      throw new ApiError({
        message: 'A requisição foi cancelada.',
        code: 'REQUEST_CANCELLED',
        cause: error,
      })
    }

    if (axios.isAxiosError(error)) {
      throw new ApiError({
        message:
          readErrorMessage(error.response?.data) ??
          'Não foi possível conectar à API de produtos.',
        code: 'NETWORK_ERROR',
        status: error.response?.status,
        cause: error,
      })
    }

    throw new ApiError({
      message: 'Ocorreu um erro inesperado ao acessar a API de produtos.',
      code: 'NETWORK_ERROR',
      cause: error,
    })
  }
}

function normalizeBaseUrl(value: string): string {
  const normalizedValue = value.trim().replace(/\/+$/, '')

  return normalizedValue || DEFAULT_API_BASE_URL
}

function parseProduct(data: unknown): Product {
  const parsedProduct = productApiResponseSchema.safeParse(data)

  if (!parsedProduct.success) {
    throw createInvalidResponseError(parsedProduct.error)
  }

  return mapProductApiDtoToProduct(parsedProduct.data)
}

function readTotalCount(response: AxiosResponse<unknown>): number {
  const rawHeaderValue = response.headers['x-total-count']
  const headerValue = Array.isArray(rawHeaderValue)
    ? rawHeaderValue[0]
    : rawHeaderValue
  const totalCount = Number(headerValue)

  if (!Number.isInteger(totalCount) || totalCount < 0) {
    throw createInvalidResponseError(
      new Error('O header X-Total-Count está ausente ou é inválido.'),
    )
  }

  return totalCount
}

function readErrorMessage(data: unknown): string | undefined {
  if (typeof data !== 'object' || data === null) {
    return undefined
  }

  if ('message' in data && typeof data.message === 'string') {
    return data.message
  }

  if ('error' in data && typeof data.error === 'string') {
    return data.error
  }

  return undefined
}

function createInvalidResponseError(cause: unknown): ApiError {
  return new ApiError({
    message: 'A API retornou dados em um formato inesperado.',
    code: 'INVALID_RESPONSE',
    cause,
  })
}

function assertValidProductId(productId: number): void {
  assertPositiveInteger(productId, 'O identificador do produto é inválido.')
}

function assertPositiveInteger(value: number, message: string): void {
  if (!Number.isInteger(value) || value < 1) {
    throw new ApiError({
      message,
      code: 'INVALID_REQUEST',
    })
  }
}
