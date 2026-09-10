import { useQuery } from '@tanstack/react-query'

import { getWallets } from './getWallets'

export function walletsQueryKey(mid: string) {
    return ['clients', mid, 'wallets'] as const
}

export function useWalletsQuery(mid: string | null) {
    return useQuery({
        queryKey: mid ? walletsQueryKey(mid) : ['clients', 'no-selection', 'wallets'],
        queryFn: () => getWallets(mid!),
        enabled: mid !== null,
    })
}