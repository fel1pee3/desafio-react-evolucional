import { z } from 'zod'

import { PRODUCT_CATEGORIES } from '../constants/productCategories'

export const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Nome é obrigatório.')
    .min(3, 'Nome deve ter pelo menos 3 caracteres.'),
  category: z.enum(PRODUCT_CATEGORIES, {
    error: 'Categoria é obrigatória.',
  }),
  price: z
    .number({ error: 'Preço é obrigatório.' })
    .positive('Preço deve ser maior que zero.'),
  stock: z
    .number({ error: 'Estoque é obrigatório.' })
    .int('Estoque deve ser um número inteiro.')
    .nonnegative('Estoque não pode ser negativo.'),
  active: z.boolean(),
})

export type ProductFormData = z.infer<typeof productSchema>
