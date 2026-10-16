import { RefreshCw, WalletCards } from 'lucide-react'
import { LogoutButton } from '../../../features/auth/ui/LogoutButton'
import { useSessionQuery } from '../../../entities/session/api/useSessionQuery'
import { getRoleLabel } from '../../../entities/session/lib/getRoleLabes'

type ClientsHeaderProps = {
    isRefreshing: boolean
    onRefresh: () => void
}

export function ClientsHeader({isRefreshing, onRefresh}: ClientsHeaderProps) {
    const sessionQuery = useSessionQuery()

    const user = sessionQuery.data
    
    return (
        <header className="header">
            <div className="logo">
                <div className="logo-mark">
                    <WalletCards size={24} />
                </div>

                Clients & Wallets
            </div>

            <div className="header-meta">
                {user && (
                    <div className="header-user">
                        <span className="header-user-name">{user.displayName}</span>
                        <span className="header-user-role">{getRoleLabel(user.roles)}</span>
                    </div>
                )}
                
                <LogoutButton />

                <button
                    className="icon-btn"
                    type="button"
                    title="Обновить"
                    aria-label="Обновить данные"
                    disabled={isRefreshing}
                    onClick={onRefresh}
                >
                    <RefreshCw
                        size={24}
                        className={isRefreshing ? 'icon-spin' : undefined}
                    />
                </button>
            </div>
        </header>
    )
}