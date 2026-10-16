import { apiClient } from '../../../shared/api/client'
import type { CurrentUser } from '../model/types'

export function getCurrentUser() {
    return apiClient.get<CurrentUser>('/auth/me')
}