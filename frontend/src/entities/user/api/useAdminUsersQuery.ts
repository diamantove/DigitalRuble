import { useQuery } from '@tanstack/react-query'
import { adminUsersQueryKey, getAdminUsers } from './adminUsers'

export function useAdminUsersQuery() {
    return useQuery({
        queryKey: adminUsersQueryKey,
        queryFn: getAdminUsers,
    })
}