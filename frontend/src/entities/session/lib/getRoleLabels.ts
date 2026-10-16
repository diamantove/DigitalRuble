export function getRoleLabel(roles: readonly string[]): string {
    if (roles.includes('Admin')) {
        return 'Администратор'
    }

    if (roles.includes('Operator')) {
        return 'Оператор'
    }

    return 'Без роли'
}