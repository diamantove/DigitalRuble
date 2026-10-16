import { Mail, Lock, LogIn } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'

import { sessionQueryKey, useSessionQuery } from '../../../entities/session/api/useSessionQuery'
import { login } from '../../../features/auth/api/login'
import { vkIdLoginUrl } from '../../../features/auth/api/vkId'
import { useQueryClient } from '@tanstack/react-query'

export function LoginPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const queryClient = useQueryClient()

    const sessionQuery = useSessionQuery()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    if (sessionQuery.data) {
        return <Navigate to="/" replace />
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const trimmedEmail = email.trim()

        if (!trimmedEmail || !password) {
            setError('Введите почту и пароль.')
            return
        }

        try {
            setError(null)
            setIsSubmitting(true)

            await login(trimmedEmail, password)
            await queryClient.invalidateQueries({ queryKey: sessionQueryKey })

            const from = (location.state as { from?: string } | null)?.from
            navigate(from ?? '/', { replace: true })
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Не удалось выполнить вход.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <main className="page-state login-page">
            <div className="login-card card">
                <h1>Вход</h1>

                <form onSubmit={handleSubmit}>
                    <div className="form-field">
                        <label htmlFor="login-email">Почта</label>

                        <div className="input-wrap">
                            <Mail size={24} />

                            <input
                                id="login-email"
                                type="email"
                                autoComplete="username"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                disabled={isSubmitting}
                                required
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="form-field">
                        <label htmlFor="login-password">Пароль</label>

                        <div className="input-wrap">
                            <Lock size={24} />

                            <input
                                id="login-password"
                                type="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                disabled={isSubmitting}
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <p className="form-error" role="alert">{error}</p>
                    )}

                    <button
                        className="btn-primary login-submit"
                        type="submit"
                        disabled={isSubmitting}
                    >
                        <LogIn size={24} />
                        {isSubmitting ? 'Вход...' : 'Войти'}
                    </button>
                </form>

                <div className="login-divider"><span>или</span></div>

                <a className="btn-secondary login-vk" href={vkIdLoginUrl}>
                    Войти с VK ID
                </a>
            </div>
        </main>
    )
}