import { useEffect, useState } from 'react'
import { getClients } from '../../../entities/client/api/getClients'
import type { Client } from '../../../entities/client/model/types'
import { formatParticipantId } from '../../../entities/client/lib/formatParticipantId'

export function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
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
            <div>MID: {client.mid}</div>
            <div>ФИО: {client.fullName}</div>
            <div>ИД ЦР: {formatParticipantId(client.digitalRubleParticipantId)}</div>
          </li>
        ))}
      </ul>
    </main>
  )
}