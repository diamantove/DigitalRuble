import { apiClient } from '../../../shared/api/client'

export function logout() {
    return apiClient.post<void>('/auth/logout', undefined)
}