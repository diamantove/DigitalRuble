import { NavLink } from 'react-router-dom'
import { WalletCards } from 'lucide-react'

import { LogoutButton } from '../../../features/auth/ui/LogoutButton'
import { useSessionQuery } from '../../../entities/session/api/useSessionQuery'
import { getRoleLabel } from '../../../entities/session/lib/getRoleLabels'

export function AppHeader() {
    const { data: user } = useSessionQuery()
    const isAdmin = user?.roles.includes('Admin') ?? false

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