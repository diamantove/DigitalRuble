import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect } from 'react'

import { sessionQueryKey } from '../../../entities/session/api/useSessionQuery'
import { useQueryClient } from '@tanstack/react-query';

type ExternalAuthOutcome =
    | { kind: 'signed-in' }
    | { kind: 'linked' }
    | { kind: 'error'; message: string; showLogin: boolean }

function resolveOutcome(
    result: string | null,
    error: string | null,
): ExternalAuthOutcome | null {
    if (result === 'vk-id-signed-in') {
        return { kind: 'signed-in' }
    }

    if (result === 'vk-id-linked') {
        return { kind: 'linked' }
    }

    if (error === 'vk-id-not-linked') {
        return {
            kind: 'error',
            message: 'Этот VK ID не привязан ни к одному аккаунту. Войдите по почте и привяжите VK ID в профиле.',
            showLogin: true,
        }
    }

    if (error === 'account-blocked') {
        return {
            kind: 'error',
            message: 'Аккаунт заблокирован. Обратитесь к администратору.',
            showLogin: true,
        }
    }

    if (error === 'vk-id-failed') {
        return {
            kind: 'error',
            message: 'Не удалось войти через VK ID. Попробуйте ещё раз или войдите по почте.',
            showLogin: true,
        }
    }

    return null
}

export function AuthExternalPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const queryClient = useQueryClient()

    const outcome = resolveOutcome(
        searchParams.get('result'),
        searchParams.get('error'),
    )

    useEffect(() => {
        if (outcome?.kind === 'signed-in' || outcome?.kind === 'linked') {
            void queryClient.invalidateQueries({ queryKey: sessionQueryKey })
        }
    }, [outcome, queryClient])

    if (!outcome) {
        return <Navigate to="/" replace />
    }

    switch (outcome.kind) {
        case 'signed-in':
            return (
                <main className="page-state">
                    <h1>Вход выполнен</h1>
                    <p>Вы вошли через VK ID.</p>
                    <button className="btn-primary" type="button"
                        onClick={() => navigate('/', { replace: true })}>
                        Продолжить
                    </button>
                </main>
            )

        case 'linked':
            return (
                <main className="page-state">
                    <h1>VK ID привязан</h1>
                    <p>Аккаунт VK ID успешно привязан к вашему профилю.</p>
                    <button className="btn-primary" type="button"
                        onClick={() => navigate('/', { replace: true })}>
                        Продолжить
                    </button>
                </main>
            )

        case 'error':
            return (
                <main className="page-state">
                    <h1>Не удалось войти</h1>
                    <p role="alert">{outcome.message}</p>
                    <Link className="btn-primary" to="/login">Войти по почте</Link>
                </main>
            )
    }
}