import { apiClient } from '../../../shared/api/client'
import type { AdminUser, CreateOperatorRequest } from '../model/types'

export const adminUsersQueryKey = ['admin-users'] as const

export function getAdminUsers() {
    return apiClient.get<AdminUser[]>('/admin/users')
}

export function createOperator(request: CreateOperatorRequest) {
    return apiClient.post<void>('/admin/users/operators', request)
}

export function blockUser(userId: string) {
    return apiClient.patch<void>(`/admin/users/${userId}/block`, {})
}

export function unblockUser(userId: string) {
    return apiClient.patch<void>(`/admin/users/${userId}/unblock`, {})
}