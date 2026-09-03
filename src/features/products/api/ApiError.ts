export type ApiErrorCode =
  | 'HTTP_ERROR'
  | 'INVALID_REQUEST'
  | 'INVALID_RESPONSE'
  | 'NETWORK_ERROR'
  | 'REQUEST_CANCELLED'

type ApiErrorOptions = {
  message: string
  code: ApiErrorCode
  status?: number
  cause?: unknown
}

export class ApiError extends Error {
  readonly code: ApiErrorCode
  readonly status?: number

  constructor({ message, code, status, cause }: ApiErrorOptions) {
    super(message, { cause })
    this.name = 'ApiError'
    this.code = code
    this.status = status
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}
