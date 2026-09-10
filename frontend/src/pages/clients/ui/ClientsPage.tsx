import {useCallback, useState} from 'react'

import type { Client } from '../../../entities/client/model/types'
import type { Wallet } from '../../../entities/wallet/model/types'
import { clientsQueryKey } from '../../../entities/client/api/useClientsQuery'
import { walletsQueryKey } from '../../../entities/wallet/api/useWalletsQuery'

import { AssignParticipantIdModal } from '../../../features/assign-participant-id/ui'
import { SyncPlatformWalletModal } from '../../../features/sync-platform-wallet/ui'
import { UpdateWalletModal } from '../../../features/update-wallet/ui'

import { Toast } from '../../../shared/ui/toast'
import { ClientSummary } from '../../../widgets/client-summary'
import { ClientsHeader } from '../../../widgets/clients-header'
import { ClientsSidebar } from '../../../widgets/clients-sidebar'
import { WalletsTable } from '../../../widgets/wallets-table'
import { useClientsQuery } from '../../../entities/client/api/useClientsQuery'
import { useWalletsQuery } from '../../../entities/wallet/api/useWalletsQuery'
import { useQueryClient } from '@tanstack/react-query'

type ModalState =
    | { type: 'none' }
    | { type: 'assign-participant-id' }
    | { type: 'create-wallet' }
    | { type: 'update-wallet'
        wallet: Wallet }

export function ClientsPage() {
    const [modal, setModal] = useState<ModalState>({ type: 'none' })
    const [toastMessage, setToastMessage] = useState<string | null>(null)

    const queryClient = useQueryClient()

    const clientsQuery = useClientsQuery()
    const clients = clientsQuery.data ?? []
    const [selectedClientMid, setSelectedClientMid] = useState<string | null>(null)
    const selectedClient =
        clients.find((client) => client.mid === selectedClientMid) ??
        clients[0] ??
        null
    
    const walletsQuery = useWalletsQuery(selectedClient?.mid ?? null)
    const wallets = walletsQuery.data ?? []
    const isWalletsLoading = walletsQuery.isPending
    const walletsError = walletsQuery.error?.message ?? null;

    const isLoading = clientsQuery.isPending
    const error = clientsQuery.error
    
    const hasOpenWallet = wallets.some((wallet) => wallet.status !== 'clsd')

    const closeModal = useCallback(() => {
        setModal({ type: 'none' })
    }, [])

    async function handleRefreshClick() {
        await clientsQuery.refetch()
    }

    function handleClientSelect(client: Client) {
        setSelectedClientMid(client.mid)
    }

    function handleParticipantIdAssigned() {
        
        void queryClient.invalidateQueries({
            queryKey: clientsQueryKey,
        })

        closeModal()
        setToastMessage('ИД цифрого рубля сохранён.')
    }

    function handleWalletSynced() {
        if (selectedClientMid) {
            void queryClient.invalidateQueries({
                queryKey: walletsQueryKey(selectedClientMid),
            })
        }

        closeModal()
        setToastMessage('Кошелек создан.')
    }

    function handleWalletUpdated() {
        if (selectedClientMid) {
            void queryClient.invalidateQueries({
                queryKey: walletsQueryKey(selectedClientMid),
            })
        }

        closeModal()
        setToastMessage('Кошелек обновлён.')
    }

    if (isLoading) {
        return (
            <main className="page-state" aria-live="polite">
                <span className="loading-spinner" aria-hidden="true" />
                <span>Загрузка клиентов…</span>
            </main>
        )
    }

    if (error) {
        return (
            <main className="page-state">
                <h1>Не удалось загрузить клиентов</h1>

                <p role="alert">{error.message}</p>

                <button
                    className="btn-primary"
                    type="button"
                    onClick={() => void handleRefreshClick()}
                >
                    Повторить
                </button>
            </main>
        )
    }

    if (clients.length === 0) {
        return (
            <main className="page-state">
                <h1>Клиенты</h1>
                <p>Клиентов пока нет.</p>
            </main>
        )
    }

    return (
        <div className="page">
            <ClientsHeader
                isRefreshing={isLoading}
                onRefresh={() => void handleRefreshClick()}
            />

            <div className="layout">
                <ClientsSidebar
                    clients={clients}
                    selectedClient={selectedClient}
                    onSelect={handleClientSelect}
                />

                <main className="main">
                    {selectedClient ? (
                        <>
                            <ClientSummary
                                client={selectedClient}
                                onEdit={() =>
                                    setModal({ type: 'assign-participant-id' })
                                }
                            />

                            <WalletsTable
                                wallets={wallets}
                                isLoading={isWalletsLoading}
                                error={walletsError}
                                canCreate={!hasOpenWallet}
                                onCreate={() => setModal({ type: 'create-wallet' })}
                                onEdit={(wallet) =>
                                    setModal({type: 'update-wallet', wallet})
                                }
                            />
                        </>
                    ) : (
                        <section className="card empty">
                            Выберите клиента из списка.
                        </section>
                    )}
                </main>
            </div>

            {selectedClient && modal.type === 'assign-participant-id' && (
                <AssignParticipantIdModal
                    client={selectedClient}
                    onClose={closeModal}
                    onAssigned={handleParticipantIdAssigned}
                />
            )}

            {selectedClient && modal.type === 'create-wallet' && (
                <SyncPlatformWalletModal
                    client={selectedClient}
                    onClose={closeModal}
                    onSynced={handleWalletSynced}
                />
            )}

            {modal.type === 'update-wallet' && (
                <UpdateWalletModal
                    wallet={modal.wallet}
                    onClose={closeModal}
                    onUpdated={handleWalletUpdated}
                />
            )}

            <Toast
                message={toastMessage}
                onDismiss={() => setToastMessage(null)}
            />
        </div>
    )
}