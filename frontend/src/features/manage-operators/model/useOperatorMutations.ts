import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
    adminUsersQueryKey,
    blockUser,
    createOperator,
    unblockUser,
} from '../../../entities/user/api/adminUsers'

export function useOperatorMutations() {
    const queryClient = useQueryClient()

    function refreshUsers() {
        return queryClient.invalidateQueries({ queryKey: adminUsersQueryKey })
    }

    const create = useMutation({
        mutationFn: createOperator,
        onSuccess: refreshUsers,
    })

    const block = useMutation({
        mutationFn: blockUser,
        onSuccess: refreshUsers,
    })

    const unblock = useMutation({
        mutationFn: unblockUser,
        onSuccess: refreshUsers,
    })

    return { create, block, unblock }
}