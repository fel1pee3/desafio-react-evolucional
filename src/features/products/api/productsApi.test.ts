import {
  AxiosHeaders,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { CreateProductData, ProductApiDto } from '../types/product'
import { ApiError } from './ApiError'
import {
  buildProductListSearchParams,
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from './productsApi'

const axiosMocks = vi.hoisted(() => ({
  request: vi.fn<
    (config: AxiosRequestConfig) => Promise<AxiosResponse<unknown>>
  >(),
}))

vi.mock('axios', async (importOriginal) => {
  const actualAxios = await importOriginal<typeof import('axios')>()

  return {
    ...actualAxios,
    default: {
      create: () => ({ request: axiosMocks.request }),
      isAxiosError: actualAxios.default.isAxiosError,
      isCancel: actualAxios.default.isCancel,
    },
  }
})

const apiProduct: ProductApiDto = {
  id: 1,
  nome: 'Teclado Mecanico TKL',
  categoria: 'Perifericos',
  preco: 349.9,
  estoque: 15,
  ativo: true,
}

describe('productsApi', () => {
  beforeEach(() => {
    axiosMocks.request.mockReset()
  })

  it('builds server-side pagination, search and category parameters', () => {
    const searchParams = buildProductListSearchParams({
      page: 2,
      pageSize: 10,
      search: '  teclado ',
      category: 'Perifericos',
    })

    expect(searchParams.toString()).toBe(
      '_page=2&_limit=10&nome_like=teclado&categoria=Perifericos',
    )
  })

  it('gets a mapped page and reads X-Total-Count', async () => {
    const signal = new AbortController().signal
    axiosMocks.request.mockResolvedValue(
      createAxiosResponse([apiProduct], {
        'x-total-count': '22',
      }),
    )

    await expect(
      getProducts({ page: 1, pageSize: 10 }, signal),
    ).resolves.toEqual({
      items: [
        {
          id: 1,
          name: 'Teclado Mecanico TKL',
          category: 'Perifericos',
          price: 349.9,
          stock: 15,
          active: true,
        },
      ],
      totalCount: 22,
    })

    const requestConfig = axiosMocks.request.mock.calls[0]?.[0]

    expect(requestConfig).toEqual(
      expect.objectContaining({
        method: 'GET',
        url: '/produtos',
        signal,
      }),
    )
    expect(requestConfig?.params).toBeInstanceOf(URLSearchParams)
  })

  it('rejects an invalid API response with a typed error', async () => {
    axiosMocks.request.mockResolvedValue(
      createAxiosResponse({ ...apiProduct, preco: '349.90' }),
    )

    await expect(getProductById(1)).rejects.toMatchObject({
      name: 'ApiError',
      code: 'INVALID_RESPONSE',
    })
  })

  it('turns unsuccessful HTTP responses into typed errors', async () => {
    axiosMocks.request.mockResolvedValue(
      createAxiosResponse(
        { message: 'Produto não encontrado.' },
        {},
        404,
      ),
    )

    await expect(getProductById(999)).rejects.toEqual(
      new ApiError({
        message: 'Produto não encontrado.',
        code: 'HTTP_ERROR',
        status: 404,
      }),
    )
  })

  it('sends mapped data when creating and updating a product', async () => {
    const productData: CreateProductData = {
      name: 'Novo teclado',
      category: 'Perifericos',
      price: 299.9,
      stock: 12,
      active: true,
    }
    const responseProduct: ProductApiDto = {
      id: 23,
      nome: 'Novo teclado',
      categoria: 'Perifericos',
      preco: 299.9,
      estoque: 12,
      ativo: true,
    }
    const expectedRequestData = {
      nome: 'Novo teclado',
      categoria: 'Perifericos',
      preco: 299.9,
      estoque: 12,
      ativo: true,
    }
    axiosMocks.request.mockResolvedValue(createAxiosResponse(responseProduct))

    await createProduct(productData)
    await updateProduct(23, productData)

    expect(axiosMocks.request).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        method: 'POST',
        url: '/produtos',
        data: expectedRequestData,
      }),
    )
    expect(axiosMocks.request).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        method: 'PUT',
        url: '/produtos/23',
        data: expectedRequestData,
      }),
    )
  })

  it('does not parse an empty DELETE response', async () => {
    axiosMocks.request.mockResolvedValue(createAxiosResponse('', {}, 204))

    await expect(deleteProduct(1)).resolves.toBeUndefined()
  })
})

function createAxiosResponse(
  data: unknown,
  headers: Record<string, string> = {},
  status = 200,
): AxiosResponse<unknown> {
  return {
    data,
    status,
    statusText: status < 300 ? 'OK' : 'Error',
    headers: new AxiosHeaders(headers),
    config: {
      headers: new AxiosHeaders(),
    },
  }
}
