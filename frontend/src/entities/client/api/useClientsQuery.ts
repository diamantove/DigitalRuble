import { useQuery } from '@tanstack/react-query'

import { getClients } from './getClients'

export const clientsQueryKey = ['clients'] as const

export function useClientsQuery() {
    return useQuery({
        queryKey: clientsQueryKey,
        queryFn: getClients,
    })
}