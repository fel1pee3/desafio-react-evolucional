import { z } from 'zod'
import type { ProductApiDto } from '../types/product'

const productApiDtoSchema: z.ZodType<ProductApiDto> = z.object({
  id: z.number().int().positive(),
  nome: z.string(),
  categoria: z.string(),
  preco: z.number(),
  estoque: z.number().int(),
  ativo: z.boolean(),
})

export const productApiResponseSchema = productApiDtoSchema
export const productsApiResponseSchema = z.array(productApiDtoSchema)
