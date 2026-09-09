import {ChevronRight, Plus} from 'lucide-react'

import { formatAccountNumber } from '../../../entities/wallet/lib/formatAccountNumber'
import { getWalletStatusMeta } from '../../../entities/wallet/lib/getWalletStatusMeta'
import type { Wallet } from '../../../entities/wallet/model/types'
import { pluralizeRussian } from '../../../shared/lib/pluralizeRussian'

type WalletsTableProps = {
    wallets: Wallet[]
    isLoading: boolean
    error: string | null
    onCreate: () => void
    onEdit: (wallet: Wallet) => void
}

export function WalletsTable({wallets, isLoading, error, onCreate, onEdit}: WalletsTableProps) {
    function handleRowKeyDown(event: React.KeyboardEvent<HTMLTableRowElement>, wallet: Wallet) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onEdit(wallet)
        }
    }

    return (
        <section className="card wallets-card">
            <div className="wallets-head">
                <div>
                    <h2 className="wallets-title">Кошельки</h2>

                    <p className="wallets-subtitle">
                        {wallets.length}{' '}
                        {pluralizeRussian(wallets.length, [
                            'кошелек',
                            'кошелька',
                            'кошельков',
                        ])}
                        {' · '}
                        нажмите на строку для редактирования
                    </p>
                </div>

                <button
                    className="btn-primary"
                    type="button"
                    onClick={onCreate}
                >
                    <Plus size={24} />
                    Создать кошелек
                </button>
            </div>

            <div className="table-wrap">
                {isLoading && <div className="empty">Загрузка кошельков…</div>}

                {!isLoading && error && <div className="empty" role="alert"> {error} </div>}

                {!isLoading && !error && wallets.length === 0 && (
                    <div className="empty">
                        У клиента пока нет кошельков.
                        <br />
                        Создайте первый кошелек кнопкой выше.
                    </div>
                )}

                {!isLoading && !error && wallets.length > 0 && (
                    <table>
                        <thead>
                            <tr>
                                <th>Код кошелька</th>
                                <th>Статус</th>
                                <th>Номер счёта</th>
                                <th aria-label="Действие" />
                            </tr>
                        </thead>

                        <tbody>
                            {wallets.map((wallet) => {
                                const status = getWalletStatusMeta(wallet.status)

                                return (
                                    <tr
                                        key={wallet.code}
                                        tabIndex={0}
                                        role="button"
                                        aria-label={`Редактировать кошелек ${wallet.code}`}
                                        onClick={() => onEdit(wallet)}
                                        onKeyDown={(event) =>
                                            handleRowKeyDown(event, wallet)
                                        } 
                                    >
                                        <td>
                                            <span className="wallet-code mono">
                                                {wallet.code}
                                            </span>
                                        </td>

                                        <td>
                                            <span className={`status-pill ${status.className}`}>
                                                <span className="status-dot" />
                                                {status.label}
                                            </span>
                                        </td>

                                        <td>
                                            <span className="account mono">
                                                {formatAccountNumber(wallet.accountNumber)}
                                            </span>
                                        </td>

                                        <td>
                                            <ChevronRight
                                                className="row-arrow"
                                                size={22}
                                            />
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </section>
    )
}