import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { logout } from '../api/logout'
import { useState } from 'react'

export function LogoutButton() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const [isLoggingOut, setIsLoggingOut] = useState(false)

    async function handleLogoutClick() {
        try {
            setIsLoggingOut(true)
            await logout()

            queryClient.clear()
            navigate('/login', { replace: true })
        } finally {
            setIsLoggingOut(false)
        }
    }

    return (
        <button
            className="icon-btn"
            type="button"
            title="Выйти"
            aria-label="Выйти из системы"
            disabled={isLoggingOut}
            onClick={() => void handleLogoutClick()}
        >
            <LogOut size={24} />
        </button>
    )
}