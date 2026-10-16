import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { useSessionQuery } from '../../entities/session/api/useSessionQuery'
import { ApiError } from '../../shared/api/client'

type RequireAuthProps = {
    children: ReactNode
}

export function RequireAuth({ children }: RequireAuthProps) {
    const sessionQuery = useSessionQuery()
    const location = useLocation()

    if (sessionQuery.isPending) {
        return (
            <main className="page-state" aria-live="polite">
                <span className="loading-spinner" aria-hidden="true" />
                <span>Проверка входа...</span>
            </main>
        )
    }

    if (sessionQuery.isError) {
        const error = sessionQuery.error

        // 401 — не авторизован: на экран входа с запоминанием адреса
        if (error instanceof ApiError && error.status === 401) {
            return (
                <Navigate
                    to="/login"
                    replace
                    state={{ from: location.pathname }}
                />
            )
        }

        // сеть/500 — не выкидываем на логин, даём повторить
        return (
            <main className="page-state">
                <h1>Не удалось проверить вход</h1>

                <p role="alert">{error.message}</p>

                <button
                    className="btn-primary"
                    type="button"
                    onClick={() => void sessionQuery.refetch()}
                >
                    Повторить
                </button>
            </main>
        )
    }

    return children
}