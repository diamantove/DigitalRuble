export class ApiError extends Error {
  constructor(message: string, public readonly status: number,) {
    super(message)

    this.name = 'ApiError'
  }
}

type ProblemDetails = {
  detail?: string
  title?: string
  errors?: Record<string, string[]>
}

const apiUrl = import.meta.env.VITE_API_URL

if (!apiUrl) {
  throw new Error('Не задана переменная VITE_API_URL.')
}

function parseProblemDetails(body: string): ProblemDetails | null {
  if (!body.trim()) {
    return null
  }

  try {
    const parsed: unknown = JSON.parse(body)

    if (!parsed || typeof parsed !== 'object') {
      return null
    }

    return parsed as ProblemDetails
  } catch {
    return null
  }
}

function getErrorMessage(response: Response, body: string): string {
  const problemDetails = parseProblemDetails(body)

  const validationErrors = problemDetails?.errors
    ? Object.values(problemDetails.errors).flat().join(' ')
    : undefined

  const apiMessage = problemDetails?.detail ?? validationErrors ?? problemDetails?.title

  if (apiMessage?.trim()) {
    return apiMessage
  }

  const statusText = response.statusText ? ` ${response.statusText}` : ''

  const statusMessage = `HTTP ${response.status}${statusText}`
  const plainBody = body.trim()

  const isHtml = /^\s*(<!doctype|<html\b)/i.test(plainBody)

  if (plainBody && !isHtml) {
    return `${statusMessage}: ${plainBody.slice(0, 200)}`
  }

  return `Ошибка API (${statusMessage}).`
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${apiUrl}${path}`, init)
    const body = await response.text()

    if (!response.ok) {
      throw new ApiError(getErrorMessage(response, body), response.status)
    }

    if (response.status === 204) {
      return undefined as T
    }

    if (!body.trim()) {
      throw new ApiError(
                `Сервер вернул пустой ответ вместо JSON (HTTP ${response.status}).`,
                response.status)
    }

    try {
        const data: unknown = JSON.parse(body)

        if (data === null) {
            throw new ApiError(
                `Сервер вернул JSON null вместо ожидаемых данных (HTTP ${response.status}).`,
                response.status)
        }

        return data as T

        } catch {
        throw new ApiError(
            `Сервер вернул некорректный JSON (HTTP ${response.status}).`,
            response.status)
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    if (error instanceof TypeError) {
      throw new Error('Не удалось подключиться к API.')
    }

    throw error
  }
}

export const apiClient = {
    get: <T>(path: string) => request<T>(path),
}