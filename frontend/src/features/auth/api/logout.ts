import { apiClient } from '../../../shared/api/client'

export function logout() {
    return apiClient.delete<void>('/auth/logout')
}