import { useQuery } from '@tanstack/react-query'

import { getCurrentUser } from './getCurrentUser'

export const sessionQueryKey = ['session'] as const

export function useSessionQuery() {
    return useQuery({
        queryKey: sessionQueryKey,
        queryFn: getCurrentUser,
        retry: false,
        staleTime: 5 * 60 * 1000,
    })
}