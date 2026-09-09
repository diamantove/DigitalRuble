import {useCallback, useEffect, useState} from 'react'

import { getClients } from '../../../entities/client/api/getClients'
import type { Client } from '../../../entities/client/model/types'
import { getWallets } from '../../../entities/wallet/model/api/getWallets'
import type { Wallet } from '../../../entities/wallet/model/types'

import { AssignParticipantIdModal } from '../../../features/assign-participant-id/ui'
import { SyncPlatformWalletModal } from '../../../features/sync-platform-wallet/ui'
import { UpdateWalletModal } from '../../../features/update-wallet/ui'

import { Toast } from '../../../shared/ui/toast'
import { ClientSummary } from '../../../widgets/client-summary'
import { ClientsHeader } from '../../../widgets/clients-header'
import { ClientsSidebar } from '../../../widgets/clients-sidebar'
import { WalletsTable } from '../../../widgets/wallets-table'

type ModalState =
    | { type: 'none' }
    | { type: 'assign-participant-id' }
    | { type: 'create-wallet' }
    | { type: 'update-wallet'
        wallet: Wallet }

export function ClientsPage() {
    const [clients, setClients] = useState<Client[]>([])
    const [selectedClient, setSelectedClient] = useState<Client | null>(null)
    const [wallets, setWallets] = useState<Wallet[]>([])

    const [isLoading, setIsLoading] = useState(true)
    const [isWalletsLoading, setIsWalletsLoading] = useState(false)

    const [error, setError] = useState<string | null>(null)
    const [walletsError, setWalletsError] = useState<string | null>(null)

    const [modal, setModal] = useState<ModalState>({ type: 'none' })
    const [toastMessage, setToastMessage] = useState<string | null>(null)

    const closeModal = useCallback(() => {
        setModal({ type: 'none' })
    }, [])

    const loadWallets = useCallback(async (mid: string) => {
        setIsWalletsLoading(true)
        setWalletsError(null)
        setWallets([])

        try {
            const loadedWallets = await getWallets(mid)
            setWallets(loadedWallets)
        } catch (loadError) {
            setWalletsError(
                loadError instanceof Error ? loadError.message: 'Не удалось загрузить кошельки.')
        } finally {
            setIsWalletsLoading(false)
        }
    }, [])

    const loadClients = useCallback(async () => {
        try {
            const loadedClients = await getClients()

            setClients(loadedClients)

            const firstClient = loadedClients[0] ?? null
            setSelectedClient(firstClient)

            if (firstClient) {
                await loadWallets(firstClient.mid)
            } else {
                setWallets([])
                setWalletsError(null)
            }
        } catch (loadError) {
            setClients([])
            setSelectedClient(null)
            setWallets([])

            setError(loadError instanceof Error ? loadError.message : 'Не удалось загрузить клиентов.')
        } finally {
            setIsLoading(false)
        }
    }, [loadWallets])

    const handleRefreshClick = async () => {
        setIsLoading(true)
        setError(null)
        await loadClients()
    }

    useEffect(() => {
        void loadClients()
    }, [loadClients])

    async function handleClientSelect(client: Client) {
        setSelectedClient(client)
        await loadWallets(client.mid)
    }

    function handleParticipantIdAssigned(participantId: string) {
        if (!selectedClient) {
            return
        }

        const updatedClient: Client = {
            ...selectedClient,
            digitalRubleParticipantId: participantId,
        }

        setSelectedClient(updatedClient)

        setClients((currentClients) =>
            currentClients.map((client) =>
                client.mid === updatedClient.mid ? updatedClient : client,
            ),
        )

        closeModal()
        setToastMessage('Digital Ruble Participant ID сохранён.')
    }

    async function handleWalletSynced() {
        if (!selectedClient) {
            return
        }

        await loadWallets(selectedClient.mid)
        closeModal()
        setToastMessage('Кошелек создан.')
    }

    async function handleWalletUpdated() {
        if (!selectedClient) {
            return
        }

        await loadWallets(selectedClient.mid)
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

                <p role="alert">{error}</p>

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
                apiLabel="Подключено к API"
                onRefresh={() => void handleRefreshClick()}
            />

            <div className="layout">
                <ClientsSidebar
                    clients={clients}
                    selectedClient={selectedClient}
                    onSelect={(client) => void handleClientSelect(client)}
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