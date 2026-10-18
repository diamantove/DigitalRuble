import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { logout } from '../api/logout'
import { useState } from 'react'

export function LogoutButton() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleLogoutClick() {
        try {
            setError(null)
            setIsLoggingOut(true)
            await logout()

            queryClient.clear()
            navigate('/login', { replace: true })
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Не удалось выйти.')
        } finally {
            setIsLoggingOut(false)
        }
    }

    return (
        <div className="header-logout">
            {error && <span className="header-logout-error" role="alert">{error}</span>}
            <button
                className="icon-btn"
                type="button"
                title={error ?? 'Выйти'}
                aria-label="Выйти из системы"
                disabled={isLoggingOut}
                onClick={() => void handleLogoutClick()}
            >
                <LogOut size={24} />
            </button>
        </div>
    )
}