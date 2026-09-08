import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'

import type { Client } from '../../../entities/client/model/types'
import { pluralizeRussian } from '../../../shared/lib/pluralizeRussian'

type ClientsSidebarProps = {
    clients: Client[]
    selectedClient: Client | null
    onSelect: (client: Client) => void
}

function getInitials(fullName: string) {
    return (
        fullName
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0])
            .join('')
            .toUpperCase() || '??'
    )
}

export function ClientsSidebar({clients, selectedClient, onSelect}: ClientsSidebarProps) {
    const [searchQuery, setSearchQuery] = useState('')

    const filteredClients = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase()

        if (!normalizedQuery) {
            return clients
        }

        return clients.filter((client) =>
            `${client.fullName} ${client.mid}`
                .toLowerCase()
                .includes(normalizedQuery),
        )
    }, [clients, searchQuery])

    return (
        <aside className="card sidebar">
            <div className="sidebar-head">
                <div className="section-title">Клиенты</div>

                <div className="section-subtitle">
                    {clients.length}{' '}
                    {pluralizeRussian(clients.length, [
                        'клиент',
                        'клиента',
                        'клиентов',
                    ])}
                </div>

                <label className="search">
                    <Search size={15} />

                    <span className="visually-hidden">
                        Поиск клиента по ФИО или MID
                    </span>

                    <input
                        type="search"
                        autoComplete="off"
                        placeholder="Поиск по ФИО или MID"
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                    />
                </label>
            </div>

            <div className="client-list">
                {filteredClients.length === 0 ? (
                    <div className="empty">Клиенты не найдены</div>
                ) : (
                    filteredClients.map((client, index) => (
                        <button className={`client-item ${selectedClient?.mid === client.mid ? 'active' : ''}`}
                            key={client.mid}
                            type="button"
                            onClick={() => onSelect(client)}
                        >
                            <div className="client-main">
                                <div className="avatar">
                                    {getInitials(client.fullName)}
                                </div>

                                <div className="client-text">
                                    <div className="client-name">
                                        {client.fullName}
                                    </div>

                                    <div className="client-mid">{client.mid}</div>
                                </div>

                                <div className="client-badge">{index + 1}</div>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </aside>
    )
}