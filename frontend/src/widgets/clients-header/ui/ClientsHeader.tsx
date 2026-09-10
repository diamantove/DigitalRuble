import { RefreshCw, WalletCards } from 'lucide-react'

type ClientsHeaderProps = {
    isRefreshing: boolean
    onRefresh: () => void
}

export function ClientsHeader({isRefreshing, onRefresh}: ClientsHeaderProps) {
    return (
        <header className="header">
            <div className="logo">
                <div className="logo-mark">
                    <WalletCards size={24} />
                </div>

                Clients & Wallets
            </div>

            <div className="header-meta">
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