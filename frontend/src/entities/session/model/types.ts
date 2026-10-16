export type UserRole = 'Admin' | 'Operator'

export type CurrentUser = {
    id: string
    email: string
    displayName: string
    roles: UserRole[]
}