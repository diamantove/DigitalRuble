export type AdminUser = {
    id: string
    email: string
    displayName: string
    roles: string[]
    isBlocked: boolean
}

export type CreateOperatorRequest = {
    email: string
    password: string
    displayName: string
}