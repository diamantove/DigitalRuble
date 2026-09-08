import { RefreshCw, WalletCards } from 'lucide-react'

type ClientsHeaderProps = {
    isRefreshing: boolean
    apiLabel: string
    onRefresh: () => void
}

export function ClientsHeader({isRefreshing, apiLabel, onRefresh}: ClientsHeaderProps) {
    return (
        <header className="header">
            <div className="logo">
                <div className="logo-mark">
                    <WalletCards size={19} />
                </div>

                Clients & Wallets
            </div>

            <div className="header-meta">
                <div className="api-pill">
                    <span className="dot" />
                    <span>{apiLabel}</span>
                </div>

                <button
                    className="icon-btn"
                    type="button"
                    title="Обновить"
                    aria-label="Обновить данные"
                    disabled={isRefreshing}
                    onClick={onRefresh}
                >
                    <RefreshCw
                        size={17}
                        className={isRefreshing ? 'icon-spin' : undefined}
                    />
                </button>
            </div>
        </header>
    )
}