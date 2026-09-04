import { apiClient } from '../../../shared/api/client'
import type { Client } from '../model/types'

export function getClients() {
  return apiClient.get<Client[]>('/clients')
}