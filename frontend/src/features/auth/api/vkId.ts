import { apiClient, apiUrl } from '../../../shared/api/client'

export const vkIdLoginUrl = `${apiUrl}/auth/vk-id/login`
export const vkIdLinkUrl = `${apiUrl}/auth/vk-id/link`

export function unlinkVkId() {
    return apiClient.delete<void>('/auth/vk-id')
}