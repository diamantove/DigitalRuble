export const formatAccountNumber = (accountNumber: string | null): string => {
    return accountNumber?.trim() || 'Нет'
}