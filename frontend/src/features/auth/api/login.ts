import { apiClient } from '../../../shared/api/client'

type LoginRequest = {
    email: string
    password: string
}

export function login(email: string, password: string) {
    const request: LoginRequest = {
        email,
        password,
    }

    return apiClient.post<void>('/auth/login', request)
}