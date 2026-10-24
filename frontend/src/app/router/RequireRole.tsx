import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

import { useSessionQuery } from '../../entities/session/api/useSessionQuery'
import type { UserRole } from '../../entities/session/model/types'

type RequireRoleProps = {
    role: UserRole
    children: ReactNode
}

export function RequireRole({ role, children }: RequireRoleProps) {
    const sessionQuery = useSessionQuery()

    if (sessionQuery.isPending) {
        return (
            <main className="page-state" aria-live="polite">
                <span className="loading-spinner" aria-hidden="true" />
                <span>Проверка прав доступа...</span>
            </main>
        )
    }

    if (!sessionQuery.data?.roles.includes(role)) {
        return <Navigate to="/" replace />
    }

    return children
}