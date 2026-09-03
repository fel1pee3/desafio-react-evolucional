import { zodResolver } from '@hookform/resolvers/zod'
import { useRef } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'

import {
  PRODUCT_CATEGORY_LABELS,
  PRODUCT_CATEGORIES,
} from '../constants/productCategories'
import {
  productSchema,
  type ProductFormData,
} from '../schemas/productSchema'

type ProductFormProps = {
  initialValues?: ProductFormData
  submitLabel: string
  submittingLabel: string
  isSaving: boolean
  apiError: string | null
  cancelTo: string
  cancelState?: unknown
  onSubmit: (data: ProductFormData) => Promise<void>
}

export function ProductForm({
  initialValues,
  submitLabel,
  submittingLabel,
  isSaving,
  apiError,
  cancelTo,
  cancelState,
  onSubmit,
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: initialValues ?? {
      name: '',
      active: true,
    },
  })
  const submitLockRef = useRef(false)
  const isBusy = isSaving || isSubmitting
  const handleValidSubmit = async (data: ProductFormData) => {
    if (submitLockRef.current) {
      return
    }

    submitLockRef.current = true

    try {
      await onSubmit(data)
    } finally {
      submitLockRef.current = false
    }
  }

  return (
    <form
      className="product-form"
      noValidate
      onSubmit={(event) => void handleSubmit(handleValidSubmit)(event)}
    >
      {apiError ? (
        <div className="alert alert--error" role="alert">
          {apiError}
        </div>
      ) : null}

      <div className="form-field">
        <label htmlFor="product-name">Nome</label>
        <input
          id="product-name"
          type="text"
          autoComplete="off"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? 'product-name-error' : undefined}
          disabled={isBusy}
          {...register('name')}
        />
        {errors.name ? (
          <span className="form-field__error" id="product-name-error">
            {errors.name.message}
          </span>
        ) : null}
      </div>

      <div className="form-field">
        <label htmlFor="product-category">Categoria</label>
        <select
          id="product-category"
          aria-invalid={Boolean(errors.category)}
          aria-describedby={
            errors.category ? 'product-category-error' : undefined
          }
          disabled={isBusy}
          {...register('category')}
        >
          <option value="">Selecione uma categoria</option>
          {PRODUCT_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {PRODUCT_CATEGORY_LABELS[category]}
            </option>
          ))}
        </select>
        {errors.category ? (
          <span className="form-field__error" id="product-category-error">
            {errors.category.message}
          </span>
        ) : null}
      </div>

      <div className="product-form__row">
        <div className="form-field">
          <label htmlFor="product-price">Preço</label>
          <input
            id="product-price"
            type="number"
            min="0.01"
            step="0.01"
            inputMode="decimal"
            aria-invalid={Boolean(errors.price)}
            aria-describedby={
              errors.price ? 'product-price-error' : undefined
            }
            disabled={isBusy}
            {...register('price', { valueAsNumber: true })}
          />
          {errors.price ? (
            <span className="form-field__error" id="product-price-error">
              {errors.price.message}
            </span>
          ) : null}
        </div>

        <div className="form-field">
          <label htmlFor="product-stock">Estoque</label>
          <input
            id="product-stock"
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            aria-invalid={Boolean(errors.stock)}
            aria-describedby={
              errors.stock ? 'product-stock-error' : undefined
            }
            disabled={isBusy}
            {...register('stock', { valueAsNumber: true })}
          />
          {errors.stock ? (
            <span className="form-field__error" id="product-stock-error">
              {errors.stock.message}
            </span>
          ) : null}
        </div>
      </div>

      <div className="form-field form-field--checkbox">
        <input
          id="product-active"
          type="checkbox"
          disabled={isBusy}
          {...register('active')}
        />
        <label htmlFor="product-active">Produto ativo</label>
      </div>

      <div className="product-form__actions">
        <Link
          className="button button--secondary"
          to={cancelTo}
          state={cancelState}
          aria-disabled={isBusy || undefined}
          tabIndex={isBusy ? -1 : undefined}
          onClick={(event) => {
            if (isBusy) {
              event.preventDefault()
            }
          }}
        >
          Cancelar
        </Link>
        <button className="button button--primary" type="submit" disabled={isBusy}>
          {isBusy ? submittingLabel : submitLabel}
        </button>
      </div>
    </form>
  )
}
