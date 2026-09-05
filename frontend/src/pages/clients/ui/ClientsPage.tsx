import { useEffect, useState } from 'react'
import { getClients } from '../../../entities/client/api/getClients'
import type { Client } from '../../../entities/client/model/types'
import { formatParticipantId } from '../../../entities/client/lib/formatParticipantId'
import type { Wallet } from '../../../entities/wallet/model/types'
import { getWallets } from '../../../entities/wallet/model/api/getWallets'
import { formatAccountNumber } from '../../../entities/wallet/lib/formatAccountNumber'
import { AssignParticipantIdForm } from '../../../features/assign-participant-id/ui/AssignParticipantIdForm'

const statusNames: Record<string, string> = {
    prcs: 'Ожидает открытия',
    actv: 'Активен',
    blck: 'Заблокирован',
    clsd: 'Закрыт'
}

export function ClientsPage() {
    const [clients, setClients] = useState<Client[]>([])
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);

    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [walletsError, setWalletsError] = useState<string | null>(null);
    const [isWalletsLoading, setIsWalletsLoading] = useState<boolean>(false);

    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadClients() {
            try {
                setError(null)
                setIsLoading(true)

                const loadedClients = await getClients()
                setClients(loadedClients)

            } catch (error) {
                setError(error instanceof Error ? error.message : 'Не удалось загрузить клиентов.')

            } finally {
                setIsLoading(false)
            }
    }

        void loadClients()
    }, [])

    async function handleClientSelect(client: Client) {
        setSelectedClient(client);
        setWallets([]);
        setWalletsError(null);
        setIsWalletsLoading(true);

        try {
            const loadedWallets = await getWallets(client.mid);
            setWallets(loadedWallets);

        } catch (error) {
            setWalletsError(error instanceof Error ? error.message : 'Не удалось загрузить кошельки.');
        } finally {
            setIsWalletsLoading(false);
        }
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
    }

    if (isLoading) {
        return <main>Загрузка клиентов...</main>
    }

    if (error) {
        return (
            <main>
            <h1>Клиенты</h1>
            <p role="alert">{error}</p>
            </main>
        )
    }

    if (clients.length === 0) {
        return (
            <main>
            <h1>Клиенты</h1>
            <p>Клиентов пока нет.</p>
            </main>
        )
    }

    return (
        <main>
            <h1>Клиенты</h1>

            <ul>
            {clients.map((client) => (
                <li key={client.mid}>
                <strong>{client.fullName}</strong>
                    <button type="button"
                            onClick={() => handleClientSelect(client)}>
                        ID: {formatParticipantId(client.digitalRubleParticipantId)}
                        {client.fullName}
                    </button>
                </li>
            ))}

            {selectedClient &&
            <section>
                <h2>Данные клиента</h2>
                <p>MID: {selectedClient.mid}</p>
                <p>ФИО: {selectedClient.fullName}</p>
                <p>ИД ЦР: {formatParticipantId(selectedClient.digitalRubleParticipantId)}</p>

                <AssignParticipantIdForm
                    mid={selectedClient.mid}
                    onAssigned={handleParticipantIdAssigned}
                />

                <h2>Кошельки клиента</h2>

                {isWalletsLoading && <p>Загрузка кошельков...</p>}

                {walletsError && <p role="alert">{walletsError}</p>}

                {!isWalletsLoading && !walletsError && wallets.length === 0 && 
                    <p>У этого клиента нет кошельков.</p>
                }

                {!isWalletsLoading && !walletsError && wallets.length > 0 &&
                    <table>
                        <thead>
                            <tr>
                                <th>Код</th>
                                <th>Статус</th>
                                <th>Номер счёта</th>
                            </tr>
                        </thead>
                    
                        <tbody>
                            {wallets.map((wallet) => (
                                <tr key={wallet.code}>
                                    <td> key={wallet.code}</td>
                                    <td> {statusNames[wallet.status]}</td>
                                    <td> {formatAccountNumber(wallet.accountNumber)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                }   
            </section>
            }
            </ul>
        </main>
    )
}