import { NavLink } from 'react-router-dom'
import { WalletCards } from 'lucide-react'

import { LogoutButton } from '../../../features/auth/ui/LogoutButton'
import { sessionQueryKey, useSessionQuery } from '../../../entities/session/api/useSessionQuery'
import { getRoleLabel } from '../../../entities/session/lib/getRoleLabels'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { unlinkVkId, vkIdLinkUrl } from '../../../features/auth/api/vkId'

export function AppHeader() {
    const { data: user } = useSessionQuery()
    const queryClient = useQueryClient()
    const [unlinkError, setUnlinkError] = useState<string | null>(null)
    const isAdmin = user?.roles.includes('Admin') ?? false

    const unlinkMutation = useMutation({
        mutationFn: unlinkVkId,
        onSuccess: async () => {
            setUnlinkError(null)
            await queryClient.invalidateQueries({ queryKey: sessionQueryKey })
        },
        onError: (error: Error) => {
            setUnlinkError(error.message)
        },
    })

    function handleUnlinkVkId() {
        if (!window.confirm('Отвязать VK ID от аккаунта?')) {
            return
        }

        unlinkMutation.mutate()
    }

    return (
        <header className="app-header">
            <div className="app-header-top">
                <div className="logo">
                    <div className="logo-mark" aria-hidden="true">
                        <WalletCards size={22} />
                    </div>
                    <span>Clients & Wallets</span>
                </div>

                <div className="header-meta">
                    {user && (
                        <div className="header-user">
                            <span className="header-user-name">{user.displayName}</span>
                            <span className="header-user-role">{getRoleLabel(user.roles)}</span>
                        </div>
                    )}

                    {user && (
                        <div className="vk-id-settings">
                            {user.isVkIdLinked ? (
                                <>
                                    <span>VK ID привязан</span>
                                    <button
                                        className="btn-secondary"
                                        type="button"
                                        onClick={handleUnlinkVkId}
                                        disabled={unlinkMutation.isPending}
                                    >
                                        {unlinkMutation.isPending ? 'Отвязываем…' : 'Отвязать'}
                                    </button>
                                </>
                            ) : (
                                <a className="btn-secondary" href={vkIdLinkUrl}>
                                    Привязать VK ID
                                </a>
                            )}

                            {unlinkError && <span role="alert">{unlinkError}</span>}
                        </div>
                    )}

                    <LogoutButton />
                </div>
            </div>

            {isAdmin && (
                <nav className="section-nav" aria-label="Разделы">
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) =>
                            `section-nav-link${isActive ? ' active' : ''}`
                        }
                    >
                        Клиенты и кошельки
                    </NavLink>
                    <NavLink
                        to="/admin/users"
                        className={({ isActive }) =>
                            `section-nav-link${isActive ? ' active' : ''}`
                        }
                    >
                        Операторы
                    </NavLink>
                </nav>
            )}
        </header>
    )
}